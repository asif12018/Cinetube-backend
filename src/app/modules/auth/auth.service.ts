import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { ILoginUserPayload, IRegisterUserPayload, IUpdateUserPayload, IVerifyEmailOtpPayload } from "./auth.interface";
import { tokenUtils } from "../../utils/token";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import ms, { type StringValue } from "ms";
import { IRequestUser } from "../../types/user.types";
import { jwtUtils } from "../../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { deleteFileFromCloudinary } from "../../utils/cloudinary.config";

//register a user

const registerUser = async (payload: IRegisterUserPayload) => {
  const maxAgeOfAccessToken = ms(config.ACCESS_TOKEN_EXPIRES_IN as StringValue);
  const maxAgeOfRefreshToken = ms(
    config.REFRESH_TOKEN_EXPIRES_IN as StringValue,
  );
  //checking if the user already exist
  const isUserExist = await prisma.user.findFirst({
    where:{
      email: payload.email
    }
  });
  if(isUserExist){
    throw new AppError(status.BAD_REQUEST,"User with email already exist")
  }
  const data = await auth.api.signUpEmail({
    body: payload,
  });

  //if error happened
  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Failed to register a user");
  }

  //  generate access token
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
  });

  //  generate refresh token
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
  });

  //adding token on account table

  // await prisma.account.updateMany({
  //   where: {
  //     userId: data.user.id,
  //   },
  //   data: {
  //     accessToken,
  //     refreshToken,
  //     idToken: data.token,
  //     accessTokenExpiresAt: new Date(Date.now() + maxAgeOfAccessToken),
  //     refreshTokenExpiresAt: new Date(Date.now() + maxAgeOfRefreshToken),
  //   },
  // });

  return {
    token: data.token,
    accessToken,
    refreshToken,
    user: data.user,
  };
};

//login a user

const logInUser = async (payload: ILoginUserPayload) => {
  const maxAgeOfAccessToken = ms(config.ACCESS_TOKEN_EXPIRES_IN as StringValue);
  const maxAgeOfRefreshToken = ms(
    config.REFRESH_TOKEN_EXPIRES_IN as StringValue,
  );
  const result = await auth.api.signInEmail({ body: payload });
  //checking if the user is banned
  if (!result) {
    throw new AppError(status.BAD_REQUEST, "invalid email or password");
  }
  if (result.user.banned === true) {
    throw new AppError(
      status.UNAUTHORIZED,
      "unfortunatly you are banned for violating our terms and conditions",
    );
  }

  //generate access token
  const accessToken = tokenUtils.getAccessToken({
    userId: result.user.id,
    role: result.user.role,
    name: result.user.name,
    email: result.user.email,
  });

  //generate refresh token
  const refreshToken = tokenUtils.getRefreshToken({
    userId: result.user.id,
    role: result.user.role,
    name: result.user.name,
    email: result.user.email,
  });

  //adding token on account table
  // await prisma.account.updateMany({
  //   where: {
  //     userId: result.user.id,
  //   },
  //   data: {
  //     accessToken,
  //     refreshToken,
  //     idToken: result.token,
  //     accessTokenExpiresAt: new Date(Date.now() + maxAgeOfAccessToken),
  //     refreshTokenExpiresAt: new Date(Date.now() + maxAgeOfRefreshToken),
  //   },
  // });

  return {
    token: result.token,
    accessToken,
    refreshToken,
    user: result.user,
  };
};

//todo update user

const updateUser = async (id:string,payload: IUpdateUserPayload, user:IRequestUser) =>{
  const isDoctorExist = await prisma.user.findFirstOrThrow({
    where:{
      id:id,
      email: user.email
    }
  })

  console.log("all photos url", isDoctorExist.image, payload.image)
  //deleting photo if its exist
  if(isDoctorExist.image && payload.image){
    await deleteFileFromCloudinary(isDoctorExist.image);
  }
  const result = await prisma.user.update({
    where:{
      id: isDoctorExist.id
    },
    data: {
      name: payload.name,
      image: payload.image,
      gender: payload.gender
    }
  })

  return result;
}


//verify email with otp

