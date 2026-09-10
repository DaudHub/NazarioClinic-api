import { Body, Controller, Post } from '@nestjs/common';
import { SedesService } from './sedes.service';
import { SedeDto } from './dto/sede.dto'

@Controller('sedes')
export class SedesController {



    constructor(private readonly _sed: SedesService) {}

    @Post()
    async crear(@Body() sede: SedeDto) {
        return this._sed.createOrUpdate(sede)
    }

}
