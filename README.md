# Toss Away Junk Removal — Website

Redesigned marketing site for **Toss Away Junk Removal**, a junk hauling and cleanout
service in Greater Salem, Oregon.

- Phone: (503) 428-4945
- Email: tossawayjunkremoval@gmail.com
- Service area: Salem, Keizer, Silverton, Woodburn, Dallas, Independence, Monmouth,
  McMinnville, Albany, Corvallis and surrounding communities

## Stack

Vanilla HTML, CSS and JavaScript — no build step, no dependencies. Open `index.html`
or serve the directory statically.

```
index.html           Home — hero, process, services, proof, areas, quote form
services.html        All six services in detail
service-areas.html   Coverage across the Mid-Willamette Valley
about.html           Company story, values, reviews
contact.html         Contact details, booking form, updates signup
assets/css/styles.css  Design system + all page styles
assets/js/main.js      Nav, scroll reveals, counters, form handling
assets/favicon.svg     Favicon
robots.txt, sitemap.xml
```

## Forms

All three forms (Quote request, Booking request, Newsletter) POST to the LeadrVision
endpoint `https://vision.leadrai.com/api/forms/7c1f8e2c4785535f315d31cdf34aaa7a`.

- They work without JavaScript via a plain `method="POST"` submit; the visitor returns
  to the same page with `?submitted=1` and sees the confirmation message.
- With JavaScript they submit via `fetch()` to the same URL as JSON and show the same
  confirmation inline.
- Each form carries a `_form` name, a `_page` field stamped with `window.location.href`,
  and a hidden `_gotcha` honeypot. No file uploads.

## Notes

- Photography is the business's own imagery (logo and service truck) served from the
  original domain.
- Responsive from 360px up; sticky call/quote bar on mobile.
- `LocalBusiness` structured data, Open Graph and Twitter card meta included.
