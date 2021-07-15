import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class loginuser {
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
    description: 'example: 78954621, Device Token Generated in the device.',
  })
  @ApiProperty({
    description: 'user type 1 for inspector none for customer ',
    type: () => Number,
  })
  readonly user_type: number;
  @ApiProperty({
    description: 'user_type 1 for inspector none for customer',
  })
  @IsNotEmpty()
  device_token: string;
}
