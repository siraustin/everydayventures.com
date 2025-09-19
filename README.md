# Everyday Ventures LLC

Static marketing site for Everyday Ventures LLC. Built with semantic HTML, modern CSS, and a small amount of JavaScript for navigation and form handling.

## Getting started

Open `index.html` in your browser to view the site.

## Contact form email delivery

The project inquiry form posts to a Cloudflare Pages Function at `/api/contact`. The function sends the submission details by email through MailChannels (the provider bundled with Cloudflare Workers) and falls back to a thank-you page when JavaScript is disabled.

### Required environment variables

Configure the following environment variables for the Cloudflare Pages project:

| Variable | Purpose |
| --- | --- |
| `CONTACT_RECIPIENT_EMAIL` | Destination inbox for new inquiries (e.g. `hello@everydayventures.com`). |
| `CONTACT_FROM_EMAIL` | Sender address for outgoing messages. Use an address on a domain authorized for MailChannels (e.g. `website@everydayventures.com`). |
| `CONTACT_DOMAIN` | Domain used to build the fallback `no-reply@` sender if `CONTACT_FROM_EMAIL` is not set. |
| `CONTACT_BCC_EMAIL` (optional) | Additional recipient that should be blind-copied on each inquiry. |

> **Note**: If you rely on Cloudflare Email Routing, ensure the sender address you choose is allowed to send outbound mail (for example, by creating an address and SPF/DKIM records that align with MailChannels' requirements).

### Local development

To exercise the function locally, install the [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) and run:

```bash
wrangler pages dev
```

Wrangler will read environment variables from your shell and proxy the `/api/contact` endpoint alongside the static assets.
