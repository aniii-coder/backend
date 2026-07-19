import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/user-model/index.js";
import { OAuth2Client } from "google-auth-library";
import clientUserModel from "../../models/client-user-model/index.js";



const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const login = async ({ email, password }) => {

    const user = await User.findOne({ email });
if (!user) {
    throw new Error("User not found");
}

const userObject = user.toObject();


const { password: userPass, ...userWithoutPassword } = userObject;
    if (!user) {
        throw new Error("User not found");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    return {
        data: userWithoutPassword,
        token,
    };
};



export const signup = async ({ firstName, email, password }) => {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        firstName,
        // lastName,
        email,
        password: hashedPassword,
    });
    

return (({ password, ...rest }) => rest)(user.toObject());

};




export const loginViaGoogle = async (credential) => {
  if (!credential) {
    throw new Error("Google credential is required.");
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google token.");
  }

  const {
    sub: googleId,
    email,
    name,
    picture,
    email_verified,
  } = payload;

  if (!email_verified) {
    throw new Error("Google account email is not verified.");
  }

  let user = await clientUserModel.findOne({
    $or: [{ googleId }, { email }],
  });

  if (!user) {
    user = await clientUserModel.create({
      googleId,
      name,
      email,
      avatar: picture,
      isActive: true,
      lastLogin: new Date(),
      blogIds: [],
    });
  } else {
    if (!user.isActive) {
      throw new Error("Your account has been blocked.");
    }

    user.googleId = googleId;
    user.name = name;
    user.email = email;
    user.avatar = picture;
    user.lastLogin = new Date();

    await user.save();
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    user: {
      id: user._id,
      // googleId: user.googleId,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      loginProvider: user.loginProvider,
      blogIds: user.blogIds,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
    },
  };
};