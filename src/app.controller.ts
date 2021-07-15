import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  //   @Get()
  //   getHello(): string {
  //     return this.appService.getHello();
  //   }

  /** basic health check for load balancer */
  //   to hide certain api url from swagger
  @ApiExcludeEndpoint()
  @Get('/health')
  getHealth(): string {
    return 'Healthy';
  }
}
