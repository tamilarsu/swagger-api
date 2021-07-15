import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users, InspectorDocument } from './schemas/inspector.schema';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';
import { count } from 'console';

@Injectable()
export class InspectorService {
    constructor(
        @InjectModel(Users.name)
        private readonly userModel: Model<InspectorDocument>,
        private readonly emailService: EmailService,
    ){}

    async getusersList(): Promise<any> {
        let testData;
        
        const custData = await this.userModel.find();
            return custData;
    }

    async inspectorlogin(userData: any): Promise<any> {
        
        const username = userData.email_id_mob_no;
        const password = userData.password;
        const device_token = userData.device_token;
        
        let user = await this.userModel.findOne({
            email: username,
        });

        if (!user){
            user = await this.userModel.findOne({ mobile: username, });

            if (!user) {
                throw new HttpException('There is no user in the system regarding this email', HttpStatus.BAD_REQUEST);
            }
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST);
        }  else if (user.role !== "3") {
            throw new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST);
        }else{
            return user;
        }
    }

    async ValidateEmail(mail) {
        const format = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (format.test(mail)) {
            return true;
        }
        return false;
    }

   
   
    async forgotpassword(email_id_mob_no: string): Promise<any> {
        const emailvalidated = await this.ValidateEmail(email_id_mob_no);
        if (!emailvalidated) {
            throw new HttpException(
                'Please enter valid email.',
                HttpStatus.BAD_REQUEST,
            );
        }
        const user = await this.userModel.findOne({
            email: email_id_mob_no,
        });
        if (!user) {
            return {
                success:
                  'You will get the recovery link if you are already registered in the System',
              };
        }
        if (user.email) {
            const otp = Math.floor(Math.random() * (999999 - 1 + 1) + 1);
//            let data =[];
             let data =  await this.userModel.updateOne(
            { email: email_id_mob_no },
            { otp: otp }
        );
            const path = process.env.URL_PATH || 'http://localhost:3000';
            // reference: https://github.com/yanarp/nestjs-mailer
            //   https://docs.nestjs.com/recipes/serve-static
            //   static is configured to client directory(index.html)
            // so when the user queries for path/?email it will serve the static page
            const forgotLink = `${path}/passwordreset?email=${user.email}&otp=${otp}`;
            const subject = 'Forgot Password Link ✔';
            const content = `<p>You are receiving this email because we received a password reset request for your account. If you did not request a password reset, no further action is required<p>
        <p>Please use this <a href="${forgotLink}">link</a> to reset your password.</p>`;
            const usermaildata = {
                email_id:user.email,
                first_name: user.firstname,
                last_name:user.lastname,
            };
            const mailPromise = await this.emailService.sendEmail(
            usermaildata,
                content,
                subject,
            );
            if (mailPromise) {
                return {
                  success:
                    'You will get the recovery link if you are already registered in the System',
                };
              }
        }
        
    }


    async refreshtoken(refreshtoken: any): Promise<any> {
        const user = await this.userModel.findOne({
            email: refreshtoken.email_id_mob_no,
        });
        
        if (!user) {
          throw new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST);
        }
        const isMatch = await bcrypt.compare(refreshtoken.password, user.password);
        if (!isMatch) {
          throw new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST);
        }
        return user;
      }

      async getInspector(id: any): Promise<any>{
        const inspector = await this.userModel.findOne({
            _id: id,
        });
        return  inspector;
     } 
}
