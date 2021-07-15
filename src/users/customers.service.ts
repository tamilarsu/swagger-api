import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateTestDto, SaveScheduleTestDto } from './dto/schedule-test.dto';
import { CustomerDocument, Customer } from './schemas/user.schema';
import { Testtypelist, Testtype } from './schemas/testtypes.schema';
import { locationslist, locations } from './schemas/locations.schema';
import { vaccinationsDocument, vaccination } from "./schemas/vaccination.schema";
import { EmailService } from '../email/email.service';
import { visitorsDocument, visitors } from './schemas/visitors.schema';
var CryptoJS = require("crypto-js");

import {
  Testschedules,
  TestschedulesDocument,
} from '../testsschedules/schemas/testschedules.schema';

import {
  feedbacks,
  feedbackslist,
} from './schemas/feedbacks.schema';


import * as CryptoJS from 'crypto-js';
import * as qrcode from 'qrcode';
import { requestuser } from './dto/request-user.dto';
import { FeedbacksDto } from './dto/feedbacks.dto';
import { UpdateScheduleDto } from './dto/update-schedule-test.dto';
import { UpdateUserDto, UpdateProfileDto } from './dto/update-user.dto';

import * as bcrypt from 'bcrypt';
// import * as moment from 'moment-timezone';
import { TokenserviceService } from '../tokenservice/tokenservice.service';
import { InspectorService } from 'src/inspector/inspector.service';
import * as moment from 'moment-timezone';
//import { decrypturl } from './dto/decrypt-url.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Customer.name)
    private readonly userModel: Model<CustomerDocument>,
    private readonly inspectorService: InspectorService,
    @InjectModel(Testschedules.name)
    private readonly testsModel: Model<TestschedulesDocument>,
    private readonly emailService: EmailService,
    @InjectModel(Testtype.name)
    private readonly testtypelist: Model<Testtypelist>,
    private readonly tokenService: TokenserviceService,
    @InjectModel(locations.name)
    private readonly locationslist: Model<locationslist>,
    @InjectModel(vaccination.name)
    private readonly vaccinationsDocument: Model<vaccinationsDocument>,
    @InjectModel(feedbacks.name)
    private readonly feedbacksModel: Model<feedbackslist>,
    @InjectModel(visitors.name)
    private readonly visitorsModel: Model<visitorsDocument>,
  ) { }

  async decryptUrl(string: string, secretkey: string) {
    let KEY_SIZE = 22;
    const encryptedd = CryptoJS.enc.Base64.parse(string);
    const iv_len = 24;
    const salt_len = 24;
    const salts = CryptoJS.lib.WordArray.create(
      encryptedd.words.slice(0, salt_len / 4)
    );
    const idv = CryptoJS.lib.WordArray.create(
      encryptedd.words.slice(0 + salt_len / 4, (salt_len + iv_len) / 4)
    );

    const keys = CryptoJS.PBKDF2(secretkey, salts, { keySize: KEY_SIZE, iterations: 10000, hasher: CryptoJS.algo.SHA256 });
    const encryptes = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.lib.WordArray.create(encryptedd.words.slice((salt_len + iv_len) / 4)) }, keys, { iv: idv });
    return encryptes.toString(CryptoJS.enc.Utf8);
  }

  async create(CreateUserDto: CreateUserDto): Promise<any> {

    const custidnumber = await this.userModel.findOne({
      idnumber: CreateUserDto.idnumber,
    });

    const emailId = await this.userModel.find({
      email_id: CreateUserDto.email_id,
      //otp_verified: true,
    });

    if (custidnumber) {
      throw new HttpException(
        'ID Number already exists.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (emailId.length > 0) {
      throw new HttpException(
        'Email Id already exists.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const createdUser = new this.userModel(CreateUserDto);

    const user = await createdUser.save();
    if (user.email_id) {
      const subject = 'Email Verification ✔';
      const content = `<div>Welcome to the iPass Community!</div>
      <br>
        <h4>Your new account details</h4>
        <div><p>Email: ${user.email_id}</p></div>
        <div><p>OTP: ${user.otp}</p></div>`;
      const mailPromise = await this.emailService.sendEmail(
        user,
        content,
        subject,
      );
      // reference: https://github.com/yanarp/nestjs-mailer

      if (mailPromise) {
        return {
          unique_id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email_id: user.email_id,
          dob: user.dob,
          gender: user.gender,
          mobile: user.mobile,
          idtype: user.idtype,
          idnumber: user.idnumber,
          idCard: user.idCard,
        };
      }
    }
  }

  //   async findAll(): Promise<Customer[]> {
  //     return this.userModel.find().exec();
  //   }

  async login(
    username: any,
    password: string,
    deviceToken: string,
  ): Promise<Customer> {
    const user = await this.userModel.findOne({
      email_id: username,
    });

    if (user?.deletedAt) {
      throw new HttpException('No user exist!', HttpStatus.BAD_REQUEST);
    }

    if (!user) {
      throw new HttpException('There is no user in the system regarding this email', HttpStatus.BAD_REQUEST);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST);
    }
    if (user?.otp_verified === true) {
      await this.userModel.updateOne(
        { email_id: username },
        {
          device_token: deviceToken,
        },
      );
      return user;
    } else {
      throw new HttpException('Please verify OTP', HttpStatus.BAD_REQUEST);
    }
  }

  async checkOtpVerified(userInput: any): Promise<Customer> {
    const data =
      userInput?.email_id_mob_no || userInput?.ID_PP_ID || userInput.email_id;
    const verified = await this.userModel.find({
      $or: [{ email_id: data }, { idnumber: data }],
    });
    if (verified.length === 0) {
      throw new HttpException(
        'User is Not found in the system.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!verified[0]?.otp_verified) {
      throw new HttpException(
        'Please verify OTP first !.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return verified[0];
  }

  async refreshtoken(refreshtoken: any): Promise<Customer> {
    const user = await this.userModel.findOne({
      email_id: refreshtoken.email_id_mob_no,
      otp_verified: true
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

  async submitotp(datas: any): Promise<any> {
    const val = await this.userModel.find({
      email_id: datas.email_id_mob_no,
      otp: datas.otp,
    });
    if (val.length === 0) {
      throw new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST);
    }

    const isMatch = await bcrypt.compare(datas.password, val[0].password);
    if (!isMatch) {
      throw new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST);
    }

    if (val[0]?.device_token === '') {
      const updateDeviceToken = await this.userModel.updateOne(
        { email_id: datas.email_id_mob_no, otp: datas.otp },
        { device_token: datas.device_token, otp_verified: true },
      );
      if (updateDeviceToken) {
        return val;
      }
    }
    throw new HttpException(
      'Device Token has been assigned',
      HttpStatus.BAD_REQUEST,
    );
  }

  async updateUser(userData: any, file: any, response): Promise<Customer> {
    const existingData = await this.userModel.findOne({
      email_id: userData.email_id,
    });
    const user = await this.userModel.findOneAndUpdate(
      { email_id: userData.email_id },
      {
        first_name: userData.first_name || existingData.first_name,
        last_name: userData.last_name || existingData.last_name,
        idtype: userData.idtype.toString().toLowerCase() || existingData.idtype,
        idnumber: userData.idnumber || existingData.idnumber,
        idCard: file?.location || existingData.idCard,
        dob: userData.dob || existingData.dob,
        mobile: userData.mobile || existingData.mobile,
        gender: userData.gender.toString().toLowerCase() || existingData.gender,
      },
      {
        new: true,
      },
    );
    if (user) {
      return response.send({
        unique_id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email_id: user.email_id,
        dob: user.dob,
        mobile: user.mobile,
        idtype: user.idtype,
        idnumber: user.idnumber,
        idCard: user.idCard,
      });
    }
  }

  async updateVerifySpecificUser(
    email: string,
    otp: number,
  ): Promise<Customer> {
    // console.log(email, otp);
    return this.userModel.findOne({
      email_id: email,
      otp: otp,
    });
  }

  async updatepassword(userObj: any, updateParams: any): Promise<Customer> {
    const passwordHash = await bcrypt.hash(updateParams.confirmPassword, 10);
    return this.userModel.findOneAndUpdate(
      { email_id: userObj.email_id },
      { password: passwordHash, otp_verified: true },
      {
        new: true,
      },
    );
  }

  async requestuser(requestUser: requestuser, response): Promise<Customer> {
    const idtype = requestUser?.ID_TYPE.toString().toLowerCase();
    const user = await this.userModel.findOne({
      idnumber: requestUser.ID_PP_ID,
      idtype,
      otp_verified: true,
    });
    if (!user) {
      throw new HttpException(
        'User is Not found in the system.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return response.send({
      unique_id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email_id: user.email_id,
      dob: user.dob,
      gender: user.gender,
      mobile: user.mobile,
      idtype: user.idtype,
      idnumber: user.idnumber,
      idCard: user.idCard,
    });
  }

  async getSpecificUser(email: string): Promise<Customer> {
    return this.userModel.findOne({
      email_id: email,
    });
  }

  async getTestInfo(data: any, inspectorId: any, company_id): Promise<any> {

    if (!inspectorId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new HttpException(
        'Kindly enter valid inspector id.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const inspector = await this.inspectorService.getInspector({
      _id: inspectorId,
    });

    if (!inspector) {
      return {
        success:
          'This inspector id dose not exit!',
      };
    } else {
      const originalText = await this.decryptUrl(data, 'PASSV');
      // let uidid;
      if (originalText) {
        const decryptedData = originalText.toString().split('/');
        const user = await this.userModel.findOne({
          uidi: decryptedData[3],
        });
        // return user;
        //console.log('userdata ',user);
        const custData1 = await this.testsModel
          .find(
            {
              customer: user._id,
              markstatus: 0,
            }
          ).sort({ _id: 'desc' });
        let custData = [];
        await custData1.map((item) => {
          if (item.resultstatusName) {
            //        console.log(item);
            if (custData.length == 0) {
              console.log('111')
              custData = [item];
            }
          }
        });
        console.log('custData ', custData);
        //return custData;
        const inspectorData = await this.inspectorService.getInspector({
          _id: inspectorId,
        });
        //return inspectorId;
        // console.log('inspectorData ',inspectorData);
        let visitor_Id = '';
        visitor_Id = user._id;
        let currentDate = new Date();
        let visitordata = {
          company: company_id,
          visitorId: visitor_Id,
          visitorname: user.first_name + ' ' + user.last_name,
          datetime: currentDate,
          contactnumber: user.mobile,
          inspector: inspectorData._id,
          inspectorname: inspectorData.firstname + ' ' + inspectorData.lastname,
          organization: inspectorData.organization,
          organizationname: inspectorData.organizationname,
          testid: custData[0]._id,
          disease: custData[0].testname,
          scanresult: custData[0].resultstatusName,
          entrygiven: 'Yes',
          creationDate: currentDate,
          status: 1,
        };
        //  console.log('visitor', visitordata);
        const visitors = new this.visitorsModel({ ...visitordata });
        let a = await visitors.save();
        if (visitors) {
          return {
            customer_id: user._id,
            customer_name: user.first_name + ' ' + user.last_name,
            mobile_no: user.mobile,
            inspectorId: inspectorData._id,
            inspector_name: inspectorData.firstname + ' ' + inspectorData.lastname,
            organizationId: inspectorData.organization,
            organizationname: inspectorData.organizationname,
            testname: custData[0].testname,
            test_status: custData[0].resultstatusName,
            testId: custData[0]._id,
          };
        }
      }
    }

  }

  async requestVisitor(data: any): Promise<any> {
    if (!data.inspector_id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new HttpException(
        'Kindly enter valid inspector id.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const inspectorIdExist = await this.inspectorService.getInspector({
      _id: data.inspector_id,
    });
  //  console.log('inspector exist',inspectorIdExist);
    if (inspectorIdExist == null) {
      throw new HttpException(
        'The inspector is not found in the system.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!inspectorIdExist) {
      return {
        success:
          'This inspector id dose not exit!',
      };
    } else {
      if (data.no_of_test === 0) {
        const visitor = await this.visitorsModel.find({
          inspector: data.inspector_id,
        });
        if (visitor.length == 0) {
          throw new HttpException(
            'Inpspector is Not found in the system.',
            HttpStatus.BAD_REQUEST,
          );
        }
//console.log("visitor");
//console.log(visitor);
//return false;
        let data1 = [];
        for (let j = 0; j < visitor.length; j++) {

          let customerData = await this.userModel.find({
            _id: visitor[j]['visitorId'],
            
          });
          let testData1 = await this.testsModel.find({
            _id: visitor[j]['testid'],
          });
          console.log('visitorData',testData1); 
          const testData = testData1[0];
          let returnTestData = {
            testid: testData.testid,
            testname: testData.testname,
            testdate: testData.testdate,
            resultstatus: testData.resultstatus,
            testtype: testData.testtypename,
            creationDate: testData.creationDate,
            resultdate: testData.resultdate,
            notes: testData.notes,
          }
        
         // for (let k = 0; k < customerData.length; k++){
           
          let returndata = {
            //_id: customerData[k]['_id'],
            first_name: customerData[0]['first_name'],
            last_name: customerData[0]['last_name'],
            email_id:customerData[0]['email_id'],
            mobile:customerData[0]['mobile'],
            dob:customerData[0]['dob'],
            idtype:customerData[0]['idtype'],
            idnumber:customerData[0]['idnumber'],
            test:returnTestData,

          };
          data1.push(returndata);

         // }
        }
        console.log('data1');
        console.log(data1);
        return { visitors: data1 }
      } else {
        const visitorData = await this.visitorsModel
          .find(
            {
              inspector: data.inspector_id,
            },
            null,
            { limit: data.no_of_test },
          )
          .sort('-datetime');

          let data1 = [];
          for (let j = 0; j < visitorData.length; j++) {
  
            let customerData = await this.userModel.find({
              _id: visitorData[j]['visitorId'],
              
            });

            
         
          let testData1 = await this.testsModel.find({
            _id: visitorData[j]['testid'],
          });
          console.log('visitorData',testData1); 
          const testData = testData1[0];
          let returnTestData = {
            testid: testData.testid,
            testname: testData.testname,
            testdate: testData.testdate,
            resultstatus: testData.resultstatus,
            testtype: testData.testtypename,
            creationDate: testData.creationDate,
            resultdate: testData.resultdate,
            notes: testData.notes,
          }
          // console.log('customerData',customerData); 
            //for (let k = 0; k < customerData.length; k++){
              
            let returndata = {
              //_id: customerData[k]['_id'],
              first_name: customerData[0]['first_name'],
              last_name: customerData[0]['last_name'],
              email_id:customerData[0]['email_id'],
              mobile:customerData[0]['mobile'],
              dob:customerData[0]['dob'],
              idtype:customerData[0]['idtype'],
              idnumber:customerData[0]['idnumber'],
              test:returnTestData,
            };
            data1.push(returndata);
  
            //}
          }
        return { visitors: data1 }
      }
    }
  }
  async requestTest(data: any): Promise<any> {
    let testData;
    if (data.no_of_test == 1) {
      console.log('A');
      const idtype = data.idtype.toString().toLowerCase();
      testData = await this.userModel.find({
        idtype,
        idnumber: data.idnumber,
        otp_verified: true,
      });


      const custData1 = await this.testsModel
        .find(
          {
            customer: testData[0]._id,
            markstatus: 0,
          }
        ).sort({ _id: 'desc' });
      let custData = [];
      await custData1.map((item) => {
        if (item.resultstatusName) {
          console.log(item);
          if (custData.length == 0) {
            console.log('111')
            custData = [item];
          }
        }
      });
      console.log(custData.length)
      if (custData.length > 0) {
        let data = [];
        let vaccinationData = await this.vaccinationsDocument.find({
          customer: custData[0].customer,
          disease: custData[0].testname,
        });

        let locationdata = await this.getLocationInfo(custData[0].location_id);
        let returndata = {
          _id: custData[0].id,
          testid: custData[0].queue,
          testname: custData[0].testname,
          testdate: custData[0].testdate,
          resultstatus: custData[0].resultstatus,
          testtype: custData[0].brand_kit,
          creationDate: custData[0].creationDate,
          resultdate: custData[0].resultdate,
          notes: custData[0].notes,
          vaccination: vaccinationData,
          location: locationdata,
        };
        data.push(returndata);

        return {
          _id: testData[0]._id,
          first_name: testData[0].first_name,
          last_name: testData[0].last_name,
          DOB: testData[0].dob,
          email_id: testData[0].email_id,
          mobile: testData[0].mobile,
          id_type: testData[0].idtype,
          id_number: testData[0].idnumber,
          id_name: testData[0].idName,
          idCard: testData[0].idCard,
          test: data,
        };
      }

    } else {


      if (data.unique_test_id) {
        if (!data.unique_test_id.match(/^[0-9a-fA-F]{24}$/)) {
          throw new HttpException(
            'Kindly enter valid test id.',
            HttpStatus.BAD_REQUEST,
          );
        }
        testData = await this.testsModel.find({
          _id: data.unique_test_id,
        });
      } else {
        if (!data.idtype || !data.idnumber) {
          throw new HttpException(
            'One or more parameter is missing/incorrect value.',
            HttpStatus.BAD_REQUEST,
          );
        }
        const idtype = data.idtype.toString().toLowerCase();
        testData = await this.userModel.find({
          idtype,
          idnumber: data.idnumber,
          otp_verified: true,
        });
      }

      if (testData.length === 0) {
        throw new HttpException(
          'The user is not found in the system.',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (testData[0]?.customer) {
        const custData = await this.userModel.find({
          _id: testData[0].customer,
        });

        if (custData) {
          const data = testData[0];

          const location = await this.locationslist.find({
            id: testData[0].location_id,
          });

          let vaccinationData = await this.vaccinationsDocument.find({
            customer: testData[0].customer,
            disease: testData[0].testname,
          });

          return {
            _id: custData[0]._id,
            first_name: custData[0].first_name,
            last_name: custData[0].last_name,
            DOB: custData[0].dob,
            email_id: custData[0].email_id,
            mobile: custData[0].mobile,
            id_type: custData[0].idtype,
            id_number: custData[0].idnumber,
            id_name: custData[0].idName,
            idCard: custData[0].idCard,
            test: {
              testid: data.queue,
              testname: data.testname,
              testdate: data.testdate,
              resultstatus: data.resultstatus,
              testtype: data.brand_kit,
              creationDate: data.creationDate,
              resultdate: data.resultdate,
              notes: data.notes,
              vaccination: vaccinationData,
              location: {
                _id: location[0].id,
                location_name: location[0].location_name,
                address1: location[0].address1,
                address2: location[0].address2,
                city: location[0].city,
                postal_code: location[0].postal_code,
                company: location[0].company,
                creationDate: location[0].creationDate,
                __v: location[0].__v,
                user: location[0].user,
              },
            },
          };
        }
      } else {
        const custData = await this.testsModel
          .find(
            {
              customer: testData[0]._id,
            },
            null,
            { limit: data.no_of_test },
          )
          .sort('-testdate');
        if (custData) {
          let data = [];
          for (let j = 0; j < custData.length; j++) {

            let vaccinationData = await this.vaccinationsDocument.find({
              customer: custData[j]['customer'],
              disease: custData[j]['testname'],
            });

            let locationdata = await this.getLocationInfo(custData[j].location_id);
            let returndata = {
              _id: custData[j]['_id'],
              testid: custData[j]['queue'],
              testname: custData[j]['testname'],
              testdate: custData[j]['testdate'],
              resultstatus: custData[j]['resultstatus'],
              testtype: custData[j]['brand_kit'],
              creationDate: custData[j]['creationDate'],
              resultdate: custData[j]['resultdate'],
              notes: custData[j]['notes'],
              vaccination: vaccinationData,
              location: locationdata,
            };
            data.push(returndata);
          }

          return {
            _id: testData[0]._id,
            first_name: testData[0].first_name,
            last_name: testData[0].last_name,
            DOB: testData[0].dob,
            email_id: testData[0].email_id,
            mobile: testData[0].mobile,
            id_type: testData[0].idtype,
            id_number: testData[0].idnumber,
            id_name: testData[0].idName,
            idCard: testData[0].idCard,
            test: data,
          };
        }
      }
    }
  }

  async randomString(length, chars) {
    let result = '';
    for (let i = length; i > 0; --i)
      result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
  }

  async requestqrfile(url: any): Promise<any> {
    const custInfo = url._doc;
    const datenow = Date.now();
    const firstName = custInfo.first_name
      .replace(/ /g, '_')
      .replace(/\(/g, '-')
      .replace(/\)/g, '-');
    const lastname = custInfo.last_name
      .replace(/ /g, '_')
      .replace(/\(/g, '-')
      .replace(/\)/g, '-');
    const idtype = custInfo.idtype
      .replace(/ /g, '_')
      .replace(/\(/g, '-')
      .replace(/\)/g, '-');
    const name = firstName + ' ' + lastname;
    const uidid = await this.randomString(
      8,
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' + datenow,
    );
    console.log(custInfo.uidi);
    if (custInfo.uidi === '' || custInfo.uidi == undefined) {
      throw new HttpException(
        'No QR Generated. Please contact the laboratory. Email: support@healthmatrix.ai',
        HttpStatus.BAD_REQUEST,
      );
    }

    const urlPath =
      (process.env.urlqr || 'https://matrix-ipass.ai') + '/view/';

    let encUrl = '' + name + '/' + custInfo.dob + '/' + custInfo.idnumber + '/' + custInfo.uidi + '/';
    var encrypteddata = await this.encryptUrl(encUrl, 'PASSV');

    await qrcode.toFile('./qr-code.jpeg', urlPath + encrypteddata);
    console.log('encryption -- ', encrypteddata.toString());
    await this.userModel.findOneAndUpdate(
      { email_id: custInfo.email_id, otp_verified: true },
      { uidid: uidid },
      {
        new: true,
      },
    );
    return encrypteddata;
  }
  /////////////QR Modification for Test/Vaccination/Recovery Certificate (New API logic)//////////
  //script start///
  async decryptTestUrl(string: string, secretkey: string) {
    let KEY_SIZE = 22;
    const encryptedd = CryptoJS.enc.Base64.parse(string);
    const iv_len = 24;
    const salt_len = 24;
    const salts = CryptoJS.lib.WordArray.create(
      encryptedd.words.slice(0, salt_len / 4)
    );
    const idv = CryptoJS.lib.WordArray.create(
      encryptedd.words.slice(0 + salt_len / 4, (salt_len + iv_len) / 4)
    );

    const keys = CryptoJS.PBKDF2(secretkey, salts, { keySize: KEY_SIZE, iterations: 10000, hasher: CryptoJS.algo.SHA256 });
    const encryptes = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.lib.WordArray.create(encryptedd.words.slice((salt_len + iv_len) / 4)) }, keys, { iv: idv });
    return encryptes.toString(CryptoJS.enc.Utf8);
  }


  async requesttestqrfile(url: any, test_id: any): Promise<any> {
    const custInfo = url._doc;
    const testid = test_id;
    //console.log('testid'+testid);
    const datenow = Date.now();
    const firstName = custInfo.first_name
      .replace(/ /g, '_')
      .replace(/\(/g, '-')
      .replace(/\)/g, '-');
    const lastname = custInfo.last_name
      .replace(/ /g, '_')
      .replace(/\(/g, '-')
      .replace(/\)/g, '-');
    const idtype = custInfo.idtype
      .replace(/ /g, '_')
      .replace(/\(/g, '-')
      .replace(/\)/g, '-');
    const name = firstName + ' ' + lastname;
    const uidid = await this.randomString(
      8,
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' + datenow,
    );
    console.log(custInfo.uidi);
    if (custInfo.uidi === '' || custInfo.uidi == undefined) {
      throw new HttpException(
        'No QR Generated. Please contact the laboratory. Email: support@healthmatrix.ai',
        HttpStatus.BAD_REQUEST,
      );
    }

    const urlPath =
      (process.env.urlqr || 'https://matrix-ipass.ai') + '/view/';

    let encUrl = '' + name + '/' + custInfo.dob + '/' + custInfo.idnumber + '/' + custInfo.uidi + '/' + 'T' + '/' + testid + '/';

    var encrypteddata = await this.encryptUrl1(encUrl, 'PASSV');

    await qrcode.toFile('./qr-code.jpeg', urlPath + encrypteddata);
    console.log('encryption -- ', encrypteddata.toString());
    await this.userModel.findOneAndUpdate(
      { email_id: custInfo.email_id, otp_verified: true },
      { uidid: uidid },
      {
        new: true,
      },
    );
    console.log(encrypteddata);
    return encrypteddata;
  }

  async decryptTest(data: string): Promise<any> {
    //Decrypt
    const originalText = await this.decryptTestUrl(data, 'PASSV');
    if (originalText) {
      const decryptedData = originalText.toString().split('/');
      const user = await this.userModel.findOne({
        uidi: decryptedData[3],
      });

      return {
        name: decryptedData[0],
        dob: decryptedData[1],
        idnumber: decryptedData[2],
        idtype: user?.idtype || '',
        testid: decryptedData[5],
      };
    } else {
      throw new HttpException(
        'Please enter valid data.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async encryptUrl1(string: string, secretkey: string) {
    //Encrypted URL

    let KEY_SIZE = 22;
    const salt = CryptoJS.lib.WordArray.random(24);
    const iv = CryptoJS.lib.WordArray.random(24);
    const key = CryptoJS.PBKDF2(secretkey, salt, { keySize: KEY_SIZE, iterations: 10000, hasher: CryptoJS.algo.SHA256 });
    const encrypted = CryptoJS.AES.encrypt(string, key, { iv: iv }).ciphertext;
    const concatenned = CryptoJS.lib.WordArray.create().concat(salt).concat(iv).concat(encrypted)
    return concatenned.toString(CryptoJS.enc.Base64);
  }
  ///script end///

  async decrypt(data: string): Promise<any> {
    //Decrypt
    const originalText = await this.decryptUrl(data, 'PASSV');
    if (originalText) {
      const decryptedData = originalText.toString().split('/');
      const user = await this.userModel.findOne({
        uidi: decryptedData[3],
      });

      return {
        name: decryptedData[0],
        dob: decryptedData[1],
        idnumber: decryptedData[2],
        idtype: user?.idtype || '',
      };
    } else {
      throw new HttpException(
        'Please enter valid data.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async ValidateEmail(mail) {
    const format = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (format.test(mail)) {
      return true;
    }
    return false;
  }
  0
  async forgotpassword(email_id_mob_no: string): Promise<any> {
    const emailvalidated = await this.ValidateEmail(email_id_mob_no);
    if (!emailvalidated) {
      throw new HttpException(
        'Please enter valid email.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.userModel.findOne({
      email_id: email_id_mob_no,
    });
    if (!user) {
      return {
        success:
          'You will get the recovery link if you are already registered in the System',
      };
    }
    if (user.email_id) {
      const otp = Math.floor(Math.random() * (999999 - 1 + 1) + 1);
      await this.userModel.updateOne(
        { email_id: email_id_mob_no },
        { otp: otp },
      );
      const path = process.env.URL_PATH || 'http://localhost:3000';
      // reference: https://github.com/yanarp/nestjs-mailer
      //   https://docs.nestjs.com/recipes/serve-static
      //   static is configured to client directory(index.html)
      // so when the user queries for path/?email it will serve the static page
      const forgotLink = `${path}/passwordreset?email=${user.email_id}&otp=${otp}`;
      const subject = 'Forgot Password Link ✔';
      const content = `<p>You are receiving this email because we received a password reset request for your account. If you did not request a password reset, no further action is required<p>
        <p>Please use this <a href="${forgotLink}">link</a> to reset your password.</p>`;
      const mailPromise = await this.emailService.sendEmail(
        user,
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

  //Get All test type list
  async requesttesttypes(headers: any): Promise<any> {
    //Getting Company ID
    let company = '';

    let testtypelistdata;
    let locationslistdata;

    if (headers['x-client-id'] != undefined && headers['x-client-id'] !== '') {
      company = headers['x-client-id'];
      testtypelistdata = await this.testtypelist.find({ 'company': company }).sort({ _id: 'ASC' });
      locationslistdata = await this.locationslist.find({ 'company': company });
    } else {
      testtypelistdata = await this.testtypelist.find().sort({ _id: 'ASC' });
      locationslistdata = await this.locationslist.find();
    }
    return { testtypelistdata, "locations": locationslistdata ?? '' };
  }

  async getLocationInfo(id) {
    let data = await this.locationslist.findById(id);
    return data;
  }

  async findQueuenumber(): Promise<any> {
    const queue_finder = await this.testsModel.find().sort({ '_id': -1 }).limit(1)
    //createTestDto.queue = String(+(queue_finder[0]?.queue) + 1);
    return String(+(queue_finder[0]?.queue) + 1);
  }

  //Submit schedule test
  async submittestrequest(createTestDto: SaveScheduleTestDto, userLoggedIn): Promise<any> {

    const queue_finder = await this.testsModel.find().sort({ '_id': -1 }).limit(1);
    if (queue_finder[0].testdate === null) {
      return {
        error:
          'No test date found',
      };
    }
    let tdate = queue_finder[0].testdate.getDate() + '/' + queue_finder[0].testdate.getMonth() + '/' + queue_finder[0].testdate.getFullYear();

    let currentDate = new Date();
    let cdate = currentDate.getDate() + '/' + currentDate.getMonth() + '/' + currentDate.getFullYear();

    let testtypename = createTestDto.testname;
    let testdate = createTestDto.testdate;

    //const testid = String(+(queue_finder[0]?.queue) + 1);

    // console.log('test date: '+testdate);
    //console.log('test id: '+testid);
    let notes = createTestDto.testdate;
    //console.log('queue no: '+queue);
    //console.log('note:'+notes);
    let scheduledDate = String(new Date(notes));
    console.log(scheduledDate);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let arr_sdate = scheduledDate.split(" ");
    console.log(arr_sdate);
    let month1: any = 1;
    let day1: any = arr_sdate[2];
    let year1: any = arr_sdate[3];
    console.log(arr_sdate);
    console.log(day1)
    monthNames.forEach(function (item, index) {
      if (item === arr_sdate[1]) {
        month1 = index + Number(1);
      }
    });
    if (month1 < 10) {
      month1 = 0 + "" + month1;
    }
    const output_s: any = year1 + '-' + month1 + '-' + day1;
    console.log(output_s)
    const output1 = new Date(output_s + ' 00:00:00');
    const output2 = new Date(output_s + ' 23:59:00');
    console.log('output1 : ', output1);
    console.log('output1 : ', output2);

    //const queue_finder = await this.testsModel.find().sort({ '_id': -1 }).limit(1);

    const queue_finder1 = await this.testsModel
      .find({ markstatus: 1 }).and([
        { $or: [{ testdate: { $gte: output1, $lte: output2 } }] },
      ])
      .limit(1)
      .sort({ queue: 'desc' })
      .exec();
    let queue = "";
    if (queue_finder1.length > 0) {
      queue = String(+(queue_finder[0]?.queue) + 1);
    } else {
      queue = String(+(100) + 1);
    }

    const queue_finder2 = await this.testsModel.find().sort({ '_id': -1 }).limit(1);

    let testid;
    if (queue_finder2.length > 0) {
      testid = String(+(queue_finder2[0]?.testid) + 1);
    } else {
      testid = String(+(100) + 1);
    }
    console.log(queue);
    console.log('test queue no.' + testid);
    const scheduled = new this.testsModel({ ...createTestDto, queue, testid, testtypename });
    let a = await scheduled.save();

    const subject = 'Schedule Test';
    let retdate = String(testdate).split('T');
    let dateformate = String(retdate[0]).split('-');
    const content = `<p>You have scheduled a new test <p>
                       <div><p>Test Date: ${dateformate[2] + '-' + dateformate[1] + '-' + dateformate[0]}</p></div>
                       <div><p>Test Name: ${testtypename}</p></div>
                       <div><p>Ticket No: ${queue}</p></div>`;
    await this.emailService.sendEmail(userLoggedIn, content, subject);

    return scheduled;
  }

  //Get All Scheduled test list
  async requestscheduledlist(): Promise<any> {
    const Scheduletestdata = await this.testsModel.find();
    return Scheduletestdata;
  }
  // resend otp functionality, for mobile app
  async resendotp(email_id_mob_no: string): Promise<any> {
    const user = await this.userModel.findOne({
      email_id: email_id_mob_no,
      otp_verified: false,
    }).sort({ 'creationDate': -1 }).limit(1);

    if (user === null) {
      return {
        success:
          'You will get a OTP, if you are a registered user in the system',
      };
    }

    if (user.email_id) {
      const token = await this.tokenService.getToken(user[0]);
      const otp = Math.floor(Math.random() * (999999 - 1 + 1) + 1);
      await this.userModel.updateOne(
        { email_id: email_id_mob_no, otp_verified: false },
        { otp: otp },
      ).sort({ 'creationDate': -1 }).limit(1);

      const subject = 'OTP ✔';
      const content = `<p>You are receiving this email because we received an OTP resend request for your account. If you did not request an OTP resend, no further action is required<p>
                       <div><p>New iPass OTP: ${otp}</p></div>`;
      await this.emailService.sendEmail(user, content, subject);
      return {
        success:
          'You will get a OTP, if you are a registered user in the system',
        jwt_Token: token?.jwt_Token,
      };
    }
  }

  //Submit schedule test
  async submitfeedback(feedbacksDto: FeedbacksDto): Promise<any> {
    const feedbacks = new this.feedbacksModel(feedbacksDto);
    return feedbacks;
  }

  //Update scheduled Test
  async updateScheduledtest(updateScheduleDto: UpdateScheduleDto): Promise<any> {
    let testdateObj = new Date(updateScheduleDto.testdate);
    const schedule = await this.testsModel.findOneAndUpdate(
      { _id: updateScheduleDto._id, },
      {
        testdate: testdateObj,
        location_id: updateScheduleDto.location_id
      },
      {
        new: true,
      },
    );
    return schedule;
  }

  //Update Profile
  async updateProfile(updateProfileDto: UpdateProfileDto): Promise<any> {

    const profileRecord = await this.userModel.findOne({ idnumber: updateProfileDto.idnumber });
    const profile = await this.userModel.findOneAndUpdate(
      { idnumber: updateProfileDto.idnumber, },
      {
        first_name: updateProfileDto.first_name || profileRecord.first_name,
        last_name: updateProfileDto.last_name || profileRecord.last_name,
        mobile: updateProfileDto.mobile || profileRecord.idnumber,
      },
      {
        new: true,
      },
    );
    return profile;
  }

  async encryptUrl(string: string, secretkey: string) {
    //Encrypted URL

    let KEY_SIZE = 22;
    const salt = CryptoJS.lib.WordArray.random(24);
    const iv = CryptoJS.lib.WordArray.random(24);
    const key = CryptoJS.PBKDF2(secretkey, salt, { keySize: KEY_SIZE, iterations: 10000, hasher: CryptoJS.algo.SHA256 });
    const encrypted = CryptoJS.AES.encrypt(string, key, { iv: iv }).ciphertext;
    const concatenned = CryptoJS.lib.WordArray.create().concat(salt).concat(iv).concat(encrypted)
    return concatenned.toString(CryptoJS.enc.Base64);
  }
}