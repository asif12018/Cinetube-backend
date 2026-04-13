
import nodemailer from "nodemailer";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import path from "path";
import config from "../config";
import ejs from "ejs";
const transporter = nodemailer.createTransport({
    host: config.EMAIL_SENDER_SMTP_HOST,
    secure: Number(config.EMAIL_SENDER_SMTP_PORT) === 465,
    auth: {
        user: config.EMAIL_SENDER_SMTP_USER,
        pass: config.EMAIL_SENDER_SMTP_PASS
    },
    port: Number(config.EMAIL_SENDER_SMTP_PORT),
    tls: {
    rejectUnauthorized: false
  }
});

//email interface
interface sendEmailOptions {
    to: string;
    subject: string;
    templateName: string;
    templateData: Record<string, any>;
    attachments?:{
        filename: string;
        content: Buffer | string;
        contentType: string;
    }[];
}

export const sendEmail = async ({subject, templateData, templateName, to, attachments}: sendEmailOptions) =>{
   try{
    const templatePath = path.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`);
   const html = await ejs.renderFile(templatePath, templateData);
    const info = await transporter.sendMail({
        from: config.EMAIL_SENDER_SMTP_USER,
        to: to,
        subject: subject,
        html: html,
        attachments: attachments?.map((attachment)=>{
            return {
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType
            }
        })
    })
    console.log(`Email sent to ${to}:`, info.messageId);
    return info;

   }catch(err:any){
    console.log("Email sending error", err.message);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email")
   }
}