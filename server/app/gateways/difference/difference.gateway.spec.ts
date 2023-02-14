import { Test, TestingModule } from '@nestjs/testing';
import { DifferenceGateway } from './difference.gateway';

describe('DifferenceGateway', () => {
  let gateway: DifferenceGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DifferenceGateway],
    }).compile();

    gateway = module.get<DifferenceGateway>(DifferenceGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
