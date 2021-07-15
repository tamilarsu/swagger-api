import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InspectorDocument = Users & Document;

@Schema()
export class Users {
  @Prop()
  id?: string;
  @Prop()
  location: string;
  @Prop()
  email: string;
  @Prop()
  role: string;
  @Prop()
  parent: number;
  @Prop()
  mobile: string;
  @Prop()
  firstname: string;
  @Prop()
  lastname: string;
  @Prop()
  address1: string;
  @Prop()
  address2: string;
  @Prop()
  city: string;
  @Prop()
  province: string;
  @Prop()
  postal_code: string;
  @Prop()
  country: string;
  @Prop()
  rolename: string;
  @Prop()
  locationname: string;
  @Prop()
  suspendstatus: boolean;
  @Prop()
  password: string;
  @Prop()
  _v: number;
  @Prop()
  deletedat: Date;
  @Prop()
  otp: number;
  @Prop()
  otp_verifed: boolean;
  @Prop()
  organization: string;
  @Prop()
  organizationname: string;
}

export const UsersSchema = SchemaFactory.createForClass(Users);
