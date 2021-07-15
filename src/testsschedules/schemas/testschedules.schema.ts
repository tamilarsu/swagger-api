import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TestschedulesDocument = Testschedules & Document;

@Schema()
export class Testschedules {
  @Prop()
  readonly id?: string;
  @Prop()
  readonly testid: string;
  @Prop()
  readonly company: string;
  @Prop()
  readonly testname: string;
  @Prop()
  testdate: Date;
  @Prop({ nullable: true })
  resultdate: Date;
  @Prop()
  readonly resultstatus: number;
  @Prop()
  readonly testtype: string;
  @Prop()
  testtypename: string;
  @Prop()
  readonly first_name: string;
  @Prop()
  readonly last_name: string;
  @Prop()
  readonly customer: string;
  @Prop({ defaultValue: Date.now() })
  creationDate: Date;
  @Prop({ nullable: true })
  deletedAt?: string;
  @Prop({ nullable: true })
  notes?: string;
  @Prop({ nullable: true })
  customername?: string;
  @Prop({ nullable: true })
  customeridentity?: string;
  @Prop()
  queue: string;
  @Prop()
  brand_kit: string;
  @Prop()
  markstatus?: number;
  @Prop()
  location_id: string;
  @Prop()
  resultstatusName: string;
}

export const TestschedulesSchema = SchemaFactory.createForClass(Testschedules);
