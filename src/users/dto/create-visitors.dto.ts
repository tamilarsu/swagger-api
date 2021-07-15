import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class Visitors {
  @ApiProperty({
    description:
      'example: Visitor Name',
    type: () => String,
  })
  @IsNotEmpty()
  readonly visitorname: string;

  @ApiProperty({
    description:
      'example: 2021-107-07T06:45:49.610Z',
    type: () => Date,
  })
  @IsNotEmpty()
  readonly datetime: Date;

  
  @ApiProperty({
    description:
      'example: 9876655432',
    type: () => String,
  })
  @IsNotEmpty()
  readonly contactnumber:  string;

  
  @ApiProperty({
    description:
      'example: Inspector A',
    type: () => String,
  })
  @IsNotEmpty()
  readonly inspectorname: string;

  
  @ApiProperty({
    description:
      'example: Negative',
    type: () => String,
  })
  @IsNotEmpty()
  readonly scanresult: string;

  @ApiProperty({
    description:
      'example: SARS COV 2',
    type: () => String,
  })
  @IsNotEmpty()
  readonly disease: string;

  @ApiProperty({
    description:
      'example: Yes/No',
    type: () => String,
  })
  @IsNotEmpty()
  readonly entrygiven: string;

  @ApiProperty({
    description:
      'example: ',
    type: () => String,
  })
 inspector: string;

 @ApiProperty({
    description:
      'example: ',
    type: () => String,
  })
  organization: string;

  @ApiProperty({
    description:
      'example: ',
    type: () => Date,
  })
  creationDate: Date;

  @ApiProperty({
    description:
      'example: ',
    type: () => String,
  })
  deletedAt: string;

  @ApiProperty({
    description:
      'example: ',
    type: () => Number,
  })
  status: 1;

}