import {
  Body,
  Controller,
  Request,
  Post,
  Headers,
  Req,
  Res,
  UseInterceptors,
  UseGuards,
  HttpCode,
  HttpException,
  HttpStatus,
  Redirect,
  Get,
} from '@nestjs/common';
import { UsersService } from './customers.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateProfileDto } from './dto/update-user.dto';
import { inspectoruserlogin } from '../inspector/dto/inspectorlogin.dto';
import { requesttestqr } from './dto/requesttestqr.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiExcludeEndpoint,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from '../auth/auth.service';
import JwtAuthGuard from 'src/auth/jwt-authentication.guard';
import { loginuser } from './dto/login-user.dto';
import { submitotp } from './dto/submit-otp.dto';
import { resendotp } from './dto/resend-otp.dto';
import { requesttest } from './dto/request-test.dto';
import { requestuser } from './dto/request-user.dto';
import { decrypturl } from './dto/decrypt-url.dto';
import * as fs from 'fs';
import { forgotpassword } from './dto/forgot-password.dto';
import { refreshtoken } from './dto/refresh-token.dto';
import { CreateTestDto, SaveScheduleTestDto, ScheduleTestDto } from './dto/schedule-test.dto';
import { UpdateScheduleDto } from './dto/update-schedule-test.dto';
import { FeedbacksDto } from './dto/feedbacks.dto';
import { TokenserviceService } from '../tokenservice/tokenservice.service';
import * as bcrypt from 'bcrypt';
import { IdconfigurationsService } from "../idconfigurations/idconfigurations.service";
import { InspectorService } from '../inspector/inspector.service';
import { decrypttesturl } from './dto/decrypttest-url.dto';
const AWS_S3_BUCKET_NAME =
  process.env.AWS_S3_BUCKET_NAME || 'matrix-ipass-document';
const s3 = new AWS.S3();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

