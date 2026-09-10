import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsPhoneNumber, IsArray, IsBoolean, IsUUID, IsInt, Min, Max, Matches, ValidateNested, IsEmail } from 'class-validator';

const HORA = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export class HorarioSedeDto {
    @IsInt()
    @Min(0)
    @Max(6)
    dia!: number;
    @Matches(HORA, { message: 'apertura debe tener formato HH:mm o HH:mm:ss' })
    apertura!: string;
    @Matches(HORA, { message: 'cierre debe tener formato HH:mm o HH:mm:ss' })
    cierre!: string;
}

export class SalaSedeDto {
    @IsUUID()
    @IsOptional()
    id?: string;
    @IsString()
    nombre!: string;
    @IsInt()
    @Min(1)
    capacidad!: number;
    @IsBoolean()
    activa!: boolean;
}

export class EquipoSedeDto {
    @IsUUID()
    @IsOptional()
    id?: string;
    @IsString()
    nombre!: string;
    @IsString()
    modelo!: string;
    @IsString()
    nro_serie!: string;
    @IsBoolean()
    activo!: boolean;
}

export class SedeDto {
    @IsUUID()
    @IsOptional()
    id?: string;
    @IsString()
    codigo!: string;
    @IsString()
    nombre!: string;
    @IsString()
    direccion!: string;
    @IsNumber()
    x!: number;
    @IsNumber()
    y!: number;
    @IsBoolean()
    habilitada!: boolean;
    @IsArray()
    @IsPhoneNumber(undefined, { each: true })
    telefonos!: string[];
    @IsArray()
    @IsEmail({}, { each: true })
    mails!: string[];
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HorarioSedeDto)
    horarios!: HorarioSedeDto[];
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SalaSedeDto)
    salas!: SalaSedeDto[];
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EquipoSedeDto)
    equipos!: EquipoSedeDto[];
}
