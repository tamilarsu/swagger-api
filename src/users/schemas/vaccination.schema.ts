import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type vaccinationsDocument = vaccination & Document;

@Schema()
export class vaccination {
    @Prop()
    id?: string;
    @Prop()
    vaccinationName: string;
    @Prop()
    vaccinationNameId: string;
    @Prop()
    disease: string;
    @Prop()
    diseaseId: string;
    @Prop()
    payment: string;
    @Prop()
    scheduledDate: Date;
    @Prop()
    vaccinationID: string;
    @Prop()
    vaccinationType: string;
    @Prop()
    customer: string;
    @Prop()
    firstname: string;
    @Prop()
    lastname: string;
    @Prop()
    customerID: string;
    @Prop()
    queueNo: string;
    @Prop()
    notes: string;
    @Prop()
    company: string;
    @Prop()
    markstatus: number;
    @Prop()
    creationDate: Date;
    @Prop()
    __v: number;
    @Prop()
    vaccinationDate: Date;

}

export const vaccinationSchema = SchemaFactory.createForClass(vaccination);
