# Protected sale operating runbook

This document is a draft for the pilot team and Egyptian counsel. It does not authorize holding funds or promise buyer or seller protection.

## Current capability and controls

- New sale listings are private until a staff reviewer approves an authority document and the listing. Existing sale listings remain approved on migration; operations should re-review them before pilot admission.
- The buyer and seller can propose, revise, and accept the same version of sale terms from a property chat. A revision clears both acceptances. A property may have multiple proposals, but only one accepted or later active sale.
- Accepted deals have a private document area, immutable event records, and a dispute record. Listing reviews, authority decisions, and reports also have append-only audit events visible in the staff queue. Staff can check evidence and mark a case ready for a future payment partner. This status is **not** a funding instruction.
- `api/_sales/payment-provider.js` rejects all money operations. No payment credentials, webhooks, release commands, or payout routes are present. `sale_payment_references` cannot be written by a browser role.
- Sale phone numbers are moved from the public property table into `seller_contacts`, which only the owner can read. Production validation found 12 existing sale contacts in the private table and zero public sale phone values.

## Provisioning and access

The operations lead must add reviewer identities through a privileged, audited database administration process. `sale_staff.user_id` is the exact Clerk JWT `sub`, with `role` of `reviewer` or `manager`, and `active = true`. Never expose staff creation in the browser. Remove access by setting `active = false`, and terminate or revoke the person's application session through the identity provider. Reviewers use `/SalesReview`.

The sale migration is installed in production. The UI is on by default after deployment and can be disabled with `VITE_PROTECTED_SALES_ENABLED=false`. `npm run test:sales-db` applies the migration to an in-memory PostgreSQL runtime and checks listing and deal RLS, offer acceptance and expiry, competing deals, private documents, staff review, disputes, listing locks, evidence gates, and dual approval without payout. The separate GitHub Actions integration workflow runs actual Supabase Auth, Storage, PostgREST, and RLS checks. Live payment and payout remain disabled.

Supabase free-project limits blocked a separate hosted test project, and the owner declined a paid branch. The repository uses a disposable Supabase setup in `integration/` and GitHub Actions to run actual Auth, Storage, PostgREST, and RLS checks on an Ubuntu runner. The migration was then applied to the live RealEstate database on 2026-09-24. Validation found 12 approved existing sales, 12 corresponding private contacts, zero public sale phone values, and two private evidence buckets. The signed-in site owner's Clerk account was provisioned as the first active sale manager; the review queue was then opened successfully with that account. A second distinct manager is required before a future release or refund could receive dual approval. Money movement remains disabled.

## Proposed case policy for legal approval

| Stage | Staff evidence | Hold or exception |
| --- | --- | --- |
| Listing approval | Seller authority document, ownership match, listing facts, photo rights | Reject unclear authority or suspicious duplicates. |
| Offer acceptance | Both parties accept the same frozen version, including fee and expiry | Changed terms require a new version. |
| Verification | Identity, authority, title, encumbrance, and signed agreement reviewed by qualified people | Record failure reason; do not ask for payment. |
| Partner funding | Partner confirms full amount and held status through signed server webhook | No screenshot, browser redirect, or user message proves funding. |
| Closing | Registration and handover conditions independently verified | Any unresolved dispute blocks release. |
| Release/refund | Two distinct authorized reviewers approve a documented decision; partner executes | Reconcile partner statement and internal ledger before marking complete. |

Before acceptance either party can cancel a proposal with a reason. After acceptance, cancellation needs staff and the signed terms. The current implementation stops at partner readiness; funded cancellation and refunds need the partner contract and legal rules.

## Payment integration contract

Implement a server-only adapter with `createInstructions`, `confirmFunding`, `getHeldBalance`, `release`, `refund`, `reconcile`, and `verifyWebhook`. Use partner IDs and idempotency keys for every action. The webhook handler must verify raw-body signatures, event timestamps, amount, currency, deal ID, and replay identifiers before a database transaction changes money state. Store raw provider event IDs and process them once. A browser must have read-only access to payment status. Protect release and refund with two approvals from distinct active staff members and a separate execution command. Review provider statements daily and halt payouts when balances disagree. Obtain partner sandbox and signed agreement before replacing the disabled adapter.

## Privacy, support, and incident policy

- Allow only deal participants and authorized reviewers to read private evidence; signed download links expire after one minute. Do not put identity documents in public images or chat text.
- Counsel must approve retention periods for ID, title documents, chats, financial events, and legal holds. Until then, do not automatically delete dispute or transaction evidence. Handle access and deletion requests through a named privacy owner.
- Proposed response targets: suspected payment or fraud issue within one working hour during published support hours; ordinary case issue within one working day. Publish hours only when staffed.
- Suspend a reported listing pending review when evidence indicates fraud. Preserve the case record, revoke compromised staff access, and notify the payment partner if a funded case is affected.
- Keep a weekly reviewer sampling process and a daily exception queue. Record who reviewed each document, source, time, reason, and corrections.

## Release checklist

1. Egyptian counsel approves brokerage role, contracts, privacy notice, dispute authority, AML/KYC allocation, tax, and registration evidence.
2. Licensed partner demonstrates full-price conditional holding and payout in Egypt and signs operational and liability terms.
3. Staging migration and two-account tests pass; existing sale listings and phone privacy are audited.
4. Partner sandbox tests cover duplicate and delayed webhooks, partial or mismatched amount, refund, chargeback, reconciliation mismatch, and two-person release authorization.
5. Pilot team is staffed, trained, and reachable; only then can product copy describe payment protection.
