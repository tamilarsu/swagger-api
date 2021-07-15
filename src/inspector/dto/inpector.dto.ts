import { ApiProperty } from '@nestjs/swagger';

export class inspector {
  @ApiProperty({
    description: 'example: TRsd345YUIPO',
    type: () => String,
  })
  readonly location?: string;
  @ApiProperty({
    description: 'example: YUIPO345',
    type: () => String,
  })

  readonly email?: string;
  @ApiProperty({
    description: 'example: example@email.com',
    type: () => String,
  })

  readonly role?: string;
  @ApiProperty({
    description: 'example: YUIPO345',
    type: () => String,
  })

  readonly parent?: number;
  @ApiProperty({
    description: 'example: YUIPO345',
    type: () => Number,
  })

  readonly mobile?: string;
  @ApiProperty({
    description: 'example: 9876543210',
    type: () => String,
  })

  readonly firstname?: string;
  @ApiProperty({
    description: 'example: Arvind',
    type: () => String,
  })

  readonly lastname?: string;
  @ApiProperty({
    description: 'example: vishvas',
    type: () => String,
  })

  readonly address1?: string;
  @ApiProperty({
    description: 'example: YUIPO345',
    type: () => String,
  })

  readonly address2?: string;
  @ApiProperty({
    description: 'example: YUIPO345',
    type: () => String,
  })

  readonly city?: string;
  @ApiProperty({
    description: 'example: Las Vegas',
    type: () => String,
  })

  readonly province?: string;
  @ApiProperty({
    description: 'example: YUIPO345',
    type: () => String,
  })

  readonly postal_code?: string;
  @ApiProperty({
    description: 'example: 88901',
    type: () => String,
  })

  readonly country?: string;
  @ApiProperty({
    description: 'example: America',
    type: () => String,
  })

  readonly rolename?: string;
  @ApiProperty({
    description: 'example: User',
    type: () => String,
  })

  readonly locationname?: string;
  @ApiProperty({
    description: 'example: Algubeba',
    type: () => String,
  })

  readonly suspendstatus?: boolean;
  @ApiProperty({
    description: 'example: 0',
    type: () => Boolean,
  })

  readonly password?: string;
  @ApiProperty({
    description: 'example: 123456@#12',
    type: () => String,
  })
  deletedat?: Date;
}
