import { Injectable, NotFoundException, Unlock } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SedeDto } from './dto/sede.dto';
import { Prisma } from '../../generated/prisma/client';
import { NotFoundError } from 'rxjs';
import { randomUUID } from 'crypto';

@Injectable()
export class SedesService {

    constructor(private readonly _ctx: PrismaService) {}

    async createOrUpdate(sede: SedeDto) {
        const result = await this._ctx.$transaction(async (_t) => {

            const telefonosExistentes = !!sede.id ? await _t.telefonos.findMany({
                where: { id_sede: sede.id }
            }) : []

            if (!!sede.id) {
                const telefonosNuevos: Prisma.telefonosUncheckedCreateInput[] = sede.telefonos.map(e => ({
                    id_sede: sede.id,
                    telefono: e
                }))
            }

            const dataSede: Prisma.sedesUncheckedCreateInput = {
                id: sede.id,
                codigo: sede.codigo,
                nombre: sede.nombre,
                direccion: sede.direccion,
                x: sede.x,
                y: sede.y
                
            }
            
            const include: Prisma.sedesInclude = {
                telefonos: true
            }

            let s

            if (sede.id != null) {
                s = _t.sedes.create({
                    data: dataSede,
                    include: include
                })
            }
            else {
                s = _t.sedes.update({
                    where: { id: sede.id },
                    data: dataSede,
                    include: include
                })
            }

        })
    } 

}
