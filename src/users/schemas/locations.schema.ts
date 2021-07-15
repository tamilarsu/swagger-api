import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type locationslist = locations & Document;

@Schema()
export class locations {
  @Prop()
  id?: string;
  @Prop()
  location_name: string;
  @Prop()
  address1: string;
  @Prop()
  address2: string;
  @Prop()
  city: string;
  @Prop()
  province: string;
  @Prop()
  country: string;
  @Prop()
  postal_code: string;
  @Prop()
  company: string;
  @Prop()
  user: string;
  @Prop()
  creationDate: Date;
  @Prop()
  __v: number;
}

export const locationsSchema = SchemaFactory.createForClass(locations);
