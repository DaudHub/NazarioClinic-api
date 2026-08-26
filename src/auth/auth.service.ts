import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt'
import { RefreshTokenService } from './refresh.service';

@Injectable()
export class AuthService {

    constructor(private readonly _jwt: JwtService, private readonly _ctx: PrismaService, private readonly _rfs: RefreshTokenService) { }

    async login(login: LoginDto) {
        const usuario = await this._ctx.usuarios.findFirst({ 
            where: {
                OR: [
                    { usuario: login.user },
                    { mail: login.user }
                ]
            }
        });

        if (!usuario)
            throw new UnauthorizedException("El usuario no se encuentra registrado");
        if (await bcrypt.compare(login.password, usuario.passwd) === false)
            throw new UnauthorizedException("La contraseña es incorrecta");

        const payload = {
            sub: usuario.id
        }
        
        const token = await this._jwt.signAsync(payload)

        const refreshToken = this._rfs.issue(usuario.id)

        return { token, refreshToken }
    }

}
