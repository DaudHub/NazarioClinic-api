import { IsOptional, IsEmail, IsString, MinLength, isString, IsNumber, IsPhoneNumber } from 'class-validator';

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
    @IsPhoneNumber(undefined, { each: true })
    telefonos!: string[];
}