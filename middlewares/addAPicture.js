var cloudinary = require("cloudinary");
var Picture = require("../Objects/picture.js");
const mongoose = require("mongoose");

//Configuration of cloudinary API
cloudinary.config({
  cloud_name: "kfox-image-repo",
  api_key: "798871349999877",
  api_secret: "Redacted for my safety",
});

//MongoDB string
var mongoDB = "mongodb://127.0.0.1/image-repo";

//Creates the picture object to be manipulated before create operation
module.exports.startImgPreprocess = function (name, url, user, permission) {
  var picture = new Picture({
    imageName: name,
    localImagePath: url,
    dateMade: new Date(),
    userOwned: user,
    permission: permission,
  });
  getImgTags(picture);
};

//Upload the picture to cloudinary to get automated image tags for indexing later
async function getImgTags(picture) {
  cloudinary.v2.uploader.upload(
    picture.localImagePath,
    {
      public_id: picture.imageName,
      categorization: "google_tagging",
    },
    function (err, image) {
      console.log();
      if (err) {
        //Picture did not upload properly
        console.warn(err);
      }

      //Find the picture on cludinary and get the picture contents
      cloudinary.api.resource(image.public_id, function (result) {
        buildImgForDB(picture, result);
      });
    }
  );
}

//Once tags are generated, then add local and cloud info to MongoDB
function buildImgForDB(picture, image) {
  console.log("Building Picture object");

  //Get the tags from cloudinary and put them in object
  var tags = image.info.categorization.google_tagging.data;
  var tagmap = new Map();

  for (var i = 0; i < tags.length; i++) {
    tagmap.set(tags[i].tag, tags[i].confidence);
  }

  //Adding Tags from cloudinary to the picture obj
  //Add url for retrieval from cloudinary

  picture.ImgTags = tagmap;
  picture.cloudImagePath = image.url;

  //open mongodb connection for each picture
  //This will need to be limited by some way in the future
  mongoose.connect(mongoDB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

  //Save the picture object to mongoDB collection
  picture.save(function (err) {
    if (err) {
      console.log(err);
      mongoose.connection.close(); //Save resources
      throw new Error(err);
    } else {
      console.log("saved image");
      mongoose.connection.close(); //Save resources
    }
  });
}
