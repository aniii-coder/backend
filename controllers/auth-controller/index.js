// import * as authService from "../services/auth.service.js";

import { login, loginViaGoogle, signup } from "../../services/auth-services/index.js";

export const loginController = async (req, res, next) => {
  try {
    const { data, token } = await login(req.body);
    // console.log('data, token :>> ', data, token);
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });
    res.status(200).json({
      success: true,
      message: "Login successful",
      data
    });
  } catch (error) {
    next(error);
  }
};



export const signupController = async (req, res, next) => {
  try {
    const data = await signup(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const loginViaGoogleController = async (req, res, next) => {
  try {
      console.log("========== GOOGLE LOGIN ==========");
  console.log("Body:", req.body);
    const { token, user } = await loginViaGoogle(req.body.credential);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // console.log('user :>> ', user);

    res.cookie(
      "user",
      JSON.stringify({
        id: user.id,
        firstName: user.name,
        // lastName: user.lastName,
        email: user.email,
        // role: user.role,
        image: user.avatar,
      }),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      }
    );


    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      data: user,
    });

  } catch (error) {
    next(error);
  }
};