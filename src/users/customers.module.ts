import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './customers.controller';
import { UsersService } from './customers.service';
import { Customer, CustomerSchema } from './schemas/user.schema';
import { AuthService } from '../auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from 'src/auth/constants';
import { JwtStrategy } from '../auth/jwt.strategy';
import { EmailService } from '../email/email.service';
import { TokenserviceService } from '../tokenservice/tokenservice.service';
import { IdconfigurationsModule } from "../idconfigurations/idconfigurations.module";
import { InspectorModule } from '../inspector/inspector.module'
import {
  Testschedules,
  TestschedulesSchema,
} from '../testsschedules/schemas/testschedules.schema';
import { TesttypeSchema, Testtype } from './schemas/testtypes.schema';
import { locationsSchema, locations } from './schemas/locations.schema';
import { vaccinationSchema, vaccination } from "./schemas/vaccination.schema";
import { visitorsSchema, visitors } from './schemas/visitors.schema';
import {
  feedbacks,
  feedbacksSchema,
} from './schemas/feedbacks.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: Testschedules.name, schema: TestschedulesSchema },
      { name: Testtype.name, schema: TesttypeSchema },
      { name: locations.name, schema: locationsSchema },
      { name: feedbacks.name, schema: feedbacksSchema },
      { name: vaccination.name, schema: vaccinationSchema },
      { name: visitors.name, schema: visitorsSchema},
    ]),
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    IdconfigurationsModule,
     InspectorModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    JwtStrategy,
    EmailService,
    TokenserviceService,
  ],
  exports: [UsersService, TokenserviceService],
})
export class UsersModule { }
