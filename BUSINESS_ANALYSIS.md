# RealEstate business analysis and protected sales

Status: implementation baseline, 24 September 2026. This is a product and operating proposal, not legal advice or a claim that protected payments are live.

## Executive assessment

RealEstate currently helps seekers browse, compare, save, and contact property owners. Owners can create and manage listings. The app has private, property-linked conversations, but no completed-transaction service. A buyer and seller can move to WhatsApp and settle without a durable offer, independent property checks, or payment evidence. For sales, the new experience keeps contact in site chat and records the proposed deal and review work. Funding and payout remain unavailable until a licensed partner and legal framework are approved.

The near-term value proposition is a **managed, documented sale**: clear terms, verified seller authority and title evidence, one case timeline, and a human review team. RealEstate coordinates the case; a qualified bank or payment provider must hold and move funds. RealEstate must never describe its own database as an escrow account.

## Current product and evidence

| Capability | Evidence | Business implication |
| --- | --- | --- |
| Discovery and seller listings | `src/pages/Home.jsx`, `src/pages/PropertyDetails.jsx`, `src/components/add-property/Form.jsx` | Supply and demand can meet, but listing accuracy is not assured. |
| Private inquiry | `src/components/chat/ChatBox.jsx`, `supabase/migrations/20260923110511_property_inquiries.sql` | One buyer and seller can discuss a property; cross-account delivery needs live verification. |
| Direct off-site contact | `src/pages/PropertyDetails.jsx` previously exposed WhatsApp for every listing | Sale terms and payments could escape the platform. Sale listing UI now uses in-site chat, but existing property data still contains seller phone and needs a data-level privacy migration. |
| Account and data | Clerk, Supabase, RLS, Vite/React | Suitable foundation for case records; sensitive changes must run through controlled database or server commands. |
| Monetization | No existing checkout, invoice, commission, or payout code | The service needs a fee contract and operational cost proof. |

## Stakeholders and jobs

| Stakeholder | Job and minimum evidence of success |
| --- | --- |
| Buyer | Find a credible sale listing, agree terms, verify ownership, pay through an authorized channel, receive registered title and handover. |
| Seller | Prove authority, accept a clear offer, see confirmed funds before transfer, receive payout net of disclosed fees. |
| RealEstate operations | Review evidence, resolve exceptions, maintain an auditable timeline, meet response targets, and reconcile every transaction. |
| Legal/title partner | Check identity, ownership, encumbrances, agreement, and registration independently. |
| Licensed payment partner | Collect, safeguard, refund, release, settle, and report funds under its own regulatory obligations. |

## Market and positioning

Start with owner-led resale listings in selected Egyptian governorates where the team can actually source title reviewers and support closings. The market choice is operational: expanding geography before reliable verification would make review quality harder to control. RealEstate's differentiator should be a documented, supervised transaction rather than a larger catalogue or an unproven guarantee. Alternatives include direct owner contact, brokers, and listing portals; users will compare total fees, listing quality, response time, and confidence in the closing process. Validate demand through interviews with buyers, sellers, brokers, and conveyancing professionals before committing to a national launch.

Strengths are an existing bilingual marketplace, private chat, and owner tools. Weaknesses are limited verified supply, no payment partner, and no proven operations team. Opportunities are verified resale inventory and faster, clearer coordination. Threats are off-platform deals, fraudulent documents, long registration times, high acquisition costs, and incumbent broker relationships. The pilot must show users value a paid managed closing enough to overcome these costs.

## Prioritized weaknesses

| Priority | Weak point | Harm and action |
| --- | --- | --- |
| P0 | No licensed custodian or conditional release arrangement | Buyer or seller could lose money. Keep all funding and payout controls off until provider capabilities, contract, and counsel sign-off. |
| P0 | Seller identity, authority, and title are not established by a listing | Duplicate or fraudulent sales. Hold new sale listings for authority review; require deal-level title and encumbrance checks. |
| P0 | Sale contact can leave site and account names are not legal identities | No reliable deal record. Use in-site sale chat, verify legal identity separately, freeze accepted offer versions. |
| P0 | No agreed cancellation, dispute, or release rules | Either party could be trapped or paid unfairly. Agree rules before funding, maintain an operations queue and evidence trail. |
| P1 | No payment, fee, or reconciliation records | Revenue and liabilities cannot be measured. Add partner references and daily reconciliation before pilot. |
| P1 | Stale listings and weak moderation | Failed inquiries and fraud exposure. Review sale listings, accept reports, and expire visibility after 90 days without refresh. |
| P1 | No legal/privacy pages or document lifecycle | Unclear responsibilities and sensitive data risk. Draft terms and retention rules, obtain counsel approval before publication. |
| P1 | Partial Arabic coverage and untested two-account chat | Service failure for core users. Test complete sale flows in Arabic and English. |
| P2 | Limited property facts, analytics, and alerts | Lower lead quality and weak optimization. Improve after trust foundations are stable. |

## Target journey and responsibility boundary

