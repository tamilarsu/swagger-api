import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema()
export class Customer {
  @Prop()
  id?: string;
  @Prop()
  first_name: string;
  @Prop()
  last_name: string;
  @Prop()
  idtype: string;
  @Prop()
  idnumber: string;
  @Prop()
  idCard: string;
  @Prop()
  mobile: string;
  @Prop()
  email_id: string;
  @Prop()
  password: string;
  @Prop()
  JWT_token_temp: string;
  @Prop()
  token_type: string;
  @Prop()
  expires_in: number;
  @Prop()
  device_token: string;
  @Prop()
  dob: string;
  @Prop()
  otp: number;
  @Prop()
  otp_verified: boolean;
  @Prop()
  uidi: string;
  @Prop()
  uidid: string;
  @Prop()
  digital_status: number;
  @Prop()
  company: string;
  @Prop()
  creationDate: Date;
  @Prop()
  gender?: string;
  @Prop()
  idName?: string;
  @Prop()
  idtypeId?: string;
  @Prop()
  deletedAt?: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
