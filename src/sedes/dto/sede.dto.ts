import { IsOptional, IsEmail, IsString, MinLength, isString, IsNumber, IsPhoneNumber, IsArray, IsBoolean } from 'class-validator';

export class SedeDto {
    @IsString()
    @IsOptional()
    id!: string;
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
    @IsArray()
    @IsPhoneNumber(undefined, { each: true })
    telefonos!: string[];
    @IsBoolean()
    habilitada!: boolean;
}