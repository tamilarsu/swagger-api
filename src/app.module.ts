import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { UsersModule } from './users/customers.module';
// for mailing
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EmailService } from './email/email.service';
import * as mongoose from 'mongoose';
import * as fs from 'fs';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TokenserviceService } from './tokenservice/tokenservice.service';
import { IdconfigurationsModule } from './idconfigurations/idconfigurations.module';
import { InspectorModule } from './inspector/inspector.module';
// DB Config. Currently needed before ConfigModule is initialized
const NODE_ENV = process.env.NODE_ENV;
const DB_URL = process.env.DB_URL || 'mongodb://localhost/matrix-ipass-two';
//const DB_URL = process.env.DB_URL || 'mongodb://localhost/identity-management';
const DB_OPTS: MongooseModuleOptions = { useNewUrlParser: true };
 
if (NODE_ENV == 'production' || NODE_ENV == 'staging' || NODE_ENV == 'dev') {
  DB_OPTS.sslValidate = true;
  DB_OPTS.sslCA = [fs.readFileSync('./rds-combined-ca-bundle.pem')];
}

// tells mongoose to use mongoDB's useFindAndModify
mongoose.set('useFindAndModify', false);

@Module({
  imports: [
    MongooseModule.forRoot(DB_URL, DB_OPTS),
    UsersModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '/passwordreset/client'),
      exclude: ['/api*'],
    }),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.MAIL_HOST,
          port: 587,
          secure: false, // upgrade later with STARTTLS
          auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
          },
        },
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
        template: {
          dir: process.cwd() + '/templates/',
          adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
          options: {
            strict: true,
          },
        },
      }),
    }),
    ConfigModule.forRoot(),
    AuthModule,
    IdconfigurationsModule,
    InspectorModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailService, TokenserviceService],
})
export class AppModule {}
