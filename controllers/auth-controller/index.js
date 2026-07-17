// import * as authService from "../services/auth.service.js";

import { login, signup } from "../../services/auth-services/index.js";

export const loginController = async (req, res, next) => {
    try {
        const data = await login(req.body);

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