import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('reports the API as healthy with a stable envelope', () => {
    const controller = new HealthController();
    const body = controller.getHealth();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('revendo-api');
    expect(typeof body.version).toBe('string');
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });
});
