import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class forgotpassword {
  @ApiProperty({
    description: 'example: eee@example.com',
    type: () => String,
  })
  @IsNotEmpty()
  readonly email_id_mob_no: string;
  @ApiProperty({
    description: 'user type 1 for inspector none for customer ',
    type: () => Number,
  })
  readonly user_type: number = 1;
}
