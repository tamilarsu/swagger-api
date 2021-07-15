import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class refreshtoken {
  @ApiProperty({
    description: 'example:eee@example.com',
  })
  @IsNotEmpty()
  readonly email_id_mob_no: string;
  @ApiProperty({
    description: 'example:passworrd145',
  })
  @IsNotEmpty()
  readonly password: string;
  @ApiProperty({
    description: 'user type 1 for inspector none for customer',
  })
  readonly user_type: number;
  @ApiProperty({
    description: 'example: 78954621, Device Token Generated in the device.',
  })
  device_token: string;
}
