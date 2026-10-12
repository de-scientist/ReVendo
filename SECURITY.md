# Security policy

- Never commit `.env`, API credentials, session secrets, provider passkeys, or personal data.
- Report suspected vulnerabilities privately to the project owner before public disclosure.
- Production deployments must use managed secret storage, TLS, least-privilege credentials, backups, monitoring, rate limits, CSRF protection, and audit logs.
- Payment callbacks must be validated using provider-supported mechanisms and reconciled against provider records; do not assume a generic callback signature exists.
- Production payment collection and seller disbursement are out of scope for Phase 1 and must remain disabled.
