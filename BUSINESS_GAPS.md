# Business decisions and gaps

The marketplace serves **home seekers and property owners equally**. The current product lets people browse, filter, save, and view properties; signed-in owners can add and manage listings. The items below need business decisions or operational work before they should be promised in the interface.

## Decide before launch

| Area | Current gap | Decision needed |
| --- | --- | --- |
| Market and currency | Prices display with a dollar sign while the contact form assumes Egyptian phone numbers. | Define supported countries, currency per property, area units, and price format. |
| Listing trust | Owners can publish properties; no visible verification or moderation process is described. | Define ownership checks, review rules, reporting, takedown, and repeat offender handling. |
| Availability | Owners can toggle availability, but listing freshness is unclear. | Define expiry, renewal, and stale listing policies. |
| Buyer or renter inquiry | WhatsApp and chat exist, but response expectations and lead routing are not defined. | Set contact options, notification ownership, response targets, and consent for sharing contact details. |
| Inquiry verification | The private conversation migration is deployed and signed-in reads now load, but message delivery between two separate accounts has not been exercised. | Test seeker send, seller inbox and reply, refresh persistence, and cross-user access with two accounts. The former broadcast chat cannot preserve old messages for migration. |
| Inquiry operations | A seller can now open an inbox and reply, but there are no email/push alerts, unread state, report/block controls, or retention policy. | Choose notification channels and consent, response expectations, anti-spam limits, abuse escalation, and message deletion/retention rules before launch. |
| Sender identity | Owners now see the seeker's Clerk display name in inquiries, with an account-ID fallback. Display names are chosen by users and are not verified legal identities. | Decide whether verified identity, profile details, or contact information should be shared with owners, and get consent before exposing additional personal data. |
| Rent versus sale | The form supports both, while the home page speaks mainly about renting and a rent-to-own journey. | Decide whether rent-to-own is an actual offering; define contract, savings, financing, eligibility, and legal terms before marketing it. |
| Legal and privacy | No privacy, terms, cookie, or data retention pages are linked from the footer. | Publish jurisdiction-specific terms, privacy notice, consent and deletion process. |
| Contact operations | The contact form sends through EmailJS, with no visible abuse controls or support workflow. | Define spam protection, inbox ownership, escalation, response targets, and retention. |
| Revenue model | No fee or commission model is visible. | Decide listing fees, featured placement, commissions, refunds, and how disclosures appear to both sides. |
| Map privacy | Owners now select a pin and GPS can use their current device position. Public listing maps show this pin. | Decide whether public maps show an exact point or a deliberately approximate area, and explain that choice before submission. |
| Listing completeness | A photo and map pin are now required, but listing facts remain limited. | Define minimum title and description length, property category, rent period, deposit, utilities, furnishing, amenities, and floor information. |
| Fraud and media rights | Owners can upload photos and publish immediately. | Add confirmation of authority to list, image rights, duplicate detection, prohibited content rules, and a report flow. |
| Owner contact privacy | Owner phone is required and exposed on listings. | Decide whether phone numbers should be public, revealed after sign-in, or replaced by an inquiry relay. |
| Auth integration | The app still requests Clerk's legacy `supabase` JWT template. | Plan migration to Supabase's supported Clerk third-party auth integration, then update project JWT settings and RLS together. |
| Service area | The form fixes the country to Egypt, but GPS and manual map pins can point anywhere. | Confirm the service area and whether listings outside Egypt should be blocked or supported with country and phone fields. |

## Next product improvements

- Add a clear property facts schema: currency, area unit, furnishing, amenities, ownership type, floor, and listing status.
- Support multiple photos with ordering, captions, upload constraints, and a dependable fallback.
- Define a cleanup policy for photos removed from edited or deleted listings, including older images saved at the bucket root. New uploads now use an owner-scoped folder and unsuccessful submissions remove their newly uploaded files.
- Add a draft and review state before publication once the moderation policy is decided. The current database only has `is_available`.
- Migrate latitude and longitude from varchar to numeric with range constraints after checking legacy data; the form now writes validated coordinates only.
- Give owners an inquiry dashboard showing message status and listing performance.
- Add saved searches and alerts only after notification preferences and consent are defined.
- Create measurable funnels for search, property view, inquiry, and listing completion; define success separately for seekers and owners.
- Audit Arabic content end to end. The locale switch currently changes only parts of the interface, and the contact form rejects Arabic letters.

## Content and proof needed

- Confirm the public business name, service area, support email, and support hours.
- Replace placeholder contact details and any unverified service claims with approved copy.
- Collect permissioned customer stories before adding testimonials or performance statistics.
