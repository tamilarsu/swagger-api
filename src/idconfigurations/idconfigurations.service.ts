import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Idconfigurations, IdconfigurationsDocument } from "./schemas/idconfigurations.schema";
import { Model } from 'mongoose';

@Injectable()
export class IdconfigurationsService {

    constructor(
        @InjectModel(Idconfigurations.name)
        private readonly IdconfigurationsModel: Model<IdconfigurationsDocument>,
    ) { }

    async getidTypeList(company): Promise<any> {
        let idTypeList;
        if(company==''){
            idTypeList = await this.IdconfigurationsModel.find({
                status:1,
            });
        }else{
            idTypeList = await this.IdconfigurationsModel.find({
                status:1,
                company:company,
            });
        }
        
        return idTypeList;
    }

    async getIdTypeByID(id): Promise<any>{
        const idTypeList = await this.IdconfigurationsModel.findById(id);
        return idTypeList;
    }
}
