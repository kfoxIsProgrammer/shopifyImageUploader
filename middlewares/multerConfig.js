const multer = require("multer");
const util = require("util");
const path = require("path");

var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, "/uploads"));
  },
  filename: (req, file, callback) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      var message = file.originalname + "is invalid. Only accept png/jpeg.";
      return callback(message, null);
    }

    //This will create errors if the names are not unique
    var filename = Date.now() + "-" + file.originalname;
    callback(null, filename);
  },
});

var upload = multer({ storage: storage }).array("multi-files", 10);
var uploadFilesMiddleware = util.promisify(upload);
module.exports.upload = upload;
