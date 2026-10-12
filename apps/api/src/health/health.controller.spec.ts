import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('reports the API as healthy', () => {
    const controller = new HealthController();
    expect(controller.getHealth().status).toBe('ok');
    expect(controller.getHealth().service).toBe('revendo-api');
  });
});
