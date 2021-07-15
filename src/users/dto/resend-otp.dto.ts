import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class resendotp {
  @ApiProperty({
    description: 'example:eee@example.com || example:123456789',
  })
  @IsNotEmpty()
  readonly email_id_mob_no: string;
}
