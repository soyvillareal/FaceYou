const {
  validateEmail,
  validateLength,
  validateUsername,
} = require("../helpers/validation");
const { generateToken } = require("../helpers/tokens");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { sendVerificationEmail } = require("../helpers/mailer");

exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      username,
      email,
      password,
      bYear,
      bMonth,
      bDay,
      gender,
    } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    const check = await User.findOne({ email: email });
    if (check) {
      return res.status(400).json({
        message:
          "This email address already exists, try with a different email address",
      });
    }

    if (!validateLength(first_name, 3, 30)) {
      return res.status(400).json({
        message: "First name must between 3 and 30 characters.",
      });
    }

    if (!validateLength(last_name, 3, 30)) {
      return res.status(400).json({
        message: "Last name must between 3 and 30 characters.",
      });
    }

    if (!validateLength(password, 6, 40)) {
      return res.status(400).json({
        message: "Password must be atleast 6 characters.",
      });
    }

    const bcryptPassword = await bcrypt.hash(password, 12);

    let tempUsername = first_name + last_name;

    let newUsername = await validateUsername(tempUsername);

    const user = await new User({
      first_name,
      last_name,
      username: newUsername,
      email,
      password: bcryptPassword,
      bYear,
      bMonth,
      bDay,
      gender,
    }).save();
    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "30m"
    );
    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationEmail(user.email, user.first_name, url);
    const token = generateToken({ id: user._id.toString() }, "7d");

    res.json({
        id: user._id,
        username: user.username,
        picture: user.picture,
        first_name: user.first_name,
        last_name: user.last_name,
        token: token,
        verified: user.verified,
        message: "Register success! please activated your email to start",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
