import { Test, TestingModule } from '@nestjs/testing';
import { EndGateway } from './end.gateway';

describe('EndGateway', () => {
  let gateway: EndGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EndGateway],
    }).compile();

    gateway = module.get<EndGateway>(EndGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
