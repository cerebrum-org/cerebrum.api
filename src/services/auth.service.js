const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const User = require("./../models/user.model");
const Token = require("./../models/token.model");
const MailServ = require("./mail.service");
const CustomError = require("./../utils/custom-error");
const { JWT_SECRET, BCRYPT_SALT, url } = require("./../config");

const path = require("path");

class AuthService {
  // User sign up
  async signup(data) {
    let user = await User.findOne({ email: data.email });
    if (user) throw new CustomError("Email already exists");

    user = new User(data);
    const token = JWT.sign({ id: user._id, role: user.role }, JWT_SECRET);
    // token.save();
    await user.save();

    // Request email verification
    await this.RequestEmailVerification(user.email);

    return (data = {
      uid: user._id,
      email: user.email,
      role: user.role,
      verified: user.isVerified,
      token: token,
    });
  }

  // User sign in
  async signin(data) {
    if (!data.email) throw new CustomError("Email is required");
    if (!data.password) throw new CustomError("Password is required");

    // Check if user exist
    const user = await User.findOne({ email: data.email });
    if (!user) throw new CustomError("Incorrect email or password");
    
    //Check if user password is correct
    const isCorrect = await bcrypt.compare(data.password, user.password);
    if (!isCorrect) throw new CustomError("Incorrect email or password");

    // check if user is verified
    if (!user.isVerified)  { 
    await this.RequestEmailVerification(user.email)
    throw new CustomError("Email not verified, kindly check your email for verification link", 401);
  }

    console.log(user.isVerified);
    // await this.RequestEmailVerification(user.email)
    // throw new CustomError("Email not verified, kindly check your email for verification link");


    const token = await JWT.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: 60 * 60 });

    return (data = {
      uid: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      img:  user.img_url,
      email: user.email,
      role: user.role,
      verified: user.isVerified,
      token: token,
    });
  }

  // Update user password
  async updatePassword(userId, data) {
    const user = await User.findOne({ _id: userId });
    if (!user) throw new CustomError("User dose not exist");

    //Check if user password is correct
    const isCorrect = await bcrypt.compare(data.password, user.password);
    if (!isCorrect) throw new CustomError("Incorrect password");

    const hash = await bcrypt.hash(password, BCRYPT_SALT);

    await User.updateOne(
      { _id: userId },
      { $set: { password: hash } },
      { new: true }
    );

    return;
  }

  // Sends a verification mail to user email
  async RequestEmailVerification(email) {
    const user = await User.findOne({ email });
    if (!user) throw new CustomError("Email does not exist");
    if (user.isVerified) throw new CustomError("Email is already verified");
    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();
    let verifyToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(verifyToken, BCRYPT_SALT);

    await new Token({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    }).save();

    const link = `${url.CLIENT_URL}/auth/verify-email/?uid=${user._id}&verifyToken=${verifyToken}`;

    // Send Mail
    await new MailServ(user).sendEmailVerificationMail(link);

    return;
  }

  // Verify user
  async VerifyEmail(data) {
    const { uid, verifyToken } = data;
    const user = await User.findOne({ _id: uid });
    if (!user) throw new CustomError("User does not exist");
    if (user.isVerified) throw new CustomError("Email is already verified");

    let VToken = await Token.findOne({ userId: uid });
    if (!VToken)
      throw new CustomError("Invalid or expired password reset token");

    const isValid = await bcrypt.compare(verifyToken, VToken.token);
    if (!isValid)
      throw new CustomError("Invalid or expired password reset token");

    await User.updateOne(
      { _id: uid },
      { $set: { isVerified: true } },
      { new: true }
    );

    await VToken.deleteOne();

    return;
  }

  // Sends a reset password mail to user email
  async RequestPasswordReset(email) {
    const user = await User.findOne({ email });
    if (!user) throw new CustomError("Email does not exist");

    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();

    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, BCRYPT_SALT);

    await new Token({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    }).save();

    const link = `${url.CLIENT_URL}/auth/reset-password?uid=${user._id}&resetToken=${resetToken}`;

    // Send Mail
    await new MailServ(user).sendPasswordResetMail(link);

    return;
  }

  //profile reset Password
  async profileResetPassword(password,userId) {
    const hash = await bcrypt.hash(password, BCRYPT_SALT);

    return await User.updateOne(
      { _id: userId },
      { $set: { password: hash} },
      { new: true }
    );
  }


  // Resets user password
  async resetPassword(data) {
    const { userId, resetToken, password } = data;

    let RToken = await Token.findOne({ userId });
    if (!RToken)
      throw new CustomError("Invalid or expired password reset token");

    const isValid = await bcrypt.compare(resetToken, RToken.token);
    if (!isValid)
      throw new CustomError("Invalid or expired password reset token");

    const hash = await bcrypt.hash(password, BCRYPT_SALT);

    await User.updateOne(
      { _id: userId },
      { $set: { password: hash } },
      { new: true }
    );

    await RToken.deleteOne();

    return;
  }

  async updateProfile(userImage) {
    try {
      const fileUpload = await cloudinary.uploader.upload(userImage);

      if (fileUpload) {
        return(fileUpload);
      }
    } catch (e) {
      return("Error: ", e);
    }
  }
}
module.exports = new AuthService();
