const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: [1, "too few"],
    maxLength: [15, "too many"],
  },
  password: {
    type: String,
    required: [true, "must be filled"],
    select: false,
    minLength: [1, "too few"],
    maxLength: [15, "too many"],
  },
  passwordConfirm: {
    type: String,
    required: [true, "must be filled"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "doesn't match",
    },
    minLength: [1, "too few"],
    maxLength: [15, "too many"],
  },
  avatar: {
    type: String,
    default: "dfadadad",
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  novelInvolved: {
    type: [String],
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("users", userSchema);

module.exports = User;