1. **Listing.** Seller submits a sale listing and private authority document. Staff checks authority before public approval. A buyer reports suspicious content from the detail page.
2. **Conversation and offer.** Buyer and seller talk in site chat. Either proposes price, conditions, expiry, and disclosed seller fee. A revision increments the version and clears prior acceptance. Both accept the same version.
3. **Verification.** Staff and qualified legal partner check identity, seller authority, title, encumbrances, agreement, and any special conditions. Failed checks stop the case. The site records review events and private evidence.
4. **Funding.** After a partner is contracted, the buyer receives partner-backed payment instructions inside the deal workspace. Only the partner's signed, idempotently processed confirmation establishes receipt and held balance. A screen return, screenshot, or buyer assertion never does.
5. **Closing.** Qualified parties conduct physical/legal signing and registration. Staff verifies required documents and handover evidence. An open dispute pauses progress. Registration is recorded, not performed by the site.
6. **Settlement.** Two distinct authorized reviewers approve a release or refund request after checking conditions. The partner executes it. Webhooks and daily reconciliation confirm final state. The seller receives a settlement statement showing the fee and net payout; the buyer receives a receipt and case archive.

Current code covers steps 1 through 3 as a preparation workflow. Steps 4 through 6 are a gated integration and operating milestone. No live funds may move until the release gates below pass.

## Operating rules for counsel and pilot team

- **Identity and authority:** require identity of both parties, matching legal names, seller title or valid authorization, and a second reviewer for mismatches. A Clerk profile name is not proof of identity.
- **Title:** a qualified Egyptian professional checks registry status, liens, disputes, inheritance or developer restrictions, and the ability to transfer. Document which source was checked and when.
- **Offers:** EGP only. Accepted terms are immutable; changes require a new version and fresh approval. No off-platform transfer is represented as protected.
- **Cancellation:** before acceptance either party can cancel with reason. After acceptance staff decides under signed terms. When funding is live, cancellation and refund must follow partner and contract rules.
- **Disputes:** either participant can open a case; staff records evidence and a reasoned decision. An open dispute blocks progress to partner readiness. Money stays held under partner control until the contractual resolution path finishes.
- **Support targets:** acknowledge funding or fraud concerns within one working hour during published support hours; other deal issues within one working day. Escalate suspected fraud immediately to a named operations lead. These are proposed targets requiring staffing.
- **Documents and privacy:** only participants and authorized reviewers can read private case documents. Use short signed download links, log review decisions, prohibit public document URLs, define retention and deletion schedules with counsel, and minimize identity data stored by the site.
- **Reports:** review suspected fraud before reapproving a listing; preserve evidence needed for disputes and legal holds.

## Revenue model and unit economics

Recommended model: free browsing and basic listings, with a **seller-paid success fee**, disclosed before offer acceptance and due only after a completed protected sale. The current code snapshots an *illustrative* 1% fee in an offer; final pricing requires legal, partner, and pilot validation. Paid promotion can be tested later and must never imply verification.

Illustrative EGP 3,000,000 sale: revenue at 0.5%, 1%, and 1.5% is EGP 15,000, 30,000, and 45,000. If partner cost is assumed at 0.2% (EGP 6,000), legal review EGP 5,000, acquisition EGP 5,000, and operations EGP 1,000, estimated contribution before overhead, tax, fraud, and refunds is **−EGP 2,000 / 13,000 / 28,000** respectively. These are scenarios, not provider quotes. The pilot must measure actual fees, close rate, cost per verified listing, acquisition cost per completed sale, dispute loss, and staff time before confirming the fee.

## Funnel and pilot scorecard

Track listing submitted → authority approved → viewed → chat opened → offer sent → both accepted → review passed → funding started → funds confirmed → registration verified → payout settled. Segment by governorate, property type, language, acquisition channel, and seller cohort. Review weekly: conversion and elapsed time at each stage, stale listings, false approvals, disputes per funded deal, refund time, reconciliation exceptions, and contribution per completed sale. Avoid publishing unverified transaction statistics.

## Phased acceptance

| Phase | Exit criteria |
| --- | --- |
| Foundation | Business rules and draft policies reviewed; owner and staff responsibilities named; no payment claim appears in product copy. |
| Listing and offer | Two distinct accounts can chat, propose, revise, accept the same version, report a listing, and cannot see another deal or private file. |
| Managed review | Staff can approve evidence with an audit record; missing buyer/seller identity, title, encumbrance, agreement, or seller authority blocks readiness. |
| Partner integration | Signed events, idempotency, two-person release/refund authorization, partner balance reconciliation, and legal approvals all pass sandbox tests. |
| Pilot | A small supervised cohort shows acceptable close rate, response time, loss rate, and positive contribution under measured costs. |

## Release gates and external validation

- Obtain Egyptian counsel review of brokerage registration, consumer contracts, privacy, AML/KYC responsibilities, disputes, tax, and registration evidence. [GOEIC guidance](https://www.goeic.gov.eg/upload/online/2024/07/documents/files/en/1571.pdf) describes registration requirements for real estate brokerage activity.
- Contract a qualified bank or payment provider that explicitly supports full-price conditional holding, refund, release, settlement, and operational reporting in Egypt. The [Central Bank of Egypt](https://www.cbe.org.eg/en/news-publications/news/2025/06/19/08/20/psos-and-psps-licensing-rules) regulates payment providers and transfer activities.
- Confirm the closing evidence with an Egyptian title professional. The [official Egyptian real estate platform's transfer guide](https://blogs.realestate.gov.eg/how-to-transfer-property-ownership-in-egypt-legally/) emphasizes ownership checks and registration; the site's timeline is not itself title transfer.
- Pass two-account, staff authorization, document privacy, webhook replay, reconciliation, refund, and dispute tests in partner sandbox. Run a small manually supervised pilot before broad availability.
