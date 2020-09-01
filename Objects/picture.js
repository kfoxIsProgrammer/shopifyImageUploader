var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");

var schema = new Schema({
  imageName: { type: String, required: true },
  localImagePath: { type: String, required: true },
  cloudImagePath: { type: String },
  dateMade: { type: Date, required: true, default: Date.now },
  userOwned: { type: String, require: true },
  permission: { type: Boolean, require: true },
  ImgTags: {
    type: Object,
  },
});

autoIncrement.initialize(mongoose.connection);
schema.plugin(autoIncrement.plugin, "Picture");

module.exports = mongoose.model("Picture", schema);
