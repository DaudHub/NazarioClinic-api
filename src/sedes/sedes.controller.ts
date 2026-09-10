import { Body, Controller, Delete, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { SedesService } from './sedes.service';
import { SedeDto } from './dto/sede.dto'

@Controller('sedes')
export class SedesController {

    constructor(private readonly _sed: SedesService) {}

    @Post()
    async createOrUpdate(@Body() sede: SedeDto) {
        return this._sed.createOrUpdate(sede)
    }

    @Delete(':id')
    async delete(@Param('id', ParseUUIDPipe) id: string) {
        return this._sed.delete(id)
    }

}
