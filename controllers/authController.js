const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("..\\models\\userSchema");
const catchAsync = require(".\\..\\utils\\catchAsync");
const AppError = require(".\\..\\utils\\AppError");
const { decode } = require("jsonwebtoken");

exports.register = catchAsync(async function (req, res, next) {
  const newUser = await User.create({
    username: req.body.username,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  sendCookieBack(newUser, res);
});

exports.login = catchAsync(async function (req, res, next) {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError(400, "no username or password"));
  }

  const user = await User.findOne({ username }).select("+password");

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError(400, "wrong username or password"));
  }
  sendCookieBack(user, res);
});

exports.authentication = catchAsync(async function (req, res, next) {
  let token = undefined;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError(401, "please login"));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  req["user"] = decoded.user;
  next();
});

exports.authorization = catchAsync(async function (req, res, next) {
  const user = await User.findOne({ username: req.user });

  if (user.role === "admin") {
    return next();
  }

  if (!user.novelInvolved.includes(req.params.id)) {
    return next(new AppError(401, "verify failed"));
  }
  next();
});

exports.checkNovelInvolved = catchAsync(async function (req, res, next) {
  const user = await User.findOne({ username: req.user });

  if (user.role === "admin") {
    res.status(200).json({ status: "success" });
  }
  if (!user.novelInvolved.includes(`${req.params.id}`)) {
    return next(new AppError(401, "verify failed"));
  }
  res.status(200).json({ status: "success" });
});

function signToken(username) {
  return jwt.sign({ user: username }, process.env.JWT_SECRET);
}

function sendCookieBack(newUser, res) {
  const token = signToken(newUser.username);
  const cookieOptions = {
    httpOnly: true,
    maxAge: Date.now() + process.env.JWT_EXPIRES * 24 * 60 * 60 * 1000,
  };
  res
    .cookie("jwt", token, cookieOptions)
    .status(200)
    .json({ status: "success" });
}
