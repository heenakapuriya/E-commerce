import { Router, Request, Response } from "express";
import { body } from "express-validator";
import * as userController from "../controller/userController";
import { TokenMiddleware } from "../middlewear/TokenMiddleware";



const userRouter: Router = Router();


/**
@usage : to get all users
@method : GET
@params : no-params
@url : http://localhost:9000/users/allusers
 */
userRouter.get("/allusers", async (request: Request, response: Response) => {
    await userController.getAllUsers(request, response);
});


/**
@usage : to get a user
@method : GET
@params : no-params
@url : http://localhost:9000/users/:userId
 */
userRouter.get("/:userId", async (request: Request, response: Response) => {
    await userController.getUser(request, response);
});


/**
@usage : register user
@method : POST
@params : name
@url : http://localhost:9000/users/register
 */
userRouter.post("/register", [
    body('username').not().isEmpty().withMessage("Username is Required"),
    body('email').not().isEmpty().isEmail().withMessage(" proper email is Required"),
    body('password').not().isEmpty().isLength({ min: 8 }).withMessage("proper password is required"),
    body('phone').not().isEmpty().withMessage("proper phonenumber is Required"),
], async (request: Request, response: Response) => {
    await userController.registerUser(request, response);
});

/**
 * @usage : login a user
 *  @method : POST
 *  @params : email, password
 *  @url : http://localhost:9000/users/login
 *   @access : PUBLIC
 */

userRouter.post("/login", [
    body('email').isEmail().withMessage("Proper Email is Required"),
    body('password').not().isEmpty().withMessage("Strong Password is Required")
], async (request: Request, response: Response) => {
    await userController.loginUser(request, response);
});

/**
 * @usage : Get User Info
 *  @method : GET
 *  @params : no-params
 *  @url : http://localhost:9000/users/me
 *  @access : PRIVATE
 */
userRouter.get("/login/me", TokenMiddleware, async (request: Request, response: Response) => {
    await userController.getUserInfo(request, response);

});


/**
 * @usage : update User Info
 *  @method : put
 *  @params : no-params
 *  @url : http://localhost:9000/users/:userid
 *  @access : private
 */
userRouter.put("/:userId", [
    body('name').not().isEmpty().withMessage("name is Required"),
    body('email').isEmail().withMessage("Proper Email is Required"),
    body('password').isStrongPassword().withMessage("Strong Password is Required"),
    body('phone').not().isEmpty().withMessage("phone is Required")
], async (request: Request, response: Response) => {
    await userController.updateuser(request, response);
});
/**
 * /**
@usage : Delete a user
@method : DELETE
@params : no-params
@url : http://localhost:9000/users/:users
*/

userRouter.delete("/:userId", async (request: Request, response: Response) => {
    await userController.deleteuser(request, response);
});




export default userRouter;







