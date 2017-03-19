var express = require('express');
var bodyParser = require('body-parser');
var firebase = require('firebase');
var fs = require('fs');
var FormData = require('form-data');
var fetch = require('node-fetch');

var config = {
    apiKey: "AIzaSyCBXjXTPiYdH5YmwjqGkYEBc3P3oRSEs8U",
    authDomain: "socialest-f3e42.firebaseapp.com",
    databaseURL: "https://socialest-f3e42.firebaseio.com",
    storageBucket: "socialest-f3e42.appspot.com",
    messagingSenderId: "171671691972"
};

var firebaseApp = firebase.initializeApp(config);
var images_ref = firebase.database().ref().child('images');
var groups_ref = firebase.database().ref().child('groups');

var app = express();

app.use(bodyParser.json({limit: '50mb'}));

app.use('/images', express.static('images'));

app.get('/', function(req, res) {
  res.json({home: 'home'})
})

app.get('/images', function(req, res) {
  var images = require('./images');
  res.json(images);
})

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  var response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

// one post request, send image,
// then sends back the aggregated image
// app.post...
app.post('/post_image', function(req, res) {
  console.log('aggregate the image!');

  // console.log('req.body', req.body);

  let { image } = req.body;

  images_ref.push({image});

  // images_ref.once('value', snap => {
  //   let images = [];
  //   snap.forEach(i => {
  //     const f_image = i.val().image;
  //     images.push(f_image);
  //   })
  //   console.log('images.length', images.length);
  //   var image_string = './images/image_' + images.length + '.png';
  // //   // console.log('imageBuffer.data', imageBuffer.data);
  // //   console.log('image_string', image_string);
  // //
  //   fs.writeFile(image_string, imageBuffer.data, function(err) {
  //     console.log('well actually check the folder');
  //   })
  // })
  // // write the file to the images folder on the local system, which will be hosted on heroku
  res.json({success: 'success'})

})

// example post to group_image
/*
{
  group: 'name',
  image: 'base64asldkfjasdlkfjalsdf'
}

*/

app.post('/group_image', function(req, res) {
  console.log('upload to a group');

  let { image, group } = req.body;

  let group_ref = groups_ref.child(group);
  group_ref.push(image);

  res.json({success: 'success'})
})



// function getImageFormData(base64_url) {
//   const formData = new FormData();




  // turn this base64_url into a png type
  // {}
  //
  // return {path};
  // formData.append("file", { uri: path, type: "image/png" });
  // return formData;
// }
/*
POST

{
  "image": "base64asdkflasdjfalksdfj...."
}
*/

app.post('/image_desc', function(req, orig_res) {
  let {image} = req.body;


  // convert to image

  var imageBuffer = decodeBase64Image(image);


  var path = '/images/image.png'
  // create a png path
  fs.writeFile('.' + path, imageBuffer.data, function() {
    console.log('getting face data');

    var http = require("https");

    var options = {
      "method": "POST",
      "hostname": "westus.api.cognitive.microsoft.com",
      "port": null,
      "path": "/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age%2Cgender%2Csmile%2CfacialHair%2Cemotion",
      "headers": {
        "content-type": "application/json",
        "ocp-apim-subscription-key": "e94b8bd5ec3941dc8b0f085b576edb00",
        "cache-control": "no-cache",
        "postman-token": "561c4a8d-5bf9-5327-ca27-1402493e328d"
      }
    };

    var req = http.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        var body = Buffer.concat(chunks);
        console.log('resulting body', body.toString(), 'stringified');

        orig_res.json({success: JSON.parse(body.toString())})
      });
    });

    // TODO change to heroku and indent well
    req.write(JSON.stringify({ url: './images/image.png' }))
    req.end();
  })

})



app.listen(process.env.PORT || '4000', function() {
  console.log(`Express server listening on port ${this.address().port} in ${app.settings.env} mode.`)
})
