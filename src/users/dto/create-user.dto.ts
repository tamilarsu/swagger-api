import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, MinLength } from 'class-validator';
import { IsEmail, IsMobilePhone, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  // Uploaded as a file and upload location will be saved as a string for DB
  // https://stackoverflow.com/a/65082785
  @ApiProperty({
    type: 'file',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  })
  readonly idCard: string;
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'First name cannot be greater than 50 characters and it should not contain (/)',
  })
  readonly first_name: string;
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Last name cannot be greater than 50 characters and it should not contain (/)',
  })
  readonly last_name: string;
  @IsNotEmpty()
  @ApiProperty()
  readonly idtype: string;
  idName?: string;
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Id number should not conitain any special character other then (-) and max lenghth should be 14 characters',
    type: () => String,
  })
  readonly idnumber: string;
  readonly mobile: string;
  @IsEmail()
  readonly email_id: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @ApiProperty({
    description: 'Password should be greater than 5 characrers',
  })
  readonly password: string;
  @ApiHideProperty()
  device_token: string;
  @ApiProperty({
    description: 'Date of Birth format should be yyyy-mm-dd',
  })
  dob: string;
  @ApiHideProperty()
  otp: number;
  @ApiHideProperty()
  otp_verified: boolean;
  @ApiHideProperty()
  uidi: string;
  @ApiHideProperty()
  uidid: string;
  @ApiHideProperty()
  digital_status: number;
  @ApiHideProperty()
  company: string;
  @ApiHideProperty()
  creationDate: Date;
  @ApiProperty({ enum: ['Male', 'Female', 'NonBinary'] })
  @ApiProperty({
    description: 'can be either Male or Female or NonBinary',
  })
  gender?: string;
  @ApiProperty()
  idtypeId: string;
}
