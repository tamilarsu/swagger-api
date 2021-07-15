import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty } from 'class-validator';
import { IsEmail } from 'class-validator';

export class UpdateUserDto {
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
  readonly idCard?: string;
  @IsDefined()
  @ApiProperty({
    description:
      'First name cannot be greater than 50 characters and it should not contain (/)',
  })
  readonly first_name?: string;
  @ApiProperty({
    description:
      'Last name cannot be greater than 50 characters and it should not contain (/)',
  })
  readonly last_name?: string;
  @ApiProperty({ enum: ['Passport', 'PhilhealthId', 'Other'] })
  @ApiProperty({
    description: 'can be either Passport or Philhealthid',
    type: () => String,
  })
  readonly idtype?: string;
  @ApiProperty({
    description:
      'Id number should not conitain any special character other then (-) and max lenghth should be 14 characters',
    type: () => String,
  })
  readonly idnumber?: string;
  readonly mobile?: string;
  @IsNotEmpty()
  @IsEmail()
  readonly email_id?: string;
  @ApiProperty({
    description: 'Date of Birth format should be yyyy-mm-dd',
  })
  dob?: string;
  @ApiProperty({ enum: ['Male', 'Female', 'NonBinary'] })
  @ApiProperty({
    description: 'can be either Male or Female or NonBinary',
    type: () => String,
  })
  gender?: string;
  idName?: string;
}


export class UpdateProfileDto {
  @ApiProperty({})
  readonly idnumber?: string;
  @ApiProperty({})
  readonly first_name?: string;
  @ApiProperty({})
  readonly last_name?: string;
  @ApiProperty({})
  readonly mobile?: string;
}