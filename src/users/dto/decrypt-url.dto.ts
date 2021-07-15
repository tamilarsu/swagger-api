import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class decrypturl {
  @ApiProperty({
    description:
      'example: U2FsdGVkX1+9YnOJYezU5ocjvZNRw5Jhp0cWVZJMx9hT4K8X8Wnq58Uouhk4Ja0HaGFcAYh5UBwsGvfoG2FeZA==',
    type: () => String,
  })
  @IsNotEmpty()
  readonly urldata: string;

  @ApiProperty({
    description:
      'example: 123',
    type: () => Number,
  })
  @IsNotEmpty()
  readonly user_type: Number;

  
  @ApiProperty({
    description:
      'example: 12323123',
    type: () => String,
  })
  inspector_id: String;
}
