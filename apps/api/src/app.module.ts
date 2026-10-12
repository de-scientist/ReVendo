import { ThrottlerModule } from '@nestjs/throttler';
import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';

/**
 * Phase 1 module graph (intentionally small).
 * Future modules (auth, catalog, cart, orders, payments, ledger, payouts,
 * admin, notifications, audit) are added here behind reviewed PRs — see docs/architecture.md.
 */
@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    HealthModule,
  ],
})
export class AppModule {}
