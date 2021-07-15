import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, MinLength } from 'class-validator';
import { IsEmail, IsMobilePhone, IsNotEmpty } from 'class-validator';

export class CreateTestDto {
  // Uploaded as a file and upload location will be saved as a string for DB
  // https://stackoverflow.com/a/65082785
  @ApiProperty()
  testid: string;
  @ApiProperty()
  testname: string;
  @ApiProperty()
  testdate?: Date;
  @ApiProperty()
  resultstatus: number;
  @ApiProperty()
  testtype: string;
  @ApiProperty()
  testtypename: string;
  @ApiProperty()
  first_name: string;
  @ApiProperty()
  last_name: string;
  @ApiProperty()
  readonly company: string;
  @ApiProperty()
  customer: string;
  @ApiProperty()
  notes: string;
  @ApiProperty()
  customername: string;
  @ApiProperty()
  customeridentity: string;
  @ApiProperty()
  queue: string;
  @ApiProperty()
  location_id: string;
  @ApiProperty()
  markstatus: string;
  @ApiProperty({ default: Date.now() })
  creationDate: Date;
}

export class ScheduleTestDto {
  @ApiProperty()
  testname: string;
  @ApiProperty()
  testdate?: Date;
  @ApiProperty()
  testtype: string;
  @ApiProperty()
  location_id: string;
  @ApiProperty()
  markstatus: number;
  @ApiProperty()
  notes: string;
}

export class SaveScheduleTestDto extends ScheduleTestDto {
  customer: string;
  //customername: string;
  customeridentity: string;
  resultstatus: number;
  readonly company: string;
  creationDate: Date;
  markstatus: number;
  first_name: string;
  last_name: string;
  
}