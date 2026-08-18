# Cloud Mail v3.1.0 and suoxie.site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the user's GitHub deployment repository to Cloud Mail v3.1.0 and deploy a fresh Cloudflare instance supporting `@suoxie.site`.

**Architecture:** Preserve the repository history while replacing the application tree with the upstream v3.1.0 release. Keep deployment secrets in GitHub/Cloudflare, set only the non-secret mailbox-domain default in source, and create fresh Cloudflare bindings so no old data is reused.

**Tech Stack:** Vue 3, Hono, Cloudflare Workers, D1, KV, optional R2, Wrangler 4, GitHub Actions

**Spec:** `docs/superpowers/specs/2026-08-18-cloud-mail-v3-1-suoxie-site-design.md`

## Global Constraints

- Upstream application version must be exactly `v3.1.0` (`d50166720fe3956b0a0d8ef439eceab71dfb48c2`).
- `suoxie.site` is an email domain only, not the Worker web custom domain.
- Existing Cloudflare resources must not be deleted or reused for the new deployment.
- Secrets and access-bearing values must not be committed or printed.

---

### Task 1: Replace the source tree with upstream v3.1.0

**Files:**
- Modify: repository application tree to match tag `upstream-v3.1.0`
- Preserve: `.git/`

**Interfaces:**
- Consumes: upstream Git tag `upstream-v3.1.0`
- Produces: branch `agent/cloud-mail-v3-1-suoxie-site` whose application files match upstream v3.1.0

- [ ] **Step 1: Create the deployment branch**

  Run: `git switch -c agent/cloud-mail-v3-1-suoxie-site`

- [ ] **Step 2: Replace tracked application files with the release tree**

  Run: `git checkout upstream-v3.1.0 -- .`

- [ ] **Step 3: Verify source identity**

  Compare the checked-out application paths and package locks against `upstream-v3.1.0`; only the deployment-domain and design/plan files may differ afterward.

### Task 2: Configure the mailbox-domain default

**Files:**
- Modify: `.github/workflows/deploy-cloudflare.yml`
- Modify: `mail-worker/wrangler.toml`
- Modify: `mail-worker/wrangler-action.toml`

**Interfaces:**
- Consumes: GitHub Actions variable `DOMAIN` when present
- Produces: fresh resource base name `cloud-mail-suoxie-site`, fallback domain JSON array `["suoxie.site"]`, and Wrangler domain array `['suoxie.site']`

- [ ] **Step 1: Set the fresh resource name and GitHub Actions domain fallback**

  Change the `NAME` and `DOMAIN` environment expressions to:

  ```yaml
  NAME: ${{ secrets.NAME || vars.NAME || 'cloud-mail-suoxie-site' }}
  DOMAIN: ${{ secrets.DOMAIN || vars.DOMAIN || '["suoxie.site"]' }}
  ```

- [ ] **Step 2: Add the checked-in Wrangler default**

  Set the Worker variable to:

  ```toml
  domain = ["suoxie.site"]
  ```

- [ ] **Step 3: Bind D1 by the selected resource name**

  Set the action template to:

  ```toml
  database_name = "${NAME}"
  ```

- [ ] **Step 4: Confirm no credentials are present**

  Search the diff for token-, secret-, account-, and database-ID patterns and verify that only placeholders remain.

### Task 3: Validate the upgraded source locally

**Files:**
- Test: `mail-worker/test/index.spec.js`
- Validate: `mail-worker/wrangler.toml`
- Build: `mail-vue/`

**Interfaces:**
- Consumes: pnpm lockfiles from v3.1.0
- Produces: passing tests, successful frontend build, and successful Wrangler dry-run

- [ ] **Step 1: Install locked dependencies**

  Run `pnpm install --frozen-lockfile` separately in `mail-worker` and `mail-vue`.

- [ ] **Step 2: Run Worker tests**

  Run: `pnpm exec vitest run`

- [ ] **Step 3: Build the Vue application**

  Run: `pnpm run build`

- [ ] **Step 4: Validate Wrangler configuration**

  Run: `pnpm exec wrangler deploy --dry-run --keep-vars`

### Task 4: Publish the GitHub branch

**Files:**
- Stage only: application upgrade, domain defaults, spec, and plan

**Interfaces:**
- Consumes: validated local branch
- Produces: pushed GitHub branch and draft pull request targeting `main`

- [ ] **Step 1: Review and commit the exact diff**

  Commit message: `upgrade Cloud Mail to v3.1.0 for suoxie.site`

- [ ] **Step 2: Push the branch**

  Run: `git push -u origin agent/cloud-mail-v3-1-suoxie-site`

- [ ] **Step 3: Open a draft pull request**

  Target `b1gwomenna-jpg/cloud-mail:main` and include validation results in the pull request body.

### Task 5: Provision and verify Cloudflare deployment

**Files:**
- External: GitHub Actions secrets/variables
- External: Cloudflare Worker, D1, KV, optional R2, and Email Routing configuration

**Interfaces:**
- Consumes: authenticated Cloudflare account and `suoxie.site` zone
- Produces: new deployed Worker using fresh bindings and accepting `@suoxie.site`

- [ ] **Step 1: Verify Cloudflare authentication and zone ownership**

  Confirm the account can read Workers, D1, KV, R2, and the `suoxie.site` zone before creating anything.

- [ ] **Step 2: Capture existing zone and Email Routing state**

  Record non-secret DNS/MX record and route metadata before writes.

- [ ] **Step 3: Create fresh named resources**

  Use `cloud-mail-suoxie-site` as the base name unless it already exists; never delete or reuse the old resources.

- [ ] **Step 4: Configure GitHub deployment secrets**

  Set the Cloudflare API token/account ID, fresh D1/KV/R2 identifiers, administrator address, and a new random JWT secret through secret APIs or interactive tools only.

- [ ] **Step 5: Merge and run deployment**

  Merge the validated pull request, run the deployment workflow, and wait for completion.

- [ ] **Step 6: Verify initialization and domain exposure**

  Require exact `success` from the initialization endpoint and confirm the public domain list includes `@suoxie.site`.

- [ ] **Step 7: Configure and test inbound routing**

  Route `suoxie.site` inbound mail to the new Worker and verify a controlled message is received.
