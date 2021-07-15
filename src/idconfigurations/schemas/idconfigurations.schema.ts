import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IdconfigurationsDocument = Idconfigurations & Document;

@Schema()
export class Idconfigurations {
    @Prop()
    id: string;
    @Prop()
    name: string;
    @Prop()
    size: number;
    @Prop()
    type: number;
    @Prop()
    status: number;
    @Prop()
    creationDate: Date;
    @Prop()
    company: string;
    @Prop()
    __v: number;
}
export const IdconfigurationsSchema = SchemaFactory.createForClass(Idconfigurations);