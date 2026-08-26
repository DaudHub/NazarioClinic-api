import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import type { Request, Response } from 'express';
import { RefreshTokenService } from './refresh.service';

@Controller('auth')
export class AuthController {

    constructor(private readonly _auth: AuthService, private readonly _rfs: RefreshTokenService) {}

    @Public()
    @Post('login')
    async login(@Body() login: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this._auth.login(login)
        res.cookie('refresh_token', result.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7,
            path: '/auth/refresh',
        });
        return { token: result.token }
    }

    @Get('refresh')
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.['refresh_token'];
        const userId = req.user?.userId
        if (!userId)
            throw new UnauthorizedException("No fue posible obtener el usuario de la petición")
        if (!await this._rfs.validate(userId, refreshToken))
            throw new UnauthorizedException("No fue posible obtener el usuario de la petición")
        const newRefreshToken = await this._rfs.issue(userId)
        res.cookie('refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7,
            path: '/auth/refresh',
        });
    }

    @Get('authorize')
    async authorize() {
        return
    }

}
