import { Response } from "express";
import { APP_STATUS } from "../constants/constants";    

export const ThrowError = (response: Response, statusCode?: number, msg?: string)=> {
    return response.status(statusCode ? statusCode : 500).json({
        status: APP_STATUS.FAILED,
        msg: msg ? msg : "Server Error",
        data: null
    });
};