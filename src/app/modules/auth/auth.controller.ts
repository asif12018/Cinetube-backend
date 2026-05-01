import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthServices } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { CookieUtils } from "../../utils/cookie";
import { tokenUtils } from "../../utils/token";
import AppError from "../../../errorHelpers/AppError";
import config from "../../config";
import { auth } from "../../lib/auth";


//register a user
const registerUser = catchAsync(async (req: Request, res: Response) => {
  let payload = req?.body;
  // console.log("=== REGISTER DEBUG ===");
  // console.log("req.body:", req.body);
  // console.log("req.file:", req.file);
  // console.log("req.files:", req.files);
  // console.log("================");

  console.log(payload, "payload from server");

  if (req.body?.data) {
    payload = JSON.parse(req.body.data);
  }

  if (req?.file) {
    payload.image = req.file.path;
  }

  const result = await AuthServices.registerUser(payload);
  //set access token in cookies
  tokenUtils.setAccessTokenCookie(res, result.accessToken);
  tokenUtils.setRefreshTokenCookie(res, result.refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, result.token as string);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

//login a user
const logInUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.logInUser(req.body);

  //set access token in cookies
  tokenUtils.setAccessTokenCookie(res, result.accessToken);
  tokenUtils.setRefreshTokenCookie(res, result.refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, result.token as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

//update a user

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const payload = req.body;
  let user = req.user;
  if (req.file) {
    payload.image = req.file.path;
  }
  const result = await AuthServices.updateUser(id as string, payload, user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

//verify email with otp
const verifyEmailOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.verifyEmailOtp(req.body);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Email verified successfully",
    data: result,
  });
});

//get user own profile
const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await AuthServices.getMe(user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User profile fetched successfully",
    data: result,
  });
});

//refresh token

const getNewRefreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  const betterAuthSessionToken = req.cookies["better-auth.session_token"];

  if (!refreshToken) {
    throw new AppError(status.UNAUTHORIZED, "Refresh token not found");
  }
  const result = await AuthServices.getNewToken(
    refreshToken,
    betterAuthSessionToken,
  );
  const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;
  //set access token in cookies
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, sessionToken as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "New refresh token generated successfully",
    data: result,
  });
});

//forgot password

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.forgetPassword(req.body.email);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Forgot password email sent successfully",
    data: result,
  });
});

//reset password

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.resetPassword(
    req.body.email,
    req.body.otp,
    req.body.newPassword,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password reset successfully",
    data: result,
  });
});

//logout user

const logOutUser = catchAsync(async (req: Request, res: Response) => {
  const sessionToken = req.cookies["better-auth.session_token"];
  const result = await AuthServices.logOutUser(sessionToken);
  //clear all the cookies
  CookieUtils.clearCookie(res, "accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  CookieUtils.clearCookie(res, "refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  CookieUtils.clearCookie(res, "better-auth.session_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged out successfully",
    data: result,
  });
});

//resend email

const resendOTP = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return sendResponse(res, {
      httpStatusCode: status.BAD_REQUEST,
      success: false,
      message: "Email is required",
      data: null,
    });
  }

  await AuthServices.resendOTP(email);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "A new OTP has been sent to your email",
    data: null,
  });
});


//reset password otp

const resendOTPForgetPassword  = catchAsync(async(req:Request, res:Response)=>{
  const {email} = req.body;
  if(!email){
    return sendResponse(res, {
      httpStatusCode: status.BAD_REQUEST,
      success: false,
      message: "Email is required",
      data:null
    })
  }

  await AuthServices.resendOTPForgetPassword(email);
   sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "A new OTP has been sent to your email",
    data: null,
  });
})

//get user info for verification

const getMeAuth = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  console.log("this is user:", user);
  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized access! User is not authenticated.",
    );
  }
  const result = await AuthServices.getMeAuth(user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User profile fetch successfully",
    data: result,
  });
});



//google signin controller
// Redirects directly to Better Auth's built-in OAuth initiation endpoint.
// This is critical: the state cookie must be set by Better Auth in the SAME
// response that redirects to Google — any intermediate render/redirect breaks it.
const googleLogin = catchAsync((req: Request, res: Response) => {
    const redirectPath = (req.query.redirect as string) || "/dashboard";
    const encodedRedirectPath = encodeURIComponent(redirectPath);

    // After Google callback, Better Auth will redirect here
    const callbackURL = `${config.BETTER_AUTH_URL}/api/v1/auth/callback/google`;

    // Better Auth's built-in social sign-in initiation URL
    const googleAuthURL = `${config.BETTER_AUTH_URL}/api/v1/auth/sign-in/social`;

    // We POST to Better Auth's sign-in/social endpoint by redirecting
    // Actually, Better Auth exposes a GET redirect for OAuth — use the correct path:
    const initiateURL = new URL(`${config.BETTER_AUTH_URL}/api/v1/auth/sign-in/social`);
    
    // Redirect user to Better Auth's Google initiation (it handles state + redirect to Google)
    res.redirect(`${config.BETTER_AUTH_URL}/api/v1/auth/sign-in/social?provider=google&callbackURL=${encodeURIComponent(`${config.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`)}`);
});


const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = req.query.redirect as string || "/dashboard";

    const sessionToken = req.cookies["better-auth.session_token"];

    if(!sessionToken){
        return res.redirect(`${config.FRONTEND_URL}/login?error=oauth_failed`);
    }

    const session = await auth.api.getSession({
        headers:{
            "Cookie" : `better-auth.session_token=${sessionToken}`
        }
    })

    if (!session) {
        return res.redirect(`${config.FRONTEND_URL}/login?error=no_session_found`);
    }


    if(session && !session.user){
        return res.redirect(`${config.FRONTEND_URL}/login?error=no_user_found`);
    }

    const result = await AuthServices.googleLoginSuccess(session);

    const {accessToken, refreshToken} = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
 // ?redirect=//profile -> /profile
    const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
    const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

    res.redirect(`${config.FRONTEND_URL}${finalRedirectPath}`);
})

//handle oauth error
const handleOAuthError = catchAsync(async(req:Request, res:Response)=>{
    const error = req.query.error as string || "oauth_failed";
    res.redirect(`${config.FRONTEND_URL}/login?error=${error}`);
})


export const AuthController = {
  registerUser,
  logInUser,
  verifyEmailOtp,
  updateUser,
  getMe,
  getNewRefreshToken,
  forgetPassword,
  resetPassword,
  logOutUser,
  resendOTP,
  getMeAuth,
  resendOTPForgetPassword,
  googleLoginSuccess,
  handleOAuthError,
  googleLogin
};