const verifyEmailOtp = async (payload: IVerifyEmailOtpPayload) =>{
  const result = await auth.api.verifyEmailOTP({body: payload})
  if(!result){
    throw new AppError(status.BAD_REQUEST, "invalid email or otp")
  }
  return result;
}

//get user own profile

const getMe = async(user:IRequestUser) =>{
  // console.log(user,'payload user')
  const userData = await prisma.user.findFirstOrThrow({
    where:{
      email:user.email
    },
    include:{
      reviews:true,
      reviewLikes:true,
      comments:true,
      watchlist:true,
      purchases:true,
      notifications:true
    }
  });

  // console.log(userData,'user data')
  if(user.userId !== userData.id){
    throw new AppError(status.UNAUTHORIZED,"You dont have permission to perform this action")
  }

  return userData
}



//get new  refresh token

const getNewToken = async(refreshToken:string, sessionToken: string) =>{
  const isSessionTokenExist = await prisma.session.findUnique({
    where:{
      token:sessionToken
    },
    include:{
      user:true
    }
  });

  if(!isSessionTokenExist){
       throw new AppError(status.BAD_REQUEST, "invalid session token")
  }

  if(isSessionTokenExist.user.banned === true){
    throw new AppError(status.UNAUTHORIZED, "You are banned from accessing this service")
  }
   
  //verify the refresh token
  const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, config.REFRESH_TOKEN_SECRET as string);

  if(!verifiedRefreshToken.success && verifiedRefreshToken.err){
     throw new AppError(status.UNAUTHORIZED, "invalid refresh token")
  }

  const data = verifiedRefreshToken.data as JwtPayload;
  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    email: data.email,
    role: data.role
  });

  const newRefreshToken = tokenUtils.getRefreshToken({userId: data.userId, email: data.email, role: data.role});

  //update the session token
  const {token} = await prisma.session.update({
    where:{
      token: sessionToken
    },
    data:{
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 24 * 1000),
      updatedAt: new Date(),
    }
  })

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token
  }
}

//forget password

const forgetPassword = async(email: string) =>{
   const isUserExist = await prisma.user.findUnique({
    where:{
      email: email
    }
   })

   if(!isUserExist){
    throw new AppError(status.BAD_REQUEST, "User not found")
   }

   if(isUserExist.banned === true){
     throw new AppError(status.UNAUTHORIZED, "You are banned from accessing this service")
   }

   // reset password request
   await auth.api.requestPasswordResetEmailOTP({
    body:{
      email:email
    }
   });
   
}

  //reset password

  const resetPassword = async(email: string, otp: string, newPassword: string) =>{
    const isUserExist = await prisma.user.findUnique({
      where:{
        email: email
      }
    });

    if(!isUserExist){
      throw new AppError(status.BAD_REQUEST, "User not found")
    }

    if(isUserExist.banned === true){
      throw new AppError(status.UNAUTHORIZED, "You are banned from accessing this service")
    }

    //reset password
    await auth.api.resetPasswordEmailOTP({
      body:{
        email: email,
        otp: otp,
        password: newPassword
      }
    });

    //deleting the session to logout all the device

    await prisma.session.deleteMany({
      where:{
        userId: isUserExist.id
      }
    });


  }
  
  //resend otp for user

 const resendOTP = async (email: string) => {
  try {
    // Calling Better-Auth's internal API directly from the server
    await auth.api.sendVerificationOTP({
      headers: new Headers(), // Global Headers object is available in Node 22
      body: {
        email,
        type: "email-verification",
      },
    });

    return null; // The auth config handles the actual email sending
  } catch (error) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to generate new OTP");
  }
};

  //logout

  const logOutUser = async (sessionToken: string) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  return result;
};


//user info for auth
const getMeAuth = async(user:IRequestUser) =>{
     const isUserExist = await prisma.user.findUnique({
      where:{
        id: user.userId
      },
      include:{
        watchlist: true,
        reviews: true,
        comments: true,
      }
     });

     if(!isUserExist){
      throw new AppError(status.NOT_FOUND, "User not exist")
     }

     return isUserExist
}

export const AuthServices = {
  registerUser,
  logInUser,
  verifyEmailOtp,
  updateUser,
  getMe,
  getNewToken,
  forgetPassword,
  resetPassword,
  logOutUser,
  resendOTP,
  getMeAuth
};
