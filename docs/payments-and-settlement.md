# Payments & settlement — Phase 1 boundaries (no live behavior)

## Provisional business rules (approved constraints)

- Commission: 10% of merchandise price. No fixed fee in the initial release.
  Delivery, processing fees, and taxes sit outside the commission base.
- Commission rules will be versioned; each transaction snapshots the rule in force.
- Earnings are NOT withdrawable on payment alone. Eligibility needs: buyer-confirmed
  delivery/collection, payment reconciliation, risk/dispute clearance, a verified payout
  account, and any admin/compliance approvals. Minimum 3-day wait after confirmation;
  disputes, failed reconciliation, risk holds, returns, legal blocks, and admin holds
  override the minimum.
- Delivery/collection is buyer–seller arranged in the MVP. No platform courier in Phase 1.
  Sellers must never confirm receipt for buyers; confirmation evidence + audit history
  are preserved for disputes.
- Expected rails (future): Daraja STK Push, Paybill with reconciliation, manual bank
  transfer verification (MVP), M-Pesa B2C disbursement (preferred payout rail, gated).
- Platform absorbs processing fees initially, pending cost review.

## Financial design principles (binding on later phases)

- Prices come from server-side DB records; checkout snapshots item price + commission rule.
- Serializable/locked inventory reservation; no provider network call inside an open DB transaction.
- Idempotency on checkout, callbacks, and payouts (`IdempotencyKey` table exists now).
- Provider callbacks reconciled against provider records; collection and disbursement are
  separate concepts, as are payment status / order status / earnings / payouts.
- Immutable ledger + audit history; never trust browser balances or commission math.

## Provider abstraction (future interface — not implemented)

`initiatePayment | queryTransaction | validateEvent (provider's real mechanism) |
reconcile | initiateDisbursement | queryDisbursement`. Sandbox adapter only after
Phase 1 acceptance. Technical integration ≠ legal authorization to hold/move funds.

## Forbidden in Phase 1

Live Daraja calls, STK Push, B2C payouts, mock callbacks marked as paid, auto-payouts,
stored live credentials, or any compliance/approval claim. Flags
`PAYMENTS_ENABLED / PAYMENTS_LIVE_ENABLED / PAYOUTS_ENABLED` default to `false` and are
enforced by `loadEnv()` production guards.
