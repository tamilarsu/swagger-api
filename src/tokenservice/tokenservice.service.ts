import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenserviceService {
  constructor(private jwtService: JwtService) { }
  getToken(user: any) {
    const expirydate = new Date();
    expirydate.setDate(expirydate.getDate() + 59);
    const payload = {
      username: user?.email_id || 'example.com',
      sub: user?.password || 'IPASS-NEW-USER',
    };
    const refreshPayload = { username: user?.email_id || 'example.com' };
    return {
      jwt_Token: this.jwtService.sign(payload, {
        expiresIn: '60d',
      }),
      refresh_token: this.jwtService.sign(refreshPayload, {
        expiresIn: '60d',
      }),
      token_type: 'Bearer',
      expiresIn: expirydate.getTime(),
    };
  }
}
