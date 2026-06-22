# Resume / Profile Page (PHP)

Your part of the group cloud project: a single-page profile with Personal
Information, Skills, Education, and a working Contact Form.

## Files

- `index.php` — the whole page. Display markup AND the contact form's
  server-side handling live in this one file, to keep things simple.
- `assets/style.css` — all styling.
- `assets/script.js` — small enhancement script (active nav highlight on
  scroll + a fade-in reveal). The page still works fully if JS is disabled.
- `messages.log` — created automatically the first time someone submits the
  contact form. Each submission is appended as a line. (Not included here —
  it'll appear after your first real test submission.)

## 1. Edit your real content

Open `index.php` and edit the three arrays near the top of the file:

- `$profile` — name, title, tagline, bio, email, phone, location, GitHub,
  LinkedIn.
- `$skills` — grouped skills with a 0–100 proficiency number each.
- `$soft_skills` — plain list of strengths shown as tags (no numbers).
- `$education` — one array per qualification (degree, institution, period,
  description).

You don't need to touch the HTML or CSS to update content — everything
below those arrays just loops over them.

## 2. Run it locally to test

You need an actual PHP runtime — opening `index.php` by double-clicking
won't work, your browser will just show raw code.

**Option A — XAMPP/WAMP/MAMP** (what most labs use): put this folder inside
`htdocs` (XAMPP) or the equivalent web root, start Apache, then visit
`http://localhost/resume-profile-page/`.

**Option B — PHP's built-in server** (no install needed beyond PHP itself):

```
cd resume-profile-page
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

Test the contact form with both an empty submission (you should see
validation errors) and a filled-in one (you should see a success message,
and a new line appended to `messages.log`).

## 3. About deploying this to Netlify or Vercel

This is the part to flag with whoever on your team is doing the deployment
(Member 4). Netlify and Vercel are built for **static** sites and
JavaScript serverless functions — neither runs `.php` files natively, so
uploading this folder as-is to either platform will not work; it'll just
serve the raw PHP source instead of running it.

A few ways to handle that, roughly in order of how little they change your
work:

1. **Demo locally for Week 7.** Run it via XAMPP or `php -S` on your laptop
   during the live demonstration, and still push the code to GitHub for the
   repo requirement. Simple, no rewrite needed, just means this piece isn't
   reachable at the team's public cloud URL.
2. **Host the PHP part separately on a free PHP-friendly host** (e.g.
   InfinityFree, 000webhost, or a Render/Railway PHP service) and link to it
   from the main Netlify/Vercel site. More moving parts, but everything
   stays "live."
3. **Rewrite the contact form to be static-friendly** if the team decides
   the whole app must live on Netlify/Vercel: keep the Personal Info,
   Skills, and Education sections as plain HTML (just render the PHP once
   and save the output as `.html`), and swap the contact form's backend for
   a third-party static-form service (e.g. Formspree, Web3Forms) instead of
   PHP. This is the most rewriting but the most "actually deployed."

Worth raising with your group/lecturer before Week 7 so there are no
surprises about whether this page needs to be live at the shared URL or
just demoed locally.
