import { Body, Controller, Post } from '@nestjs/common';
import { SedesService } from './sedes.service';
import { SedeDto } from './dto/sede.dto'

@Controller('sedes')
export class SedesController {

    constructor(_sed: SedesService) {}

    @Post('new')
    async CrearSede(@Body() sede: SedeDto) {
        
    }

}
