# TinyHouse

TinyHouse is a full-stack home-rental app: search listings, host a place, and book a stay. Same idea as Airbnb, scoped to those three things.

It began as a build-along of the newline TinyHouse course (React, TypeScript, and GraphQL) and was extended from there. The seed listings, the `@tinyhouse.com` users, and the city photos (Toronto, Dubai, London, Cancún, and the others) come from that course.

The client is React, TypeScript, and Vite, with React Router and Apollo Client. Styling is Tailwind. The server is Node and Express with Apollo Server and GraphQL. Data sits in MongoDB. Sign-in is Google OAuth. Hosts are paid through Stripe Connect. Listing images go to Cloudinary when those credentials are set; otherwise the data url is stored as-is.

## What it does

- Home page with a location search, shortcuts for Toronto, Dubai, Los Angeles, London, San Francisco, and Cancún, and the four highest-priced listings.
- A listings page that filters by location, sorts by price, and paginates. With `G_GEOCODE_KEY` set, the server geocodes the query and matches country, region, and city. With no key, or no geocoding match, it does a case-insensitive text match on city, region, country, and address.
- A listing page with the details, a date picker, and card checkout. Nights already reserved are blocked. You cannot book your own listing. A stay can be at most 90 nights, and the check-out can be at most a year ahead. Only that listing's host can see its bookings.
- A host form. You have to be signed in and connected to Stripe. The image must be a JPEG or PNG data url under 1MB, and the file bytes have to match that type. The address is geocoded when a key is set; otherwise the server reads city, region, and country off a comma-separated address.
- A profile page. Listings on a profile are public. Bookings and income are returned only for the signed-in user looking at their own profile. From there you can connect or disconnect Stripe.
- Google sign-in. The redirect is `{PUBLIC_URL}/login`. The server sets a signed `viewer` cookie (`httpOnly`, `SameSite=Strict`, one year). When `NODE_ENV` is `development` the cookie is not `Secure`, so localhost over http works. A random CSRF token is stored on the user, returned to the browser, kept in `sessionStorage`, and sent as `X-CSRF-TOKEN`. Anything that needs a logged-in user checks the signed cookie and that token together. Logout clears the cookie and the Apollo cache.
- Booking writes a pending booking and reserves the nights in one update, so two guests cannot take the same dates. The charge is a Stripe destination charge in USD to the host's connected account, with a 5% application fee. The idempotency key is `booking-<booking id>`, and Stripe's client retries the network twice with that same key. If the card is declined or the payment does not succeed, the nights are released and the pending booking is removed. If the server cannot tell whether the charge went through, the pending booking and the nights stay. If the charge succeeded and a later write fails, the payment is refunded (transfer and application fee included) and the writes that did land are undone.
- Stripe Connect `state` is signed with `SECRET`, expires after 15 minutes, and is checked against the signed-in user. The connect URL comes from the `stripeAuthUrl` query. Stripe should send the browser back to `{PUBLIC_URL}/stripe`, which reads `code` and `state`. Disconnecting deauthorizes the account and errors if `S_CLIENT_ID` is missing.

Prices are stored in US cents.

## Project structure

- `client/` is the React app.
- `server/` is the API. GraphQL is mounted at `/api`.
- `server/temp/seed.ts` inserts the sample listings and users into the `main` database.
- `server/temp/clear.ts` drops the `listings`, `users`, and `bookings` collections.

## Local setup

You need Node.js, npm, and MongoDB. Google OAuth is required for sign-in. Stripe is required to host or pay. Geocoding and Cloudinary are optional.

There is no hosted demo, and there are no tests.

### Server

```sh
cd server
cp .env.example .env
npm install
npm start
```

`npm start` runs `nodemon src/index.ts`. With `PORT=9000` the API is at `http://localhost:9000/api`.

`npm run build` compiles TypeScript into `server/build`. The start script runs the TypeScript source, not that output.

`npm run seed` loads the sample data. The documents use fixed ids, so seeding again fails if they are already there. `npm run clear` drops the three collections. Run both from `server/` so they pick up `server/.env`.

Variables in `server/.env.example`:

- `PORT` — port the API listens on. The example is 9000.
- `NODE_ENV` — set to `development` so the viewer cookie works on http://localhost.
- `PUBLIC_URL` — the client origin. It is allowed by CORS, and Google OAuth redirects to `{PUBLIC_URL}/login`. The example is `http://localhost:5173`.
- `SECRET` — used to sign the viewer cookie and the Stripe Connect state.
- `DB_URL` — a MongoDB connection string. Leave it empty to use the Atlas fields below.
- `DB_USER` — Atlas username, used when `DB_URL` is empty.
- `DB_PASSWORD` — Atlas password, used when `DB_URL` is empty.
- `DB_CLUSTER` — Atlas cluster name, used when `DB_URL` is empty. The host is `{DB_CLUSTER}.mongodb.net`.
- `G_CLIENT_ID` — Google OAuth client id.
- `G_CLIENT_SECRET` — Google OAuth client secret.
- `G_GEOCODE_KEY` — Google Geocoding API key. Optional. Without it, location search uses a text match.
- `S_SECRET_KEY` — Stripe secret key.
- `S_CLIENT_ID` — Stripe Connect client id. Required to connect or disconnect a host.
- `CLOUDINARY_NAME` — Cloudinary cloud name. Optional.
- `CLOUDINARY_KEY` — Cloudinary API key. Optional.
- `CLOUDINARY_SECRET` — Cloudinary API secret. Optional.

In Google Cloud, the authorized redirect URI is `{PUBLIC_URL}/login`. In the Stripe dashboard, set the Connect redirect to `{PUBLIC_URL}/stripe`.

### Client

```sh
cd client
cp .env.example .env
npm install
npm run dev
```

`npm run dev` starts Vite on port 5173.

Variables in `client/.env.example`:

- `VITE_GRAPHQL_ENDPOINT` — the GraphQL URL the browser calls. Locally that is `http://localhost:9000/api`.
- `VITE_S_PUBLISHABLE_KEY` — Stripe publishable key for the card form.

`npm run build` typechecks the client and produces a production build. `npm run compile` regenerates the files in `client/src/__generated__` from the GraphQL operations. If `VITE_GRAPHQL_ENDPOINT` is unset, codegen reads the schema from `server/src/graphql/typeDefs.ts`.
