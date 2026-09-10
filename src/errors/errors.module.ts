import { Global, Module } from '@nestjs/common';
import { DbErrorsService } from './db-errors.service';

@Global()
@Module({
  providers: [DbErrorsService],
  exports: [DbErrorsService],
})
export class ErrorsModule {}
