import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type Testtypelist = Testtype & Document;

@Schema()
export class Testtype {
  @Prop()
  id?: string;
  @Prop()
  testname: string;
  @Prop()
  description: string;
  @Prop()
  status: string;
}

export const TesttypeSchema = SchemaFactory.createForClass(Testtype);
