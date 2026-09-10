import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DbErrorsService } from '../errors/db-errors.service';
import { EquipoSedeDto, HorarioSedeDto, SalaSedeDto, SedeDto } from './dto/sede.dto';
import { Prisma } from '../../generated/prisma/client';

const INCLUDE_SEDE = {
    telefonos: true,
    mails: true,
    horariosxsede: true,
    salas: true,
    equipos: true
} satisfies Prisma.sedesInclude;

@Injectable()
export class SedesService {

    constructor(private readonly _ctx: PrismaService, private readonly _err: DbErrorsService) {}

    async createOrUpdate(sede: SedeDto) {
        try {
            return await this._ctx.$transaction(async (_t) => {

                const data = {
                    codigo: sede.codigo,
                    nombre: sede.nombre,
                    direccion: sede.direccion,
                    x: sede.x,
                    y: sede.y,
                    habilitada: sede.habilitada
                }

                const id = sede.id
                    ? (await _t.sedes.update({ where: { id: sede.id }, data })).id
                    : (await _t.sedes.create({ data })).id

                await this.sincronizarTelefonos(_t, id, sede.telefonos)
                await this.sincronizarMails(_t, id, sede.mails)
                await this.sincronizarHorarios(_t, id, sede.horarios)
                await this.sincronizarSalas(_t, id, sede.salas)
                await this.sincronizarEquipos(_t, id, sede.equipos)

                return _t.sedes.findUniqueOrThrow({
                    where: { id },
                    include: INCLUDE_SEDE
                })
            })
        }
        catch (e) {
            throw this._err.translate(e, { entidad: 'sede', id: sede.id })
        }
    }

    async delete(id: string) {
        try {
            return await this._ctx.sedes.delete({ where: { id } })
        }
        catch (e) {
            throw this._err.translate(e, { entidad: 'sede', id })
        }
    }

    private async sincronizarTelefonos(_t: Prisma.TransactionClient, id_sede: string, telefonos: string[]) {
        const deseados = [...new Set(telefonos)]
        const actuales = (await _t.telefonos.findMany({
            where: { id_sede },
            select: { telefono: true }
        })).map(e => e.telefono)

        const aBorrar = actuales.filter(e => !deseados.includes(e))
        const aCrear = deseados.filter(e => !actuales.includes(e))

        if (aBorrar.length)
            await _t.telefonos.deleteMany({ where: { id_sede, telefono: { in: aBorrar } } })
        if (aCrear.length)
            await _t.telefonos.createMany({ data: aCrear.map(telefono => ({ id_sede, telefono })) })
    }

    private async sincronizarMails(_t: Prisma.TransactionClient, id_sede: string, mails: string[]) {
        const deseados = [...new Set(mails)]
        const actuales = (await _t.mails.findMany({
            where: { id_sede },
            select: { mail: true }
        })).map(e => e.mail)

        const aBorrar = actuales.filter(e => !deseados.includes(e))
        const aCrear = deseados.filter(e => !actuales.includes(e))

        if (aBorrar.length)
            await _t.mails.deleteMany({ where: { id_sede, mail: { in: aBorrar } } })
        if (aCrear.length)
            await _t.mails.createMany({ data: aCrear.map(mail => ({ id_sede, mail })) })
    }

    private async sincronizarHorarios(_t: Prisma.TransactionClient, id_sede: string, horarios: HorarioSedeDto[]) {
        const dias = horarios.map(e => e.dia)

        await _t.horariosxsede.deleteMany({
            where: { id_sede, ...(dias.length ? { dia: { notIn: dias } } : {}) }
        })

        for (const horario of horarios) {
            const apertura = this.aHora(horario.apertura)
            const cierre = this.aHora(horario.cierre)

            await _t.horariosxsede.upsert({
                where: { id_sede_dia: { id_sede, dia: horario.dia } },
                create: { id_sede, dia: horario.dia, apertura, cierre },
                update: { apertura, cierre }
            })
        }
    }

    private async sincronizarSalas(_t: Prisma.TransactionClient, id_sede: string, salas: SalaSedeDto[]) {
        const conservadas = salas.filter(e => !!e.id).map(e => e.id)
        const actuales = (await _t.salas.findMany({
            where: { id_sede },
            select: { id: true }
        })).map(e => e.id)

        const aBorrar = actuales.filter(e => !conservadas.includes(e))

        if (aBorrar.length)
            await _t.salas.deleteMany({ where: { id_sede, id: { in: aBorrar } } })

        for (const sala of salas) {
            const data = {
                nombre: sala.nombre,
                capacidad: sala.capacidad,
                activa: sala.activa
            }

            if (sala.id)
                await _t.salas.update({ where: { id_sede_id: { id_sede, id: sala.id } }, data })
            else
                await _t.salas.create({ data: { id_sede, ...data } })
        }
    }

    private async sincronizarEquipos(_t: Prisma.TransactionClient, id_sede: string, equipos: EquipoSedeDto[]) {
        const conservados = equipos.filter(e => !!e.id).map(e => e.id)
        const actuales = (await _t.equipos.findMany({
            where: { id_sede },
            select: { id: true }
        })).map(e => e.id)

        const aBorrar = actuales.filter(e => !conservados.includes(e))

        if (aBorrar.length)
            await _t.equipos.deleteMany({ where: { id_sede, id: { in: aBorrar } } })

        for (const equipo of equipos) {
            const data = {
                nombre: equipo.nombre,
                modelo: equipo.modelo,
                nro_serie: equipo.nro_serie,
                activo: equipo.activo
            }

            if (equipo.id)
                await _t.equipos.update({ where: { id_sede_id: { id_sede, id: equipo.id } }, data })
            else
                await _t.equipos.create({ data: { id_sede, ...data } })
        }
    }

    /** Las columnas `time` de postgres se mapean a Date, asi que la hora se ancla al epoch. */
    private aHora(hora: string) {
        return new Date(`1970-01-01T${hora.length === 5 ? `${hora}:00` : hora}.000Z`)
    }

}
