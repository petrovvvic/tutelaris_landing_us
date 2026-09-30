# Visitor and conversion analytics

Both sites use existing GA4 measurement ID `G-K18Q80GHW0`. The old inline Cloudflare beacons were removed to avoid two separate reporting systems. Google loads only after explicit analytics consent. Old marketing preferences do not grant analytics consent.

## Account steps still required

The website integration is implemented; account access and production receipt have not been verified.

1. In the GA4 property owning this measurement ID, confirm the web stream belongs to Tutelaris and accepts both `tutelaris.de` and `tutelarisapp.com`.
2. Disable Enhanced Measurement for that stream. This implementation supplies its own page and interaction events, strips query strings/fragments, and avoids automatic outbound-link measurement that could include booking-prefill email parameters.
3. Mark `generate_lead` as a key event. Do not mark `booking_click` as a completed booking: it only measures opening the scheduling page.
4. Register event-scoped custom dimensions `site_language`, `site_domain`, `placement`, and `feature` if needed for reports. Use built-in Host name for domain comparisons.
5. Build an open funnel: `page_view` → `demo_open` → `demo_form_start` → `generate_lead`. Break down by Host name and Device category. Compare `booking_click` separately; watch `demo_submit_error` for failures.
6. Confirm both sites in Realtime after deployment and consent. Set the property retention period and access permissions as appropriate for the account.

## Events

- `page_view`: once per page after consent.
- `demo_open`: demo CTA or valid email shortcut.
- `demo_form_start`: first input in the demo form per page after consent.
- `generate_lead`: only after HubSpot returns success.
- `demo_submit_error`: failed submission, without error details or form contents.
- `booking_click`: scheduling-link click, without destination URL or email.
- `feature_view`: selected product tab.
- `scroll_depth`: each of 25%, 50%, 75%, 90% once per page.

The custom integration never reads form values for analytics payloads. Page query strings and fragments are excluded, including UTM parameters; campaign attribution is consequently limited. No events before consent are replayed. Withdrawal disables collection and clears accessible GA cookies; consent changes synchronize across tabs on the same origin.

Tests use mocked Google and HubSpot endpoints and do not create leads. They verify opt-in, decline, persistence, withdrawal, real form success/failure, event payloads, and mobile overflow. Live Google delivery still requires the account check above.
