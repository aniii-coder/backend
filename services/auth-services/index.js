import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/user-model/index.js";

export const login = async ({ email, password }) => {

    const user = await User.findOne({ email });
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



export const signup = async ({ firstName, lastName, email, password }) => {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        firstName,
        lastName,
        email,
        // password: hashedPassword,
    });

    return user;
};