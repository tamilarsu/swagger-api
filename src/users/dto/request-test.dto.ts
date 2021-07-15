import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class requesttest {
  @ApiProperty({
    description: 'example: TRsd345YUIPO',
    type: () => String,
  })
  readonly idtype?: string;
  @ApiProperty({
    description: 'example: YUIPO345',
    type: () => String,
  })
  readonly idnumber?: string;
  @ApiProperty({
    description: 'example: TRsd345YUIPO',
    type: () => String,
  })
  unique_test_id?: number;
  @ApiProperty({
    description:
      'example: 3, Number of tests to be retrieved. If not Supplied will fetch all results and if supplied with a specific number will supply the the specific number of list. (Possible Values " ", "2"(any number.)). Only user with inspector access can make the request to this API can can get the full response. And in case the user making this request doe not have inspector role then only (- test_name - result_date, - result_status and test_status will be displayed). The jwt token will be comapred to the uniqueID of the user and checked whether he/she is an inspector then it will be responded',
    type: () => Number,
  })
  no_of_test?: number;
  @ApiProperty()
  resultstatusName: string;

 
@ApiProperty({
  description: 'user type 1 for inspector none for customer ',
  type: () => Number,
})
  @IsNotEmpty()
  readonly user_type: number;

  
  @ApiProperty({
    description:
      'example: 12323123',
    type: () => String,
  })
  inspector_id?: String;
}

