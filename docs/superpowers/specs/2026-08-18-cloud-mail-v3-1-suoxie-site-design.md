# Cloud Mail v3.1.0 Fresh Deployment Design

## Goal

Deploy Cloud Mail `v3.1.0` from `b1gwomenna-jpg/cloud-mail` with `suoxie.site` as the mailbox domain and no dependency on the previous deployment's data.

## Design

- Preserve the existing repository history, but replace the application tree with the upstream `maillab/cloud-mail` `v3.1.0` release tree on a dedicated branch.
- Configure `suoxie.site` as the default `DOMAIN` value used by GitHub Actions and the checked-in Wrangler template.
- Keep Cloudflare credentials, account IDs, database IDs, administrator identity, and JWT secret outside version control.
- Use new Cloudflare resource names and IDs for Worker, D1, KV, and optional R2 bindings.
- Do not configure `suoxie.site` as the web custom domain. It is an email domain only.
- Configure Cloudflare Email Routing for `suoxie.site` only after capturing the existing DNS and routing state.

## Safety

- Do not delete or mutate the old Worker, D1, KV, or R2 resources.
- Do not expose secret values in logs, commits, or deliverables.
- Stop before external Cloudflare writes if authentication, zone ownership, or permissions cannot be verified.

## Verification

- Frontend production build passes.
- Worker tests pass.
- Wrangler dry-run validation passes with deployment placeholders resolved locally.
- The deployed initialization endpoint returns `success`.
- Public application settings contain `@suoxie.site`.
- A controlled inbound test message reaches a mailbox at `@suoxie.site`; otherwise inbound routing remains explicitly unverified.
