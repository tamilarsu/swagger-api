import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type feedbackslist = feedbacks & Document;

@Schema()
export class feedbacks {
  @Prop()
  firstname: string;
  @Prop()
  lastname: string;
  @Prop()
  email: string;
  @Prop()
  message: string;
  @Prop()
  feedbackFile: string
}

export const feedbacksSchema = SchemaFactory.createForClass(feedbacks);
