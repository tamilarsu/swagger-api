import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IdconfigurationsService } from './idconfigurations.service';
import { Idconfigurations , IdconfigurationsSchema } from "./schemas/idconfigurations.schema";
import { IdconfigurationsController } from './idconfigurations.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Idconfigurations.name, schema: IdconfigurationsSchema },
    ]),
    ],
  controllers: [ IdconfigurationsController],
  providers: [IdconfigurationsService],
  exports: [IdconfigurationsService],
})
export class IdconfigurationsModule {}
