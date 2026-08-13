# Production Runbook — Haven Trail Maldives Booking Site

This runbook explains how to deploy, configure, and operate the Haven Trail Maldives booking website in production. It assumes the code is deployed from the feature/booking-site-scaffold branch and that you will provide payment gateway credentials later.

1) Architecture overview
- App: Node.js (Express) server rendering EJS templates.
- DB: SQLite used for convenience in the scaffold; for production, move to PostgreSQL or MySQL.
- Uploads: stored in filesystem (public/uploads). For production, use S3 or similar durable object store.
- Sessions: express-session currently stores sessions in memory. For production, use Redis-backed session store.
- Emails: nodemailer with SMTP or a transactional provider.
- Payments: placeholders for Google Pay (client demo) and bank gateways (BML/MIB/SIB). Integrate with a capable payment gateway for tokenization and capture.

2) Pre-deployment checklist
- Replace default credentials in .env:
  - ADMIN_PASS
  - SESSION_SECRET
- Configure a production database and update DATABASE_PATH or refactor DB layer to use PostgreSQL.
- Configure storage for uploads (S3 recommended) and update code to serve uploaded content from S3 or CDN.
- Configure SMTP env vars for transactional emails (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL).
- Provision a Redis instance for production sessions and modify express-session config to use connect-redis.
- Prepare TLS/HTTPS certificates (Let's Encrypt or provider-managed certs).
- Set up environment variables/secret management in your hosting environment (Render, Heroku, AWS Secrets Manager, etc.).

3) Payment gateway integration (high level)
- Google Pay (production):
  - Obtain merchant ID and gateway information.
  - Update public/js/checkout.js tokenizationSpecification to point to your gateway and gatewayMerchantId.
  - On server (/payments/googlepay/process): extract the payment token and send it to your gateway to authorize/capture.
  - Only mark bookings.paid = 1 after successful capture from your gateway. Persist gateway transaction ID for reconciliation.

- Bank gateways (BML, MIB, SIB):
  - Implement the provider-specific flows (redirect-based or tokenization-based).
  - Implement webhook endpoints for payment confirmations and signature verification.
  - Persist gateway responses and transaction IDs in the bookings table or a new transactions table for reconciliation.

4) Deployment options (recommended)
- Small deployments (simple):
  - DigitalOcean App Platform, Render, or Railway can deploy this Node app with minimal setup.
  - Use a managed PostgreSQL or MySQL add-on and configure persistent file storage (S3) for uploads.
- Larger deployments (scalable):
  - Dockerize app (Dockerfile included) and run on ECS/Fargate or Kubernetes.
  - Use RDS (Postgres) + S3 + ElastiCache (Redis) for sessions.

5) Environment variables (example)
- NODE_ENV=production
- PORT=3000
- DATABASE_URL=postgres://user:pass@host:5432/dbname
- SESSION_SECRET=replace_with_strong_secret
- ADMIN_USER=admin
- ADMIN_PASS=securepassword
- SITE_NAME=Haven Trail Maldives
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL
- GOOGLE_PAY_GATEWAY and GOOGLE_PAY_GATEWAY_MERCHANT_ID (when ready)
- PAYMENT_BML_KEY, PAYMENT_BML_SECRET, PAYMENT_BML_WEBHOOK_SECRET (when ready)
- PAYMENT_MIB_KEY, PAYMENT_MIB_SECRET
- PAYMENT_SIB_KEY, PAYMENT_SIB_SECRET

6) Backup & recovery
- Database: schedule regular DB dumps (if using SQLite, move to Postgres for easier backups). Store backups off-site (S3).
- Uploads: use S3 with versioning and lifecycle rules; backup critical assets to separate storage.

7) Monitoring & logging
- Centralized logs: forward logs to a central logging host (Papertrail, Loggly, AWS CloudWatch).
- Health checks: configure an endpoint (e.g., /health) and monitor it.
- Alerts: set up alerts for error rates, failed jobs, disk usage, and payment webhook failures.
- Performance: monitor latency and optimize image sizes and caching.

8) Security
- Use HTTPS only.
- Harden cookies: set secure, sameSite, httpOnly.
- Validate and sanitize all user input; use CSRF protection (csurf) for forms.
- Restrict upload types and max upload size; scan for malware if possible.
- Limit login attempts and monitor suspicious admin access.

9) Post-deploy actions
- Verify admin login and change ADMIN_PASS.
- Add a test room and perform an end-to-end booking test using sandbox payment credentials.
- Verify email delivery and webhook receipt for payments.

10) Rollback plan
- Keep the previous release and DB snapshot. If a problem occurs, redeploy previous release and restore DB backup if necessary.

11) Release & merge process
- Create a PR from feature/booking-site-scaffold into the default branch with the checklist above.
- Run tests and a staging deploy. After verification, merge and promote to production.

---

