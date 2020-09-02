var Picture = require('../Objects/picture');

var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/image-repo', {useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex: true});

var pics = [
new Picture({
  "_id": 1,
  "imageName": "sun",
  "imagePath": "C:/Users/kevin/Desktop/image-repo2/img/sun.jpg",
  "ImgTags": {
    "Sun": 0.9458,
    "Astronomical object": 0.9368,
    "Astronomy": 0.9215,
    "Amber": 0.8233,
    "Sphere": 0.7978,
    "Outer space": 0.7549,
    "Heat": 0.7173,
    "Science": 0.7144,
    "Planet": 0.6684,
    "Universe": 0.6303,
    "Space": 0.6133,
    "Circle": 0.5631
  },
  "dateMade": {
    "$date": ""
  },
  "userOwned": "Keviniscool",
  "permission": true,
  "__v": 0
}),
new Picture({
  "_id": 2,
  "imageName": "sun.jpg",
  "imagePath": "C:/Users/kevin/Desktop/image-repo2/img/sun.jpg",
  "ImgTags": {
    "Sun": 0.9458,
    "Astronomical object": 0.9368,
    "Astronomy": 0.9215,
    "Amber": 0.8233,
    "Sphere": 0.7978,
    "Outer space": 0.7549,
    "Heat": 0.7173,
    "Science": 0.7144,
    "Planet": 0.6684,
    "Universe": 0.6303,
    "Space": 0.6133,
    "Circle": 0.5631
  },
  "dateMade": {
    "$date": ""
  },
  "userOwned": "kevin",
  "permission": false,
  "__v": 0
})
];

var done =0;
for(var i =0; i < pics.length; i++)
{
	pics[i].save(function(err,result)
		{
			console.log(err);
			console.log(result);
			done++;
			if(done === pics.length)
			{
				exit();
			}
		});
}

function exit(){
	mongoose.connection.close();
}