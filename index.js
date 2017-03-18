var express = require('express');
var bodyParser = require('body-parser');
var firebase = require('firebase');
var fs = require('fs');

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

app.use(bodyParser.json());

app.use(express.static('files'));

app.get('/', function(req, res) {
  res.json({home: 'home'})
})

app.get('/images', function(req, res) {
  var images = require('./images');
  res.json(images);
})

// function decodeBase64Image(dataString) {
//   var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
//   var response = {};
//
//   if (matches.length !== 3) {
//     return new Error('Invalid input string');
//   }
//
//   response.type = matches[1];
//   response.data = new Buffer(matches[2], 'base64');
//
//   return response;
// }

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
  //   // console.log('imageBuffer.data', imageBuffer.data);
  //   console.log('image_string', image_string);
  //
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



app.listen(process.env.PORT || '4000', function() {
  console.log(`Express server listening on port ${this.address().port} in ${app.settings.env} mode.`)
})
