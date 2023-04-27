import { Request, Response } from "express";
import { APP_STATUS } from "../constants/constants";
import { validationResult } from "express-validator";
import UsersTable from "../database/UserSchema";
import mongoose from "mongoose";
import bcryptjs from 'bcryptjs';
import gravatar from "gravatar";
import { IUser } from "../model/IUser";
import jwt from "jsonwebtoken";





// get method

/**
 * @usage : get all user
 *  @method : get
 *  @params : users detail
 *  @url : http://localhost:9000/user/alluser
 *  @access : PUBLIC
 */


export const getAllUsers = async (request: Request, response:
    Response) => {
    try {
        let users: IUser[] | undefined = await
            UsersTable.find();
        if (users) {
            return response.status(200).json(users);
        }
    } catch (error: any) {
        return response.status(500).json({
            status: APP_STATUS.FAILED,
            data: null,
            error: error.message
        });
    }
}


// get id method
/**
@usage : get a contact
@method : GET
@params : no-params
@url : http://localhost:9000/contacts/:contactId
 */

export const getUser = async (request: Request, response:
    Response) => {
    try {
        let { userId } = request.params;
        const mongoUserId = new mongoose.Types.ObjectId(userId);
        let theUser: IUser | undefined | null = await
            UsersTable.findById(mongoUserId);
        if (!theUser) {
            return response.status(404).json({
                status: APP_STATUS.FAILED,
                data: null,
                error: "No user is found"
            });
        }
        return response.status(200).json(theUser);
    } catch (error: any) {
        return response.status(500).json({
            status: APP_STATUS.FAILED,
            data: null,
            error: error.message
        });
    }
}


/**
 * @usage : register a user
 *  @method : POST
 *  @params : username, email, password
 *  @url : http://localhost:9000/user/register
 *  @access : PUBLIC
 */
export const registerUser = async (request: Request, response: Response) => {
    console.log(request.body);
    const errors = validationResult(Request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    }
    try {
        // read the form data
        let { name, email, password, phone } = request.body;

        // check if the user is exists
        const userObj = await UsersTable.findOne({ email: email });
        if (userObj) {
            return response.status(400).json({
                status: APP_STATUS.FAILED,
                data: null,
                error: "The user is already exists"
            });
        }

        // password encryption
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);
        console.log(hashPassword);
        // gravatar url
        const imageUrl = gravatar.url(email, {
            size: "200",
            rating: 'pg',
            default: "mm"
        });

        // insert to db
        const newUser: IUser = {
        name:name,
            email: email,
            password: hashPassword,
            phone: phone,
            imageUrl: imageUrl,
            isAdmin: false,
            isSuperAdmin: false,
        }
        const theUserObj = await new UsersTable(newUser).save();

        if (theUserObj) {
            return response.status(200).json({
                status: APP_STATUS.SUCCESS,
                data: theUserObj,
                msg: "Registration is success!"
            });
        }
    } catch (error: any) {
        return response.status(500).json({
            status: APP_STATUS.FAILED,
            data: null,
            error: error.message
        });
    }
}

/**
 * @usage : login a user
 *  @method : POST
 *  @params : email, password
 *  @url : http://localhost:9000/users/login
 *  @access : PUBLIC
 */
export const loginUser = async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    }
    try {
        // read the form data
        let { email, password } = request.body;

        // check for email
        const userObj: IUser | undefined | null = await UsersTable.findOne({ email: email });
        if (!userObj) {
            return response.status(500).json({
                status: APP_STATUS.FAILED,
                data: null,
                error: "Invalid Email address!"
            });
        }
        // check for password
        let isMatch: boolean = await bcryptjs.compare(password, userObj.password);

        if (!isMatch) {
            return response.status(500).json({
                status: APP_STATUS.FAILED,
                data: null,
                error: "Invalid Password!"
            });
        }

        // create a token
        const secretKey: string | undefined = process.env.JWT_SECRET_KEY;
        const payload: any = {
            user: {
                id: userObj._id,
                email: userObj.email
            }
        };
        if (secretKey && payload) {
            jwt.sign(payload, secretKey, {
                expiresIn: 100000000000
            }, (error, encoded) => {
                if (error) throw error;
                if (encoded) {
                    return response.status(200).json({
                        status: APP_STATUS.SUCCESS,
                        data: userObj,
                        token: encoded,
                        msg: "Login is Success!"
                    })
                }
            })
        }
    } catch (error: any) {
        return response.status(500).json({
            status: APP_STATUS.FAILED,
            data: null,
            error: error.message
        });
    }
}

/**
 * @usage : Get User Info
 *  @method : GET
 *  @params : no-params
 *  @url : http://localhost:9000/users/me
 *  @access : PRIVATE
 */
export const getUserInfo = async (request: Request, response: Response) => {
    try {
        const userObj: any = request.headers['user-data'];
        const userId = userObj.id;
        const mongoUserId = new mongoose.Types.ObjectId(userId);
        const userData: IUser | undefined | null = await UsersTable.findById(mongoUserId);
        if (userData) {
            response.status(200).json({
                status: APP_STATUS.SUCCESS,
                data: userData,
                msg: ""
            });
        }
    } catch (error: any) {
        return response.status(500).json({
            status: APP_STATUS.FAILED,
            data: null,
            error: error.message
        });
    }
}
/**
 * @usage:update user
 * @method:put
 * @param:name,email,password,phone,imgeurl
 * @url:http//localhost:9000/users/updet
 */
export const updateuser = async (request: Request, response: Response) => {
    const { userId } = request.params;
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    }
    try {
        //read from updat data
        let { name, email, password, phone, imageUrl, isAdmin, isSuperAdmin } = request.body;
        //check if user exist
        const mongoUserId = new mongoose.Types.ObjectId(userId);
        let user: IUser | null | undefined = await UsersTable.findById(mongoUserId);
        if (!user) {
            return response.status(400).json({
                status: APP_STATUS.FAILED,
                data: null,
                errors: "users is not found"
            });
        }
        //update
        let theUserObj: IUser | null = {
            name: name,
            email: email,
            password: password,
            phone: phone,
            imageUrl: imageUrl,
            isAdmin: isAdmin,
            isSuperAdmin: isSuperAdmin
        }
        theUserObj = await UsersTable.findByIdAndUpdate(mongoUserId, {
            $set: theUserObj
        }, { new: true })
        if (theUserObj) { return response.status(200).json(theUserObj) }

    } catch (error: any) {
        return response.status(500).json({
            status: APP_STATUS.FAILED,
            data: null,
            error: error.message
        });
    }


}
/**
 * @uage:delet user 
 * @method:delet
 * @param:no-param
 * url:http://localhost:9000/users/delet
 */
export const deleteuser = async (request: Request, response: Response) => {
    try {
        let { userId } = request.params; if (userId) {
            const mongouserId = new mongoose.Types.ObjectId(userId);
            // string -> mongo id
            const user: IUser | undefined | null = await UsersTable.findById(mongouserId);
            if (!user) {
                return response.status(404).json({
                    status: APP_STATUS.FAILED,
                    data: null,
                    error: "No user found"
                });
            }
            let theUser: IUser | null = await UsersTable.findByIdAndDelete(mongouserId);
            if (theUser) {
                return response.status(200).json({});
            }
        }
    } catch (error: any) {
        return response.status(500).json({
            status: APP_STATUS.FAILED,
            data: null,
            error: error.message
        });
    }
}









