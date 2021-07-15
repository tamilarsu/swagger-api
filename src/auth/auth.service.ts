import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/customers.service';
import { TokenserviceService } from '../tokenservice/tokenservice.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private tokenService: TokenserviceService,
  ) {}

  async validateUser(username: any, password: string): Promise<any> {
    console.log(username);
    console.log(password);
    // const user = await this.usersService.findOne(username, password);
    // if (user.length === 0) {
    //   return null;
    // }
    // if (user && user[0].password === password) {
    //   const { ...result } = user;
    //   return result;
    // }
    return null;
  }

  async login(userData: any) {
    const user = await this.usersService.login(
      userData.email_id_mob_no,
      userData.password,
      userData.device_token,
    );
    const token = await this.tokenService.getToken(user);

    const {
      first_name,
      last_name,
      mobile,
      idtype,
      idnumber,
      idCard,
      gender,
    } = user;
    const unique_id = user.id;
    return {
      unique_id,
      first_name,
      last_name,
      mobile,
      idtype,
      gender,
      idnumber,
      idCard,
      user_type: 'normal', // in future the user_type should be coming from the db
      access_token: token.jwt_Token,
      refresh_token: token.refresh_token,
      token_type: 'Bearer',
      expiresIn: token.expiresIn,
    };
  }
}
