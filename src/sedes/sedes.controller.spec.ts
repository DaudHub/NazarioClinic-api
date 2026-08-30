import { Test, TestingModule } from '@nestjs/testing';
import { SedesController } from './sedes.controller';

describe('SedesController', () => {
  let controller: SedesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SedesController],
    }).compile();

    controller = module.get<SedesController>(SedesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
