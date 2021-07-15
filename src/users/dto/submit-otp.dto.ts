import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class submitotp {
  @ApiProperty({
    description: 'example:eee@example.com || example:123456789',
  })
  @IsNotEmpty()
  readonly email_id_mob_no: string;
  @ApiProperty({
    description: 'example:passworrd145',
  })
  @IsNotEmpty()
  readonly password: string;
  @ApiProperty({
    description: 'example:7845',
  })
  @IsNotEmpty()
  readonly otp: number;
  @ApiProperty({
    description: 'example: 78954621, Device Token Generated in the device.',
  })
  @IsNotEmpty()
  readonly device_token: string;
}
