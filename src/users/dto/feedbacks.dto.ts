import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, MinLength } from 'class-validator';
import { IsEmail, IsMobilePhone, IsNotEmpty } from 'class-validator';

export class FeedbacksDto {
  // Uploaded as a file and upload location will be saved as a string for DB
  // https://stackoverflow.com/a/65082785
  @ApiProperty()
  firstname: string;
  @ApiProperty()
  lastname: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  message: string;
  @ApiProperty({
    type: 'file',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  })
  readonly feedbackFile?: string;
}
