# Security and deployment notes

## What this patch changes

- Removes the JWT fallback secret and rejects insecure/missing JWT configuration.
- Makes public registration create only villager accounts; privileged roles must be provisioned through a trusted workflow.
- Requires an explicitly configured AES secret for health-record encryption.
- Checks patient ownership / ASHA assignment before health-record reads, writes, and report generation.
- Restricts ASHA endpoints and villager listings to authenticated ASHA workers and assigned villagers.
- Removes phone-number default passwords. Villager accounts created by an ASHA worker are inactive until an activation/password setup flow is implemented.
- Limits profile updates to an allowlist of fields.
- Stops claiming that emergency SMS messages were sent when SMS integration is not configured.
- Requires production environment configuration and a successful MongoDB connection before the API starts.
- Restricts Express CORS to the configured frontend origin in production and reduces default request body limits.

## Required environment variables

Set these in the backend hosting provider's secret/environment settings. Do not commit actual secrets.

- `NODE_ENV=production`
- `PORT` (provided automatically by many hosts)
- `MONGODB_URI` (managed MongoDB URI with TLS and network access restrictions)
- `JWT_SECRET` (random secret, at least 32 characters)
- `AES_SECRET` (secret of at least 32 characters; confirm compatibility with the existing CryptoJS passphrase encryption format)
- `FRONTEND_URL` (exact HTTPS origin of the deployed frontend)

Generate a secret locally with Node.js:

```sh
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Generate distinct values for JWT and AES. Never put backend secrets in `REACT_APP_*` variables.

## Frontend on Vercel

Configure the Vercel project with root directory `frontend`, build command `npm run build`, and output directory `build` (assuming Create React App scripts in `frontend/package.json`). Set the public build-time variable:

```env
REACT_APP_API_URL=https://YOUR-API-HOST.example/api
```

Replace the example URL with the actual HTTPS API origin. `frontend/src/utils/api.js` retains localhost as a development fallback; do not rely on that fallback in production.

## Architecture

The Express API uses a persistent server and MongoDB connection, and the repository includes a separate Flask AI service. Deploy the API and AI service to compatible hosts unless they are deliberately refactored and tested for Vercel Functions. Use a managed MongoDB deployment and do not expose MongoDB's port publicly. The Docker Compose service hostname `backend` and localhost URLs are not production URLs.

## Important follow-up work

1. Implement a secure villager activation/password-reset flow before activating accounts created by ASHA workers.
2. Add rate limiting, audit logging, request validation, security headers, and automated authorization tests.
3. Configure and verify the SMS provider before representing any alert as delivered.
4. Review Flask CORS and add service-to-service authentication for the AI endpoint.
5. Review existing stored data and rotate any secrets that may previously have been exposed. Rotating the AES key requires a data migration plan for existing encrypted records.
6. Run dependency, secret, build, and integration checks in CI and stage before production.

## Validation status

These changes were applied to a dedicated branch. They must be reviewed and tested in the project's real Node.js environment before merge or production deployment. This patch does not claim that the app is production-ready or that SMS delivery is functional.