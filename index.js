const express = require("express");
const app = express();
const port = 3010;
const https = require("https");
const fss = require("fs");
const bodyParser = require("body-parser");
const helmet = require("helmet"); //Usage for potential http attacks.  OWASP
const rateLimit = require("express-rate-limit"); //Used to protect from single user ddos attacks
const multer = require("multer");
const util = require("util");
const path = require("path");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");

//Created middlewares
const winstonConfig = require("./middlewares/winston.js");
const imageProcess = require("./middlewares/addAPicture.js");

//The addition of passport and csurf would be used once a log in process is implemented
//OWASP

//Rate limiter to protect resources
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

//Storage setup for images, as well as methods
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

    var filename = Date.now() + "-" + file.originalname;
    callback(null, filename);
  },
});

var upload = multer({ storage: storage }).array("multi-files", 10);
var uploadFilesMiddleware = util.promisify(upload);

//Creating csrf config
const csrfProtection = csrf({
  cookie: true,
  secure: true,
});

//Middleware
app.use(express.static(__dirname + "/resources"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(csrfProtection);
app.use(limiter);

//View engine, I prefer ejs over, jade or handlebars
app.set("view engine", "ejs");

//Setting up Helmet for xss and other vulnerabilities OWASP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        scriptSrc: [
          "'self'",
          "assets",
          "stackpath.bootstrapcdn.com",
          "code.jquery.com",
        ],
        styleSrc: [
          "'self'",
          "fonts.googleapis.com",
          "assets",
          "stackpath.bootstrapcdn.com",
        ],
        fontSrc: ["'self'", "fonts.gstatic.com", "stackpath.bootstrapcdn.com"],
        imgSrc: ["'self'", "https:", "http:", "data:"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

//adding winston logging of requests
//app.use(winstonConfig.logging);
//app.use(winstonConfig.errorlog);

//Index page to upload photos
app.get("/imageApp/upload", csrfProtection, (req, res) => {
  res.render("view", { csrfToken: req.csrfToken() });
});

app.get("/imageApp", (req, res) => {
  console.log("Getting images");
  imageProcess.getRecentSevenImages(function (data) {
    res.render("picture", { imageSource: data });
  });
});

//Images are posted here to be processed by the server
app.post("/imageApp/api", csrfProtection, function (req, res) {
  upload(req, res, function (err) {
    console.log(req.files);
    if (err) {
      return res.end("Error uploading file.");
    }

    //These run asynchronous, so that the user does not need to wait
    for (let i = 0; i < req.files.length; i++) {
      imageProcess.startImgPreprocess(
        req.files[i].filename,
        req.files[i].path,
        "Kevin",
        true
      );
    }
    console.log("The files are sent down the pipe");
    res.redirect("/imageApp");
  });
});

//HTTPS Server setup with Postive SSL Certificate from Comodo
https
  .createServer(
    {
      key: fss.readFileSync("Redacting for my safety"),
      ca: fss.readFileSync("Redacting for my safety"),
      cert: fss.readFileSync("Redacting for my safety"),
    },
    app
  )
  .listen(port, () => {
    console.log("Listening on port " + port);
  });
