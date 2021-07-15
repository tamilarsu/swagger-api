import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class requesttestqr {
  @ApiProperty({
    description: '123456',
  })
  @IsNotEmpty()
  readonly testid: string;
 
}
