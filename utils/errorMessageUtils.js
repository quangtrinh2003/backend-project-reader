exports.parseErrorMessage = function (
  errMessage,
  { replacer = undefined, splitter = undefined } = {},
) {
  if (replacer === null) {
    return errMessage.split(splitter);
  }

  if (splitter === null) {
    return errMessage.replaceAll(replacer, "");
  }

  return errMessage.replaceAll(replacer, "").split(splitter);
};

exports.joinArray = function (arr) {
  let result = new Object(null);
  const arrLength = arr.length / 2;

  for (let i = 0; i <= arrLength; i = i + 2) {
    result[arr[i]] = arr[i + 1];
  }

  return result;
};
