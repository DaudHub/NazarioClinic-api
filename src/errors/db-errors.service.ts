import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

export interface DbErrorContext {
    /** Nombre de la entidad involucrada, para armar los mensajes. Ej: 'sede'. */
    entidad?: string;
    /** Identificador del registro involucrado, si se conoce. */
    id?: string;
}

@Injectable()
export class DbErrorsService {

    /**
     * Convierte un error de prisma en la excepcion http correspondiente.
     * Los errores que no son de prisma se devuelven tal cual para que los maneje quien corresponda.
     */
    translate(e: unknown, ctx: DbErrorContext = {}): unknown {
        if (!(e instanceof Prisma.PrismaClientKnownRequestError))
            return e

        const entidad = ctx.entidad ?? 'registro'
        const referencia = ctx.id ? `${entidad} ${ctx.id}` : `el ${entidad}`

        switch (e.code) {
            case 'P2025':
                return new NotFoundException(`No existe ${referencia} o alguna de sus dependencias`)
            case 'P2002':
                return new ConflictException(`Ya existe un ${entidad} con ${this.describirCampos(e, 'ese valor unico')}`)
            case 'P2003':
                return new ConflictException(`${this.capitalizar(referencia)} tiene registros asociados que impiden la operacion`)
            case 'P2014':
                return new ConflictException(`La operacion romperia una relacion requerida de ${referencia}`)
            case 'P2000':
                return new BadRequestException(`Un valor excede el largo permitido para ${referencia}`)
            case 'P2011':
                return new BadRequestException(`Falta un valor obligatorio de ${referencia}`)
            case 'P2012':
                return new BadRequestException(`Falta un valor obligatorio de ${referencia}`)
            default:
                return e
        }
    }

    /** Los campos involucrados vienen en `meta`, con forma distinta segun el codigo de error. */
    private describirCampos(e: Prisma.PrismaClientKnownRequestError, porDefecto: string) {
        const meta = e.meta as { target?: string[] | string; field_name?: string } | undefined
        const campos = meta?.target ?? meta?.field_name

        if (!campos)
            return porDefecto
        return `ese valor de ${Array.isArray(campos) ? campos.join(', ') : campos}`
    }

    private capitalizar(texto: string) {
        return texto.charAt(0).toUpperCase() + texto.slice(1)
    }

}
