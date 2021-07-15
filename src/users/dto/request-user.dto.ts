import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class requestuser {
  @ApiProperty({
    description: 'example:TRsd345YUIPO',
  })
  @IsNotEmpty()
  readonly ID_PP_ID: string;
  @ApiProperty({
    description: 'example:Passport',
  })
  @IsNotEmpty()
  readonly ID_TYPE: string;
}
