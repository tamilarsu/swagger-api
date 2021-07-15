import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class decrypttesturl {
  @ApiProperty({
    description:
      'example: U2FsdGVkX1+9YnOJYezU5ocjvZNRw5Jhp0cWVZJMx9hT4K8X8Wnq58Uouhk4Ja0HaGFcAYh5UBwsGvfoG2FeZA==',
    type: () => String,
  })
  @IsNotEmpty()
  readonly urldata: string;
}
