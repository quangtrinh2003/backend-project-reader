const AppError = require("..\\utils\\AppError");
const errorMessageUtils = require("..\\utils\\errorMessageUtils");

function errorHandler(err, req, res, next) {
  let error = structuredClone(err);
  error["statusCode"] = err.statusCode || undefined;
  let errorMessage = undefined;

  switch (err.name) {
    case "ValidationError":
      errorMessage = errorMessageUtils.parseErrorMessage(err.message, {
        replacer: " ",
        splitter: /[:,]/gm,
      });
      errorMessage.shift();

      errorMessage = errorMessageUtils.joinArray(errorMessage);

      error = new AppError(403, err.name);
      break;
    case "JsonWebTokenError":
      error = new AppError(400, "jwt verify failed");
      break;
  }

  switch (err.code) {
    case 11000:
      errorMessage = errorMessageUtils.parseErrorMessage(err.message, {
        replacer: /[ {}"]/gm,
        splitter: ":",
      });

      errorMessage.splice(0, 3);
      errorMessage = errorMessageUtils.joinArray(errorMessage);

      error = new AppError(403, err.name);
      break;
    case "ENOENT":
      error = new AppError(404, "File not found");
      break;
  }

  res
    .status(error.statusCode)
    .json({ message: error.message, data: errorMessage });
}

module.exports = errorHandler;
