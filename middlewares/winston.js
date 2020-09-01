const expressWinston = require("express-winston");
const winston = require("winston"); // for transports.Console

module.exports.logging = expressWinston.logger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      timestamp: true,
      filename: "combined.log",
    }),
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.json()
  ),
});

module.exports.errorlog = expressWinston.errorLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "error.log",
      level: "error",
      timestamp: true,
    }),
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
});
