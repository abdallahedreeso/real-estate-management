# Business decisions and gaps

The protected sale implementation and its operating analysis are documented in [BUSINESS_ANALYSIS.md](BUSINESS_ANALYSIS.md). New sale listings now require authority evidence and staff approval; offer versions, private deal evidence, reports, and review status are implemented in the repository. Live funding, conditional release, registration verification, and seller payout remain **disabled pending a licensed partner, counsel review, and pilot operations**. Do not market these as available protections.

The marketplace serves **home seekers and property owners equally**. The current product lets people browse, filter, save, and view properties; signed-in owners can add and manage listings. The items below need business decisions or operational work before they should be promised in the interface.

## Decide before launch

| Area | Current gap | Decision needed |
| --- | --- | --- |
| Market and currency | Visible prices use EGP and the contact form assumes Egyptian phone numbers; country selection is fixed to Egypt. | Validate all legacy prices as EGP and enforce Egypt-only coordinates. |
| Listing trust | New sale listings enter review and accept private authority evidence, but the manual reviewer process needs a trained team and live validation. | Staff the review queue, define checks and repeat offender handling. |
| Availability | Sale listings now become private after 90 days without an owner refresh. | Monitor renewal rates and verify owners do not refresh unavailable properties. |
| Buyer or renter inquiry | Sale listing UI uses in-site chat; rental listings retain WhatsApp. Response expectations remain undefined. | Set response targets, notification ownership, and consent for sharing contact details. |
| Inquiry verification | The private conversation migration is deployed and signed-in reads now load, but message delivery between two separate accounts has not been exercised. | Test seeker send, seller inbox and reply, refresh persistence, and cross-user access with two accounts. The former broadcast chat cannot preserve old messages for migration. |
| Inquiry operations | A seller can now open an inbox and reply, but there are no email/push alerts, unread state, report/block controls, or retention policy. | Choose notification channels and consent, response expectations, anti-spam limits, abuse escalation, and message deletion/retention rules before launch. |
| Sender identity | Owners now see the seeker's Clerk display name in inquiries, with an account-ID fallback. Display names are chosen by users and are not verified legal identities. | Decide whether verified identity, profile details, or contact information should be shared with owners, and get consent before exposing additional personal data. |
| Rent versus sale | The form supports both, while the home page speaks mainly about renting and a rent-to-own journey. | Decide whether rent-to-own is an actual offering; define contract, savings, financing, eligibility, and legal terms before marketing it. |
| Legal and privacy | No privacy, terms, cookie, or data retention pages are linked from the footer. | Publish jurisdiction-specific terms, privacy notice, consent and deletion process. |
| Contact operations | The contact form sends through EmailJS, with no visible abuse controls or support workflow. | Define spam protection, inbox ownership, escalation, response targets, and retention. |
| Revenue model | Sale offers show an illustrative 1% seller success fee; no live fee collection exists. | Validate price with partner costs and a pilot before publishing binding terms. |
| Map privacy | Owners now select a pin and GPS can use their current device position. Public listing maps show this pin. | Decide whether public maps show an exact point or a deliberately approximate area, and explain that choice before submission. |
| Listing completeness | A photo and map pin are now required, but listing facts remain limited. | Define minimum title and description length, property category, rent period, deposit, utilities, furnishing, amenities, and floor information. |
| Fraud and media rights | New sale listings require review and can be reported; rentals still publish immediately and image rights are not checked. | Define photo rights, duplicate detection, prohibited content, and rental moderation. |
| Owner contact privacy | The migration moves sale phone numbers into an owner-only table; rental phone remains on the public property record. | Verify the migration, decide rental contact policy, and audit all APIs for contact leakage. |
| Auth integration | The app still requests Clerk's legacy `supabase` JWT template. | Plan migration to Supabase's supported Clerk third-party auth integration, then update project JWT settings and RLS together. |
| Service area | Egypt is the selected launch market, but GPS and manual map pins can point elsewhere. | Enforce Egypt-only coordinates and address validation for new sale listings. |

## Next product improvements

- Add a clear property facts schema: currency, area unit, furnishing, amenities, ownership type, floor, and listing status.
- Support multiple photos with ordering, captions, upload constraints, and a dependable fallback.
- Define a cleanup policy for photos removed from edited or deleted listings, including older images saved at the bucket root. New uploads now use an owner-scoped folder and unsuccessful submissions remove their newly uploaded files.
- Extend the new sale review state to rentals only after the rental moderation policy is decided.
- Migrate latitude and longitude from varchar to numeric with range constraints after checking legacy data; the form now writes validated coordinates only.
- Give owners an inquiry dashboard showing message status and listing performance.
- Add saved searches and alerts only after notification preferences and consent are defined.
- Create measurable funnels for search, property view, inquiry, and listing completion; define success separately for seekers and owners.
- Audit Arabic content end to end. The locale switch currently changes only parts of the interface, and the contact form rejects Arabic letters.

## Content and proof needed

- Confirm the public business name, service area, support email, and support hours.
- Replace placeholder contact details and any unverified service claims with approved copy.
- Collect permissioned customer stories before adding testimonials or performance statistics.