// used to replace client_secret with ***** for production
const IS_PROD = process.env.NODE_ENV === 'production';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenserviceService,
    private authService: AuthService,
    private readonly IdconfigurationsService: IdconfigurationsService,
    private InspectorService: InspectorService,
  ) { }

  //   registration
  @Post('registeruser')
  @HttpCode(200)
  @ApiHeader({
    name: 'client_secret',
    description: IS_PROD ? '*****' : 'password7854',
  })
  @ApiHeader({
    name: 'x-client-id',
    description: 'TERRe7845',
  })
  @ApiOperation({
    summary: 'Register User.',
    description:
      'This Endpoint is used to submit the user information for the first time for registration and it automatically triggers the OTP to be sent to the email ID received.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiTags('API')
  @UseInterceptors(
    FileInterceptor('idCard', {
      storage: multerS3({
        s3: s3,
        bucket: AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read', //in future remove public read and use this 'authenticated-read',
        serverSideEncryption: 'AES256',
        key: function (request, file, cb) {
          cb(null, `${Date.now().toString()} - ${file.originalname}`);
        },
      }),
    }),
  )
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        unique_id: {
          type: 'string',
          example: '5fed7c1c3527592ef0cd0dcc',
          description: 'Unique ID of the User in DB.',
        },
        first_name: {
          type: 'string',
          example: 'Thomas',
          description: 'First Name of the user.',
        },
        last_name: {
          type: 'string',
          example: 'Williams',
          description: 'Last Name of the user.',
        },
        email_id: {
          type: 'string',
          example: 'ex@example.com',
          description: 'ex@example.com.',
        },
        mobile: {
          type: 'string',
          example: '7418529635',
          description: 'Mobile Number of the user.',
        },
        dob: {
          type: 'string',
          example: '1990-10-20',
          description: 'DOB of the user (yyyy-mm-dd).',
        },
        gender: {
          type: 'string',
          example: 'Female',
          description: 'Gender of the user (Male/Female/NonBinary).',
        },
        idtype: {
          type: 'string',
          example: 'passport',
          description:
            'Type of Identification of the user (Passport/National ID).',
        },
        idnumber: {
          type: 'string',
          example: 'Thomas',
          description: 'The Identification No. of the user.',
        },
        idCard: {
          type: 'string',
          example: 's3.amazon.com/sddfredfefer',
          description: 'Amazon s3 expiring Link.',
        },
        JWT_token_temp: {
          type: 'string',
          example: 'eyJz93ak4laUWw.utetwruyteuw.gsdjfjhdgsfjhg',
          description: 'Authentication token returned from the server.',
        },
        token_type: {
          type: 'string',
          example: 'Bearer',
          description: 'The token type description.',
        },
        expires_in: {
          type: 'string',
          example: '1610771905',
          description: 'Expiry date in a month of token in Unix Epoc Time.',
        },
      },
    },
    description: 'Registration successfull.',
  })
  @ApiResponse({
    status: 400,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example:
            'First name or Last name should not have special characters(/)',
        },
      },
    },
    description:
      'First name or Last name should not have special characters(/)',
  })
  @ApiResponse({
    status: 401,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 401,
        },
        message: {
          type: 'string',
          example: 'Invalid Client Credentials',
        },
      },
    },
    description: 'Invalid Client Credentials',
  })
  async create(
    @Headers() headers,
    @Req() request,
    @Res() response,
    @Body() createUserDto: CreateUserDto,
  ) {
    console.log('--- ', createUserDto);
    if (createUserDto.first_name.length > 50) {
      throw new HttpException(
        'First name cannot be greater than 50 characters',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (createUserDto.last_name.length > 50) {
      throw new HttpException(
        'Last name cannot be greater than 50 characters',
        HttpStatus.BAD_REQUEST,
      );
    }

    // date validation to match yyyy-mm-dd
    const pattern = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;
    const patternMob = (/^[0-9+\b]+$/);

    const date = new Date(createUserDto?.dob);

    if (date.toString() === 'Invalid Date') {
      throw new HttpException('Invalid Date.', HttpStatus.BAD_REQUEST);
    }

    if (!pattern.test(createUserDto?.dob)) {
      throw new HttpException(
        'Please enter valid date(yyyy-mm-dd).',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!patternMob.test(createUserDto?.mobile)) {
      throw new HttpException(
        'Please enter valid Mobile No',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (createUserDto?.mobile.length > 15) {
      throw new HttpException(
        'Mobile must be a phone Number',
        HttpStatus.BAD_REQUEST,
      );
    }

    // first & last name validate to check for any special character or numbers
    // const format = /^[a-zA-Z-,]+(\s{0,1}[a-zA-Z-, ])*$/;
    // to make sure the name doesn't contain /.
    const format = /\//;
    // let firstName = createUserDto.first_name;
    const firstName = format.test(createUserDto.first_name);
    // let lastName = createUserDto.last_name;
    const lastName = format.test(createUserDto.last_name);
    if (firstName || lastName) {
      throw new HttpException(
        'Firstname/Lastname contains Special characters(/)',
        HttpStatus.BAD_REQUEST,
      );
    }

    const expirydate = new Date();
    expirydate.setDate(expirydate.getDate() + 1);
    const type = createUserDto?.idtype.toString().toLowerCase();
    let Idtype;
    if (type !== 'other' && type.match(/^[0-9a-fA-F]{24}$/)) {
      let idtypedata = await this.IdconfigurationsService.getIdTypeByID(type);
      Idtype = idtypedata.name.toString().toLowerCase();
      if (createUserDto?.idnumber.length > idtypedata.size) {
        throw new HttpException(
          'ID numbers cannot be greater than ' + idtypedata.size + ' characters',
          HttpStatus.BAD_REQUEST,
        );
      }
      let idNumberCheck;
      if (idtypedata.type === 2) {
        idNumberCheck = new RegExp('^[0-9A-Za-z-]+$');
        if (!idNumberCheck.test(createUserDto?.idnumber)) {
          throw new HttpException(
            'Please enter valid ID Number(it should contain only characters, numbers and hypens)',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        idNumberCheck = new RegExp("^[0-9]+$");
        if (!idNumberCheck.test(createUserDto?.idnumber)) {
          throw new HttpException(
            'Please enter valid ID Number(it should contain only numbers)',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    } else if (type === 'other') {
      Idtype = type.toString().toLowerCase()
      if (createUserDto?.idnumber.length > 30) {
        throw new HttpException(
          'ID number cannot be greater than 30 characters',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!createUserDto?.idName) {
        throw new HttpException('Kindly enter Id Name', HttpStatus.BAD_REQUEST);
      }
      if (createUserDto?.idName.length > 70) {
        throw new HttpException(
          'ID name cannot be greater than 70 characters',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      throw new HttpException(
        'Please enter valid ID type.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (createUserDto?.gender) {
      const gender = createUserDto?.gender?.toString().toLowerCase();
      if (gender !== 'male' && gender !== 'female' && gender !== 'nonbinary') {
        throw new HttpException(
          'Please enter gender type.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    if (!request.file) {
      throw new HttpException(
        'Please upload the file(idcard)',
        HttpStatus.BAD_REQUEST,
      );
    }
    const passwordHash = await bcrypt.hash(createUserDto?.password, 10);
    //const otp = process.env.NODE_ENV === 'dev'? 4242 : Math.floor(Math.random() * (999999 - 1 + 1) + 1);
    const otp = Math.floor(Math.random() * (999999 - 1 + 1) + 1);
    // As per design, this Will need to be verified later with client_secret

    let company = '';
    if (headers['x-client-id'] !== '') {
      company = headers['x-client-id'];
    } else if (company === '') {
      company = process.env.CLIENT_ID;
    } else {
      company = "5fec82e83700ae08d87692b7";
    }
    console.log(company);

    createUserDto = {
      first_name: createUserDto.first_name,
      last_name: createUserDto.last_name,
      idtype: Idtype,
      idnumber: createUserDto.idnumber,
      idCard: request.file.location,
      mobile: createUserDto.mobile || '',
      email_id: createUserDto.email_id || '',
      password: passwordHash,
      device_token: '',
      dob: createUserDto.dob || '',
      otp,
      otp_verified: false,
      uidi: '',
      uidid: '',
      digital_status: 0,
      company,
      creationDate: new Date(),
      gender: createUserDto.gender?.toString().toLowerCase() || '',
      idName: createUserDto?.idName || '',
      idtypeId: type,
    };

    // jwt sample
    // https://wanago.io/2020/09/21/api-nestjs-refresh-tokens-jwt/#:~:text=Once%20the%20API%20states%20that,needs%20to%20perform%20a%20refresh.&text=To%20refresh%20the%20token%2C%20the,separate%20endpoint%2C%20called%20%2Frefresh.&text=If%20it%20is%20valid%20and,the%20username%20and%20password%20again.
    const finalValue = {
      ...createUserDto,
    };
    const result = await this.usersService.create(finalValue);

    const token = await this.tokenService.getToken(result);
    const data = {
      ...result,
      JWT_token_temp: token.jwt_Token,
      token_type: token.token_type,
      expires_in: token.expiresIn,
      headers: headers,
      company: company,
    };
    return response.send(data);
  }

  //   login
  @ApiTags('API')
  @HttpCode(200)
  @ApiHeader({
    name: 'client_secret',
    description: IS_PROD ? '*****' : 'password7854',
  })
  @ApiHeader({
    name: 'x-client-id',
    description: 'TERRe7845',
  })
  @ApiOperation({
    summary: 'Login User.',
    description:
      'This Endpoint is used to login the user if the user is already registered.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        first_name: {
          type: 'string',
          example: 'Thomas',
          description: 'First Name of the user.',
        },
        last_name: {
          type: 'string',
          example: 'Williams',
          description: 'Last Name of the user.',
        },
        mobile: {
          type: 'string',
          example: '7418529635',
          description: 'Mobile Number of the user.',
        },
        user_type: {
          type: 'string',
          example: 'normal',
          description: 'Type of the user (Normal/Inspector).',
        },
        idtype: {
          type: 'string',
          example: 'passport',
          description:
            'Type of Identification of the user (Passport/National ID).',
        },
        idnumber: {
          type: 'string',
          example: 'Thomas',
          description: 'The Identification No. of the user.',
        },
        idCard: {
          type: 'string',
          example: 's3.amazon.com/sddfredfefer',
          description: 'Amazon s3 expiring Link.',
        },
        access_token: {
          type: 'string',
          example: 'eyJz93ak4laUWw.utetwruyteuw.gsdjfjhdgsfjhg',
          description: 'Authentication token returned from the server.',
        },
        refresh_token: {
          type: 'string',
          example: 'eyJz93ak4laUWw.utetwruyteuw.gsdjfjhdgsfjhg',
          description: 'Authentication token returned from the server.',
        },
        token_type: {
          type: 'string',
          example: 'Bearer',
          description: 'The token type description.',
        },
        expires_in: {
          type: 'string',
          example: '1610771905',
          description: 'Expiry date in a month of token in Unix Epoc Time.',
        },
      },
    },
    description: 'Login successful!.',
  })
  @ApiResponse({
    status: 400,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example: 'Invalid Request check parameters',
        },
      },
    },
    description: 'Invalid Request check parameters.',
  })
  @ApiResponse({
    status: 401,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 401,
        },
        message: {
          type: 'string',
          example: 'Invalid Client Credentials',
        },
      },
    },
    description: 'Invalid Client Credentials',
  })

  // Coustomer = 0 and Inspector = 1

  @Post('loginuser')
  async login(@Request() req, @Body() loginUserDto: loginuser) {

    let user;
    let result;
    if (req.body['user_type']) {
      result = await this.InspectorService.inspectorlogin(loginUserDto);
      const token = await this.tokenService.getToken(result);
      if (result) {
        user = {
          first_name: result.firstname,
          last_name: result.lastname,
          mobile: result.mobile,
          gender: result.gender,
          user_type: 1,
          access_token: token.jwt_Token,
          refresh_token: token.refresh_token,
          token_type: 'Bearer',
          expiresIn: token.expiresIn,
        }
      }
    } else {
      result = await this.authService.login(loginUserDto);
      user = {
        ...result,
        user_type: 0,
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        token_type: 'Bearer',
        expiresIn: result.expiresIn,
      }
    }
    return user;
  }

  //   forgot password
  @ApiTags('API')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'string',
          example: 'Recovery Link send to the associated email ID',
          description: 'OTP will be sent to the registered email.',
        },
      },
    },
    description: 'Recovery Link send to the associated email ID.',
  })
  @ApiResponse({
    status: 400,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example: 'Invalid Request check parameters',
        },
      },
    },
    description: 'Invalid Request check parameters.',
  })
  @ApiResponse({
    status: 401,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 401,
        },
        message: {
          type: 'string',
          example: 'Invalid Client Credentials',
        },
      },
    },
    description: 'Invalid Client Credentials',
  })
  @ApiHeader({
    name: 'client_secret',
    description: IS_PROD ? '*****' : 'password7854',
  })
  @ApiHeader({
    name: 'x-client-id',
    description: 'TERRe7845',
  })
  @ApiOperation({
    summary: 'Forgot Password.',
    description:
      'This Endpoint is used to recover the password of the username using email ID.',
  })
  @Post('forgotpassword')
  async forgotpassword(@Request() req, @Body() forgotpassword: forgotpassword) {
    let result;
    if (req.body['user_type']) {
      if (req.body['user_type'] == 1) {
        result = await this.InspectorService.forgotpassword(forgotpassword.email_id_mob_no);
      } else {
        return {
          success:
            'You will get the recovery link if you are already registered in the System',
        };
      }

    } else {
      result = await this.usersService.forgotpassword(forgotpassword.email_id_mob_no);
    }
    return result;
  }

  //   submitotp
  @ApiTags('API')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        first_name: {
          type: 'string',
          example: 'Thomas',
          description: 'First Name of the user.',
        },
        last_name: {
          type: 'string',
          example: 'Williams',
          description: 'Last Name of the user.',
        },
        mobile: {
          type: 'string',
          example: '7418529635',
          description: 'Mobile Number of the user.',
        },
        idtype: {
          type: 'string',
          example: 'passport',
          description:
            'Type of Identification of the user (Passport/National ID).',
        },
        idnumber: {
          type: 'string',
          example: 'Thomas',
          description: 'The Identification No. of the user.',
        },
        idCard: {
          type: 'string',
          example: 's3.amazon.com/sddfredfefer',
          description: 'Amazon s3 expiring Link.',
        },
        access_token: {
          type: 'string',
          example: 'eyJz93ak4laUWw.utetwruyteuw.gsdjfjhdgsfjhg',
          description: 'Authentication token returned from the server.',
        },
        refresh_token: {
          type: 'string',
          example: 'eyJz93ak4laUWw.utetwruyteuw.gsdjfjhdgsfjhg',
          description: 'Authentication token returned from the server.',
        },
        expires_in: {
          type: 'string',
          example: '1610771905',
          description: 'Expiry date in a month of token in Unix Epoc Time.',
        },
      },
    },
    description: 'OTP confirmed and user Loggedin.',
  })
  @ApiResponse({
    status: 400,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example: 'Invalid OTP or No OTP',
        },
      },
    },
    description: 'Invalid OTP or No OTP',
  })
  @ApiResponse({
    status: 401,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 401,
        },
        message: {
          type: 'string',
          example: 'Temporary jwt token expired! Resend OTP',
        },
      },
    },
    description: 'Temporary jwt token expired! Resend OTP',
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Submit OTP for confirmation',
    description:
      'This Endpoint is used to submit the recieved OTP back to the server for loggin in the DEVTEST App user. This Endpoint can be used again if the first OTP is not received.',
  })
  @Post('submitotp')
  async submitotp(
    @Res() response,
    @Body() submitotp: submitotp,
  ) {
    const value = await this.usersService.submitotp(submitotp);

    const tokenservice = await this.tokenService.getToken(value[0]);

    const {
      first_name,
      last_name,
      mobile,
      user_type,
      idtype,
      idnumber,
      idCard,
    } = value[0];

    return response.send({
      first_name,
      last_name,
      mobile,
      user_type,
      idtype,
      idnumber,
      idCard,
      access_token: tokenservice.jwt_Token,
      refresh_token: tokenservice.refresh_token,
      expiresIn: tokenservice.expiresIn,
    });
  }

  //   updateuser
  @HttpCode(200)
  @ApiTags('API')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update User Details.',
    description:
      'This Endpoint is used to update the user information of the registered user.',
  })
  @UseInterceptors(
    FileInterceptor('idCard', {
      storage: multerS3({
        s3: s3,
        bucket: AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read', //in future remove public read and use this 'authenticated-read',
        serverSideEncryption: 'AES256',
        key: function (request, file, cb) {
          cb(null, `${Date.now().toString()} - ${file.originalname}`);
        },
      }),
    }),
  )
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        unique_id: {
          type: 'string',
          example: '5fed7c1c3527592ef0cd0dcc',
          description: 'Unique ID of the User in DB.',
        },
        first_name: {
          type: 'string',
          example: 'Thomas',
          description: 'First Name of the user.',
        },
        last_name: {
          type: 'string',
          example: 'Williams',
          description: 'Last Name of the user.',
        },
        email_id: {
          type: 'string',
          example: 'ex@example.com',
          description: 'ex@example.com.',
        },
        mobile: {
          type: 'string',
          example: '7418529635',
          description: 'Mobile Number of the user.',
        },
        dob: {
          type: 'string',
          example: '1990-10-20',
          description: 'DOB of the user (yyyy-mm-dd).',
        },
        idtype: {
          type: 'string',
          example: 'passport',
          description:
            'Type of Identification of the user (Passport/National ID).',
        },
        idnumber: {
          type: 'string',
          example: 'Thomas',
          description: 'The Identification No. of the user.',
        },
        idCard: {
          type: 'string',
          example: 's3.amazon.com/sddfredfefer',
          description: 'Amazon s3 expiring Link.',
        },
      },
    },
    description: 'user updated successfully!.',
  })
  @ApiResponse({
    status: 400,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example:
            'First name or Last name should not have special characters or numbers.',
        },
      },
    },
    description:
      'First name or Last name should not have special characters or numbers.',
  })
  @ApiResponse({
    status: 401,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 401,
        },
        message: {
          type: 'string',
          example: 'Temporary jwt token expired! Resend OTP.',
        },
      },
    },
    description: 'Temporary jwt token expired! Resend OTP.',
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('updateuser')
  async updateuser(
    @Req() request,
    @Res() response,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (updateUserDto?.first_name) {
      if (request.body.first_name.length > 50) {
        throw new HttpException(
          'First name cannot be greater than 50 characters',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    if (request.body?.last_name) {
      if (request.body.last_name.length > 50) {
        throw new HttpException(
          'Last name cannot be greater than 50 characters',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // first & last name validate to check for any special character or numbers
    if (request.body?.first_name || request.body?.last_name) {
      // const format = /^[a-zA-Z-,]+(\s{0,1}[a-zA-Z-, ])*$/;
      // to make sure the name doesn't contain /.
      const format = /\//;
      let firstName = request.body ? request.body.first_name : '';
      firstName = format.test(firstName);
      let lastName = request.body ? request.body.last_name : '';
      lastName = format.test(lastName);
      if (firstName || lastName) {
        throw new HttpException(
          'Firstname/Lastname is empty or contains Special characters(/)',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const type = updateUserDto?.idtype.toString().toLowerCase();
    if (type === 'philhealthid') {
      const idNumberCheck = new RegExp('^[0-9A-Za-z-]+$');
      if (updateUserDto?.idnumber.length > 14) {
        throw new HttpException(
          'ID numbers cannot be greater than 14 characters',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!idNumberCheck.test(updateUserDto?.idnumber)) {
        throw new HttpException(
          'Please enter valid ID Number(it should contain only characters, numbers and hypens)',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else if (type === 'passport') {
      if (updateUserDto?.idnumber.length > 20) {
        throw new HttpException(
          'ID number cannot be greater than 20 characters',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else if (type === 'other') {
      if (updateUserDto?.idnumber.length > 30) {
        throw new HttpException(
          'ID number cannot be greater than 30 characters',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!updateUserDto?.idName) {
        throw new HttpException('Please Enter Id Name', HttpStatus.BAD_REQUEST);
      }
      if (updateUserDto?.idName.length > 70) {
        throw new HttpException(
          'ID name cannot be greater than 70 characters',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else if (type) {
      throw new HttpException(
        'Please enter valid ID type.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (type && !updateUserDto.idnumber) {
      throw new HttpException('Please Enter Id Number', HttpStatus.BAD_REQUEST);
    }

    const pattern = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;
    if (request.body?.dob) {
      if (!pattern.test(request.body?.dob)) {
        throw new HttpException(
          'Please enter valid date(yyyy-mm-dd).',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    if (request.body?.gender) {
      const gender = request.body?.gender?.toString().toLowerCase();
      if (gender !== 'male' && gender !== 'female' && gender !== 'nonbinary') {
        throw new HttpException(
          'Please enter gender type.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    await this.usersService.checkOtpVerified(request.body);
    await this.usersService.updateUser(request.body, request.file, response);
  }

  @ApiOperation({
    summary: 'Refresh jwt token.',
    description: 'This Endpoint is used to refresh the expiring jwt token.',
  })
  @ApiTags('API')
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        jwt_Token: {
          type: 'string',
          example: 'eyJz93ak4laUWw.utetwruyteuw.gsdjfjhdgsfjhg',
          description: 'Authentication token returned from the server.',
        },
        refresh_token: {
          type: 'string',
          example: 'eyJz93ak4laUWw.utetwruyteuw.gsdjfjhdgsfjhg',
          description: 'Authentication token returned from the server.',
        },
        token_type: {
          type: 'string',
          example: 'Bearer',
          description: 'Type of the Authentication token.',
        },
        expires_in: {
          type: 'string',
          example: '1610771905',
          description: 'Expiry date in a month of token in Unix Epoc Time.',
        },
      },
    },
    description: 'Token Refresh successful!.',
  })
  @ApiResponse({
    status: 400,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example: 'Invalid Request check parameters.',
        },
      },
    },
    description: 'Invalid Request check parameters.',
  })
  @ApiResponse({
    status: 401,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 401,
        },
        message: {
          type: 'string',
          example: 'Bad RefreshToken.',
        },
      },
    },
    description: 'Bad RefreshToken.',
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('refreshtoken')
  async refreshtoken(@Request() req, @Res() response, @Body() refreshtoken: refreshtoken) {
    let tokenresponse;
    if (req.body['user_type'] || req.body['user_type'] == 1) {
      tokenresponse = await this.InspectorService.refreshtoken(refreshtoken);
    } else {
      tokenresponse = await this.usersService.refreshtoken(refreshtoken);
    }
    return response.send(this.tokenService.getToken(tokenresponse));
  }

  @ApiTags('API')
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        unique_id: {
          type: 'string',
          example: '5fed7c1c3527592ef0cd0dcc',
          description: 'Unique ID of the User in DB.',
        },
        first_name: {
          type: 'string',
          example: 'Thomas',
          description: 'First Name of the user.',
        },
        last_name: {
          type: 'string',
          example: 'Williams',
          description: 'Last Name of the user.',
        },
        email_id: {
          type: 'string',
          example: 'ex@example.com',
          description: 'ex@example.com.',
        },
        mobile: {
          type: 'string',
          example: '7418529635',
          description: 'Mobile Number of the user.',
        },
        dob: {
          type: 'string',
          example: '1990-10-20',
          description: 'DOB of the user (yyyy-mm-dd).',
        },
        idtype: {
          type: 'string',
          example: 'passport',
          description:
            'Type of Identification of the user (Passport/National ID).',
        },
        idnumber: {
          type: 'string',
          example: 'Thomas',
          description: 'The Identification No. of the user.',
        },
        idCard: {
          type: 'string',
          example: 's3.amazon.com/sddfredfefer',
          description: 'Amazon s3 expiring Link.',
        },
      },
    },
    description: 'Retrieval Successful!.',
  })
  @ApiResponse({
    status: 400,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example: 'The User Not found in the system',
        },
      },
    },
    description: 'The User Not found in the system',
  })
  @ApiResponse({
    status: 401,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 401,
        },
        message: {
          type: 'string',
          example: 'Invalid OTP',
        },
      },
    },
    description: 'Invalid OTP',
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Request User Details.',
    description: 'This Endpoint is used to retrieve the user information.',
  })
  @HttpCode(200)
  @Post('requestuser')
  async requestuser(@Res() response, @Body() requestUser: requestuser) {
    await this.usersService.checkOtpVerified(requestUser);
    return this.usersService.requestuser(requestUser, response);
  }

  @ApiTags('API')
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        first_name: {
          type: 'string',
          example: 'Thomas',
          description: 'First Name of the user.',
        },
        last_name: {
          type: 'string',
          example: 'Williams',
          description: 'Last Name of the user.',
        },
        email_id: {
          type: 'string',
          example: 'ex@example.com',
          description: 'ex@example.com.',
        },
        mobile: {
          type: 'string',
          example: '7418529635',
          description: 'Mobile Number of the user.',
        },
        dob: {
          type: 'string',
          example: '1990-10-20',
          description: 'DOB of the user (yyyy-mm-dd).',
        },
        idtype: {
          type: 'string',
          example: 'passport',
          description:
            'Type of Identification of the user (Passport/National ID).',
        },
        idnumber: {
          type: 'string',
          example: 'Thomas',
          description: 'The Identification No. of the user.',
        },
        test: {
          default: [
            {
              testid: 'TRE - ST415',
              testname: 'TRE - COVID',
              testdate: 'Mon Feb 01 2021 15:36:10 GMT+0800',
              resultstatus: '2',
              testtype: 'Antigen Kit',
              creationDate: 'Mon Feb 01 2021 15:36:10 GMT+0800',
              resultdate: 'Mon Feb 01 2021 15:36:10 GMT+0800',
              notes: 'notes',
            },
          ],
        },
      },
    },
    description: 'Retrieval Successful!.',
  })
  @ApiResponse({
    status: 400,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example: 'The User Not found in the system',
        },
      },
    },
    description: 'The User Not found in the system',
  })
  @ApiResponse({
    status: 401,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 401,
        },
        message: {
          type: 'string',
          example: 'jwt token expired!',
        },
      },
    },
    description: 'jwt token expired!',
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Request test Details.',
    description: 'This Endpoint is used to retrieve the test information.',
  })
  @HttpCode(200)
  @Post('requesttest')
  async requesttest(@Request() req, @Body() requesttest: requesttest) {
    if (requesttest.user_type == 0) {
      if (
        requesttest.unique_test_id &&
        (requesttest.idtype || requesttest.idnumber || requesttest.no_of_test)
      ) {
        throw new HttpException(
          'You cant able to query idnumber/idtype/no of test and unique_test at the same time !.',
          HttpStatus.BAD_REQUEST,
        );
      }
      return this.usersService.requestTest(requesttest);
    } else {
      const visitor = await this.usersService.requestVisitor(requesttest);
      console.log(visitor);
      return visitor;
    }
  }

  @ApiTags('API')
  @ApiResponse({
    status: 200,
    description: 'Qr Code Image',
  })
  @ApiResponse({
    status: 400,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example: 'bad request',
        },
      },
    },
    description: 'bad request',
  })
  @ApiResponse({
    status: 401,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 401,
        },
        message: {
          type: 'string',
          example: 'jwt token expired!',
        },
      },
    },
    description: 'jwt token expired!',
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Request QR code file in URL.',
    description:
      'This Endpoint is used to retrieve the QR file which will return the latest test status.',
  })
  @Post('requestqrfile')
  async requestqrfile(@Request() req, @Res() res) {

    const userLoggedIn = await this.usersService.getSpecificUser(
      req.user.username,
    );
    const data = await this.usersService.requestTest(userLoggedIn);
    const tt_type = data.test[0]?.testtype || 'covid';
    const finalvalue = {
      ...userLoggedIn,
      testtype: tt_type,
    };

    const b = await this.usersService.requestqrfile(finalvalue);
    return {
      url: b,
      image: fs.readFile('./qr-code.jpeg', function (err, data) {
        //changed format from jpeg to png for testing
        if (err) throw err; // Fail if the file can't be read.
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(data);
      }),
    };
  }
  //////////////////new api logic//////////////
  //start script/////
  @ApiTags('API')
  @ApiResponse({
    status: 200,
    description: 'Qr Code Image New Logic',
  })
  @ApiResponse({
    status: 400,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example: 'bad request',
        },
      },
    },
    description: 'bad request',
  })
  @ApiResponse({
    status: 401,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 401,
        },
        message: {
          type: 'string',
          example: 'jwt token expired!',
        },
      },
    },
    description: 'jwt token expired!',
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Request QR code file in URL New APi Logic. ',
    description:
      'This Endpoint is used to retrieve the QR file which will return the latest test status.',
  })
  @Post('requesttestqrfile')
  async requesttestqrfile(@Request() req, @Res() res, @Body() requesttestqr: requesttestqr) {

    const userLoggedIn = await this.usersService.getSpecificUser(
      req.user.username,
    );
    const test_id = requesttestqr.testid;

    const data = await this.usersService.requestTest(userLoggedIn);
    const tt_type = data.test[0]?.testtype || 'covid';
    const finalvalue = {
      ...userLoggedIn,
      testtype: tt_type,

    };

    const b = await this.usersService.requesttestqrfile(finalvalue, test_id);
    return {
      url: b,
      image: fs.readFile('./qr-code.jpeg', function (err, data) {
        //changed format from jpeg to png for testing
        if (err) throw err; // Fail if the file can't be read.
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(data);
      }),
    };
  }

  @ApiTags('API')
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        first_name: {
          type: 'number',
          example: 'Abdul Razak Ul Fitr',
          description: 'First name of the user.',
        },
        dob: {
          type: 'string',
          example: '04-03-1991',
          description: 'Date of Birth of the user.',
        },
        idnumber: {
          type: 'strign',
          example: '78954621',
          description: 'Health Visa ID of the user.',
        },
        idtype: {
          type: 'string',
          example: 'passport',
          description:
            'Type of Identification of the user (Passport/National ID).',
        },
      },
    },
    description: 'Decryption successfull.',
  })
  @ApiResponse({
    status: 400,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example: 'Invalid data cannot decrypt.',
        },
      },
    },
    description: 'Invalid data cannot decrypt.',
  })
  @ApiResponse({
    status: 401,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 401,
        },
        message: {
          type: 'string',
          example: 'jwt token expired! Resend OTP.',
        },
      },
    },
    description: 'jwt token expired! Resend OTP.',
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Decrypt URL recieved from the QR scan New APi Logic.',
    description:
      'This endpoint will convert the given encrpted data into decrpted data as a response. The part which needs to be sent is the part just after the end of domain name "https://ph.matrix-ipass.ai/o8OkWDp3" so the part which needs to be sent is "o8OkWDp3" right after "https://ph.matrix-ipass.ai/"',
  })
  @Post('decryptestturl')
  async decryptestturl(@Request() req, @Body() decrypttesturl: decrypttesturl) {
    return this.usersService.decryptTest(decrypttesturl.urldata);
  }

  //end script///


  // this api is being used for the application developed by sohil
  @ApiTags('API')
  @ApiResponse({
    status: 200,
    description: 'Qr Code Image',
  })
  @ApiResponse({
    status: 400,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example: 'bad request',
        },
      },
    },
    description: 'bad request',
  })
  @ApiResponse({
    status: 401,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 401,
        },
        message: {
          type: 'string',
          example: 'jwt token expired!',
        },
      },
    },
    description: 'jwt token expired!',
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Request QR code file in URL.',
    description:
      'This Endpoint is used to retrieve the QR file which will return the latest test status.',
  })
  //@ApiExcludeEndpoint()
  @Get('getqrfile')
  async getqrfile(@Request() req, @Res() res) {
    const userLoggedIn = await this.usersService.getSpecificUser(
      req.user.username,
    );
    const data = await this.usersService.requestTest(userLoggedIn);
    const tt_type = data.test[0]?.testtype || '';
    const finalvalue = {
      ...userLoggedIn,
      testtype: tt_type,
    };

    const b = await this.usersService.requestqrfile(finalvalue);
    return {
      url: b,
      image: fs.readFile('./qr-code.jpeg', function (err, data) {
        //changed format from jpeg to png for testing
        if (err) throw err; // Fail if the file can't be read.
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(data);
      }),
    };
  }
  @ApiHeader({
    name: 'x-client-id',
    description: 'TERRe7845',
  })
  @ApiTags('API')
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        first_name: {
          type: 'number',
          example: 'Abdul Razak Ul Fitr',
          description: 'First name of the user.',
        },
        dob: {
          type: 'string',
          example: '04-03-1991',
          description: 'Date of Birth of the user.',
        },
        idnumber: {
          type: 'strign',
          example: '78954621',
          description: 'Health Visa ID of the user.',
        },
        idtype: {
          type: 'string',
          example: 'passport',
          description:
            'Type of Identification of the user (Passport/National ID).',
        },
      },
    },
    description: 'Decryption successfull.',
  })
  @ApiResponse({
    status: 400,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example: 'Invalid data cannot decrypt.',
        },
      },
    },
    description: 'Invalid data cannot decrypt.',
  })
  @ApiResponse({
    status: 401,
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 401,
        },
        message: {
          type: 'string',
          example: 'jwt token expired! Resend OTP.',
        },
      },
    },
    description: 'jwt token expired! Resend OTP.',
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Decrypt URL recieved from the QR scan.',
    description:
      'This endpoint will convert the given encrpted data into decrpted data as a response. The part which needs to be sent is the part just after the end of domain name "https://ph.matrix-ipass.ai/o8OkWDp3" so the part which needs to be sent is "o8OkWDp3" right after "https://ph.matrix-ipass.ai/"',
  })
  @Post('decrypturl')
  async decrypturl(@Request() req, @Body() decrypturl: decrypturl, @Headers() headers,) {

    if (decrypturl.user_type == 0) {
      // return 'user type 0'
      return this.usersService.decrypt(decrypturl.urldata);
      // let data = await this.usersService.decrypt(decrypturl.urldata);
      // console.log('data',data);
    } else {
      // return 'user type 1'
      //return this.usersService.getTestInfo(requesttest);
      if (decrypturl.inspector_id == '') {
        throw new HttpException(
          'Please send inspector valid id',
          HttpStatus.BAD_REQUEST,
        );
      }

      // As per design, this Will need to be verified later with client_secret
      let company = '';
      if (headers['x-client-id'] !== '') {
        company = headers['x-client-id'];
      } else if (company === '') {
        company = process.env.CLIENT_ID;
      } else {
        company = "5fec82e83700ae08d87692b7";
      }
      console.log('company', company);
      let company_id = company;
      let data = await this.usersService.getTestInfo(decrypturl.urldata, decrypturl.inspector_id, company_id);
      console.log('data', data);


      return data;
    }
    // return this.usersService.decrypt(decrypturl.urldata);
  }

  //   to hide certain api url from swagger
  @ApiExcludeEndpoint()
  @ApiTags('API')
  @HttpCode(200)
  @Redirect('https://docs.nestjs.com', 302)
  @Post('/resetpassword')
  async resetpassword(@Req() req, @Res() response) {
    const user = await this.usersService.updateVerifySpecificUser(
      req.body.email_id,
      req.body.otp,
    );
    response.cookie('forgotPasswordCookie', '');
    const path = process.env.URL_PATH || 'http://localhost:3000';
    const forgotLink = `${path}/passwordreset?email=${req.body.email_id}&otp=${req.body.otp}`;
    if (!user) {
      response.cookie('forgotPasswordCookie', 'Invalid Credentials');
      return { url: forgotLink };
    }
    if (req.body.newPassword === '' && req.body.confirmPassword === '') {
      response.cookie('forgotPasswordCookie', 'Fields cannot be empty');
      return { url: forgotLink };
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
      response.cookie('forgotPasswordCookie', 'Passwords Do not match');
      return { url: forgotLink };
    }
    const result = await this.usersService.updatepassword(user, req.body);
    if (result) {
      response.cookie(
        'forgotPasswordCookie',
        'Password updated successfully!.',
      );
      return { url: forgotLink };
    }
  }

  //   to hide certain api url from swagger
  @ApiTags('API')
  @HttpCode(200)
  @Post('/resendotp')
  async resendotp(@Res() response, @Body() resendotp: resendotp) {
    const resend = await this.usersService.resendotp(resendotp.email_id_mob_no);
    return response.send(resend);
  }

  // Get all Test Types list
  @ApiHeader({
    name: 'x-client-id',
    description: 'TERRe7845',
  })
  @ApiTags('API')
  @ApiOperation({
    summary: 'List of Test Types',
  })
  @Get('gettesttypes')
  async gettesttypes(@Res() res, @Headers() headers) {
    const userLoggedIn = await this.usersService.requesttesttypes(headers);
    return res.send({ success: userLoggedIn });
  }

  // Schedule a new Test
  @Post('scheduletest')
  @ApiTags('API')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Schedule a new Test',
    description:
      'testname and testdate are the required fields to generate record',
  })
  @HttpCode(200)
  async createtest(
    @Res() response,
    @Request() req,
    @Body() scheduleTestDto: ScheduleTestDto,
    @Headers() headers,
  ) {
    // As per design, this Will need to be verified later with client_secret
    let company = '';
    if (headers['x-client-id'] !== '') {
      company = headers['x-client-id'];
    } else if (company === '') {
      company = process.env.CLIENT_ID;
    } else {
      company = "5fec82e83700ae08d87692b7";
    }

    if (!scheduleTestDto.location_id || scheduleTestDto.location_id === '') {
      throw new HttpException(
        'Location Id is requierd',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Code to get customer data //TODO
    const userLoggedIn = await this.usersService.getSpecificUser(
      req.user.username,
    );

    // console.log('user logged in'+userLoggedIn);
    // As per design, this Will need to be verified later with client_secret
    // jwt sample
    // https://wanago.io/2020/09/21/api-nestjs-refresh-tokens-jwt/#:~:text=Once%20the%20API%20states%20that,needs%20to%20perform%20a%20refresh.&text=To%20refresh%20the%20token%2C%20the,separate%20endpoint%2C%20called%20%2Frefresh.&text=If%20it%20is%20valid%20and,the%20username%20and%20password%20again.

    const testValues: SaveScheduleTestDto = {
      ...scheduleTestDto,
      customer: userLoggedIn['_id'],
      customeridentity: userLoggedIn['idnumber'],
      resultstatus: 2,
      company: company,
      first_name: userLoggedIn['first_name'],
      last_name: userLoggedIn['last_name'],
      creationDate: new Date(),
      markstatus: 1,
    };

    // let new00 = String(scheduleTestDto.testdate).split('T');
    // let new02date = new Date().toISOString().split('T');
    // let newDate = new00[0] + "T" + new02date[1];
    // testValues.testdate= new Date(newDate);
    console.log(testValues)
    const result = await this.usersService.submittestrequest(testValues, userLoggedIn);
    const token = await this.tokenService.getToken(result);

    const success_records = {
      "ticketNo": result?.queue
    };

    return response.send({ success: success_records });
  }

  // Get all Scheduled Test
  @ApiTags('API')
  @ApiOperation({
    summary: 'Get all Scheduled Tests',
  })
  @Get('getallscheduledests')
  async getallscheduledtests(@Request() req, @Res() res) {
    const userLoggedIn = await this.usersService.requestscheduledlist();
    return res.send({ success: userLoggedIn });
  }

  // Create a new FeedBack
  @Post('createFeedback')
  @ApiTags('API')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Submit Feedback',
  })
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('feedbackFile', {
      storage: multerS3({
        s3: s3,
        bucket: AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read', //in future remove public read and use this 'authenticated-read',
        serverSideEncryption: 'AES256',
        key: function (request, file, cb) {
          cb(null, `${Date.now().toString()} - ${file.originalname}`);
        },
      }),
    }),
  )
  async createFeedback(
    @Res() res,
    @Body() feedbacksDto: FeedbacksDto,
  ) {
    const feedbackvalues = {
      ...feedbacksDto,
    };
    const result = await this.usersService.submitfeedback(feedbackvalues);
    return res.send({ success: result });
  }

  // Edit a Scheduled Test
  @ApiTags('API')
  @Post('editscheduledtest')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Edit a Scheduled Test',
  })
  @HttpCode(200)
  async edittest(
    @Res() response,
    @Request() req,
    @Body() updateScheduleDto: UpdateScheduleDto
  ) {
    if (!updateScheduleDto?.testdate) {
      throw new HttpException(
        'Test Date is not valid.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const result = await this.usersService.updateScheduledtest(req.body);
    if (result?._id) {
      return response.send({ success: result.testdate });
    } else {
      return {
        error:
          'No test date found',
      };
    }
  }

  //Updtae Profile
  @ApiTags('API')
  @Post('profileUpdate')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Edit/Update Profile',
  })
  @HttpCode(200)
  async profileUpdate(
    @Res() response,
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    if (!updateProfileDto?.idnumber) {
      throw new HttpException(
        'Please provide ID Number.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const patternMob = (/^[0-9+\b]+$/);
    if (!patternMob.test(updateProfileDto?.mobile)) {
      throw new HttpException(
        'Please enter valid Mobile No',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (updateProfileDto?.mobile.length > 15) {
      throw new HttpException(
        'Mobile must be a phone Number',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (updateProfileDto?.first_name) {
      if (updateProfileDto.first_name.length > 50) {
        throw new HttpException(
          'First name cannot be greater than 50 characters',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (updateProfileDto?.last_name) {
      if (updateProfileDto.last_name.length > 50) {
        throw new HttpException(
          'Last name cannot be greater than 50 characters',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (/\//.test(updateProfileDto?.first_name)) {
      throw new HttpException(
        '/ symbol is not allowed.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (/\//.test(updateProfileDto?.last_name)) {
      throw new HttpException(
        '/ symbol is not allowed.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.usersService.updateProfile(req.body);
    if (result?._id) {
      return response.send({ success: true });
    } else {
      return {
        error:
          'No Profile updated',
      };
    }
  }
}
