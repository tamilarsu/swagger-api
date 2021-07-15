import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type visitorsDocument = visitors & Document;

@Schema()
export class visitors {
    @Prop()
    id?: string;
    @Prop()
    company?: string;
    @Prop()
    visitorId: string;
    @Prop()
    visitorname: string;

    @Prop()
    datetime: Date

    
    @Prop()
    contactnumber: string

    
    @Prop()
    inspectorname: string

    
    @Prop()
    scanresult: string

    
    @Prop()
    disease: string

    
    @Prop()
    entrygiven: string

    
    @Prop()
    inspector?: string
    
    
    @Prop()
    organization?: string
    
    
    @Prop()
    creationDate?: Date
    
    @Prop()
    deletedAt?: string;

    @Prop()
    status: number;

    @Prop()
    testid?: string;
    
}

export const visitorsSchema = SchemaFactory.createForClass(visitors);
