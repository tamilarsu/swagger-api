import { Test, TestingModule } from '@nestjs/testing';
import { IdconfigurationsController } from './idconfigurations.controller';

describe('IdconfigurationsController', () => {
  let controller: IdconfigurationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdconfigurationsController],
    }).compile();

    controller = module.get<IdconfigurationsController>(IdconfigurationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
