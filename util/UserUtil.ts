import { Request, Response } from "express";
import mongoose from "mongoose";
import { ThrowError } from "./ErrorUtil";
import UsersTable from "../database/UserSchema";
export const getUser = async (request: Request, response: Response) => {
    try {
        const theUser: any = request.headers["user"];
        const userId = theUser.id;
        if (!userId) {
            return response.status(401).json({
                msg: 'Invalid User Request'
            });
        }
        const mongoUserId = new mongoose.Types.ObjectId(userId);
        let userObj: any = await UsersTable.findById(mongoUserId);
        if (!userObj) {
            return ThrowError(response, 404, "User is not found");
        }
        return userObj;
    } catch (error) {
        return ThrowError(response);
    }
}
