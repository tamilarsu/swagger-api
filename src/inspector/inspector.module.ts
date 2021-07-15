import { Module } from '@nestjs/common';
import { InspectorService } from './inspector.service';
import { InspectorController } from './inspector.controller';
import { Users, UsersSchema} from './schemas/inspector.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailService } from '../email/email.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Users.name, schema: UsersSchema },
  ]),
  ],
  providers: [InspectorService, EmailService],
  controllers: [InspectorController],
  exports: [InspectorService]
})
export class InspectorModule {}
