const express = require("express");
const app = express();
const port = 3010;
const https = require("https");
const fs = require("fs");
const bodyParser = require("body-parser");
const helmet = require("helmet"); //Usage for potential http attacks.  OWASP
const rateLimit = require("express-rate-limit"); //Used to protect from single user ddos attacks

//Created middlewares
const winstonConfig = require("./middlewares/winston.js");
const multerConfig = require("./middlewares/multerConfig.js");
const imageProcess = require("./middlewares/addAPicture.js");

//The addition of passport and csurf would be used once a log in process is implemented
//OWASP

//Rate limiter to protect resources
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(bodyParser.json());
app.use(helmet());

//adding winston logging of requests
app.use(winstonConfig.logging);
app.use(winstonConfig.errorlog);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//Picture files are sent from index.html
app.post("/multiple-upload", function (req, res) {
  multerConfig.upload(req, res, function (err) {
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
    res.end("File is uploaded");
  });
});

https
  .createServer(
    {
      key: fs.readFileSync("server.key"),
      cert: fs.readFileSync("server.cert"),
    },
    app
  )
  .listen(port, () => {
    console.log("Listening on port " + port);
  });
