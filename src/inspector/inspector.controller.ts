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
    Get,
} from '@nestjs/common';
import { inspector } from "./dto/inpector.dto";
import { InspectorService } from "./inspector.service";

@Controller('inspector')
export class InspectorController {
    constructor(
        private readonly InspectorService: InspectorService,
    ){}


}

