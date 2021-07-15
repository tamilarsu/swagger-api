import {
    Body,
    Controller,
    Request,
    Post,
    Headers,
    Req,
    Res,
    UseInterceptors,
    UseGuards,
    HttpCode,
    HttpException,
    HttpStatus,
    Redirect,
    Get, } from '@nestjs/common';
import { IdconfigurationsService } from "./idconfigurations.service";
import {
    ApiHideProperty,
    ApiBearerAuth,
    ApiConsumes,
    ApiExcludeEndpoint,
    ApiHeader,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

@Controller()
export class IdconfigurationsController {
    constructor(
        private IdconfigurationsService: IdconfigurationsService,
    ){}
    @ApiHeader({
        name: 'x-client-id',
        description: 'TERRe7845',
      })
    @ApiTags('API')
    @Get('getregisteridtypes')
    async getregisteridtypes(@Request() req, @Res() res, @Headers() headers) {
        let company = '';
    if (headers['x-client-id']!=undefined && headers['x-client-id'] !== '') {
      company = headers['x-client-id'];
    }
        let list = await this.IdconfigurationsService.getidTypeList(company);
        if (list.length ===0) {
            throw new HttpException(
                'ID type not exist.',
                HttpStatus.BAD_REQUEST,
            );
        }
        return res.send({ success: list });
    }
}