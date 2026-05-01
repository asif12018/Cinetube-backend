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
const googleSuccess = catchAsync(async (req: Request, res: Response) => {
  const sessionToken = req.cookies["better-auth.session_token"];
  const session = await auth.api.getSession({
    headers: new Headers({ Authorization: `Bearer ${sessionToken}` }),
  });

  if (!session) throw new AppError(status.UNAUTHORIZED, "No session");

  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
  });

  const FRONTEND_URL = config.FRONTEND_URL;
  res.redirect(
    `${FRONTEND_URL}/api/auth/callback/google?accessToken=${accessToken}&refreshToken=${refreshToken}&token=${sessionToken}&role=${session.user.role}`
  );
});


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
  googleSuccess
};
