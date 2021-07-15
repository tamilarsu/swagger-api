import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty } from 'class-validator';
import { IsEmail } from 'class-validator';

export class UpdateScheduleDto {
  // Uploaded as a file and upload location will be saved as a string for DB
  // https://stackoverflow.com/a/65082785
  @ApiProperty({})
  _id?: string;
  @ApiProperty({})
  testdate?: string;
  @ApiProperty({})
  location_id?: string;
}
