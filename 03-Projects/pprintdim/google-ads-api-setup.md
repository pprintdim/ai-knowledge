> [!note] Імпортовано з `/Applications/MAMP/htdocs/pprintdim/docs/google-ads-api-setup.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 0. Оригінал: untracked, видалений.

# Google Ads API and Conversion Setup

Local checklist for configuring Google Ads/GA4 conversions for pprintdim.com.
Do not commit real secrets into this file.

## Current Site Conversion Flow

- Real form submissions redirect to a one-time success URL:
  `https://pprintdim.com/contact/success/{token}`
- The token URL is valid for one first load only. Reloading or direct access returns `404`.
- The success page is marked `noindex, nofollow`.
- The site fires:
  - GA4 event: `generate_lead`
  - Google Ads conversion event: `conversion`
  - Ads send_to currently configured as: `AW-18283243270/xy6NCKK9s8ccEIbOkI5E`
- Conversion payload includes:
  - `event_category`
  - `source`
  - `service_name`
  - `estimate`
  - `currency`
  - `value`
  - `submission_id`

## Google Ads URL Goal

If configuring a URL-based website conversion in Google Ads or GTM, use:

```text
Page URL contains /contact/success/
```

Do not use an exact full success URL, because every lead receives a unique token.

Recommended settings:

- Category: Lead form submission
- Count: One
- Value: No value or fixed value, unless lead values should be imported later
- Include in account-level goals: Yes, if this is the main lead conversion

## Required API Credentials

To configure Google Ads via API, collect these values:

```yaml
developer_token: "..."
client_id: "..."
client_secret: "..."
refresh_token: "..."
customer_id: "1234567890"
login_customer_id: "1234567890"
```

Notes:

- `customer_id` is the Google Ads account ID without dashes.
- `login_customer_id` is the manager account ID without dashes.
- If there is no manager account, `login_customer_id` can usually match `customer_id` or be omitted depending on the API client.
- Never store real credentials in git.

## Where To Get Values

### Customer ID

Google Ads account header, shown like:

```text
123-456-7890
```

Store it without dashes:

```text
1234567890
```

### Developer Token

Google Ads manager account:

```text
Tools and settings -> Setup -> API Center
```

Important:

- API Center is available only for manager accounts.
- The developer token is required for Google Ads API calls.
- Google can grant limited access first. Production changes may require Basic or Standard access approval.

### OAuth Client

Google Cloud Console:

```text
APIs and Services -> Credentials -> OAuth client
```

Required values:

- `client_id`
- `client_secret`

The OAuth client must be able to request Google Ads API scope.

### Refresh Token

Generate via OAuth flow for a Google user that has access to the Google Ads account.

Required scope:

```text
https://www.googleapis.com/auth/adwords
```

## Work To Perform Via API

When credentials are available:

1. Verify accessible Google Ads accounts.
2. Confirm the target `customer_id`.
3. List existing conversion actions.
4. Find the existing lead conversion matching:
   - Conversion ID: `18283243270`
   - Conversion label: `<REDACTED→secrets/ACCESS.md>`
   - Name/category related to lead form submission
5. If missing, create or guide creation of a website lead conversion action.
6. Confirm whether it is primary for goals.
7. Confirm count setting is `One`.
8. Confirm the site send_to value matches the selected conversion action.

## GA4 Setup

In GA4:

```text
Admin -> Events -> generate_lead -> Mark as key event
```

If `generate_lead` is not visible yet:

1. Submit a real test lead.
2. Open GA4 Realtime or DebugView.
3. Wait for the event to appear.
4. Mark it as a key event.

## GTM Notes

GTM container on site:

```text
GTM-T5GHM6HV
```

The site already sends GA4 and Ads conversion events directly on the success page.
Avoid duplicating the same Ads conversion in GTM unless the direct site conversion is disabled.

If GTM tracking is preferred later:

- Trigger type: Page View
- Trigger condition: `Page URL contains /contact/success/`
- Tag: Google Ads Conversion Tracking
- Conversion ID: `18283243270`
- Conversion Label: `<REDACTED→secrets/ACCESS.md>`

## Local Safety

- Keep real API credentials in a local ignored file only, for example:
  `storage/app/private/google-ads-api.local.yml`
- Do not commit credentials.
- Before making API mutations, first run read-only checks and print the target account name/id.

