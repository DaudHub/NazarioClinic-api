import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RefreshTokenService {

    constructor(private readonly _ctx: PrismaService) { }

    async issue(userId: string): Promise<string> {
        const token = randomBytes(64).toString('hex');
        const hashed = await bcrypt.hash(token, 10);
        const fec_venc = new Date();
        fec_venc.setDate(fec_venc.getDate() + 7);

        await this._ctx.refreshtokens.upsert({
            where: { id_usuario: userId },
            create: { id_usuario: userId, token: hashed, fec_venc },
            update: { token: hashed, fec_venc }
        });

        return token;
    }

    async validate(userId: string, token: string): Promise<boolean> {
        const stored = await this._ctx.refreshtokens.findUnique({
            where: { id_usuario: userId }
        });
        if (!stored || stored.fec_venc < new Date())
            return false;

        return bcrypt.compare(token, stored.token);
    }

}
