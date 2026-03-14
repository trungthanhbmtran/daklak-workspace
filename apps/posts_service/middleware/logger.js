// const { createLogger, format, transports } = require("winston");

// module.exports = createLogger({
//     format: format.combine(
//         format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
//         format.align(),
//         format.printf((i) => `${i.level}: ${[i.timestamp]}: ${i.message}`)
//     ),
//     transports: [
//         new transports.File({
//             filename: "logs/info.log",
//             level: "info",
//             format: format.combine(
//                 format.printf((i) =>
//                     i.level === "info" ? `${i.level}: ${i.timestamp} ${i.message}` : ""
//                 )
//             ),
//         }),
//         new transports.File({
//             filename: "logs/error.log",
//             level: "error",
//         }),
//     ],
// })

const {createLogger,format,transports} = require('winston');
const path = require('path')

const filenameInfo = path.join(__dirname,'../logs','info.log');
const filenameError = path.join(__dirname,'../logs','error.log');


// define the custom settings for each transport (file, console)
const options = {
    file: {
      level: 'info',
      name: 'file.info',
      filename: `${filenameInfo}`,
      format: format.combine(
        format.printf((i) =>
            i.level === "info" ? `${i.level}: ${i.timestamp} ${i.message}` : ""
        )
    ),
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 100,
      colorize: true,
    },
    errorFile: {
      level: 'error',
      name: 'file.error',
      filename: `${filenameError}`,
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 100,
      colorize: true,
    },
    console: {
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
    },
  };

// instantiate a new Winston Logger with the settings defined above
// var logger = new winston.Logger({
//   transports: [
//     new winston.transports.File(options.file),
//     new winston.transports.Console(options.console)
//   ],
//   exitOnError: false, // do not exit on handled exceptions
// });

let logger = createLogger({
    format: format.combine(
            format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
            format.align(),
            format.printf((i) => `${i.level}: ${[i.timestamp]}: ${i.message}`)
    ),
    transports: [
      new (transports.Console)(options.console),
      new (transports.File)(options.errorFile),
      new (transports.File)(options.file)
    ],
    exitOnError: false, // do not exit on handled exceptions
  });

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

module.exports = logger;