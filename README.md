# LoanView — Loan Management System

A lending platform with two sides: a borrower portal for applying for loans, and
an internal operations dashboard where each team moves a loan through its
lifecycle under role-based access control.

## Live demo

| | |
| -------- | ---------------------------------------------------------------------------- |
| Frontend | **https://loan-view.vercel.app** |
| API      | https://loanview-api.onrender.com — health check at [`/api/health`](https://loanview-api.onrender.com/api/health) |

Sign in with any of the [demo accounts](#demo-accounts) below.

> The API is hosted on a free tier that suspends the service when idle. The
> first request after a quiet period takes up to a minute while it wakes; every
> request after that is normal speed.

## Stack

| Layer    | Technology                                 |
| -------- | ------------------------------------------ |
| Frontend | Next.js (App Router), TypeScript, Tailwind |
| Backend  | Node.js, Express, TypeScript               |
| Database | MongoDB with Mongoose                      |
| Auth     | JWT, bcrypt                                |

## Layout

```
client/   Next.js application — borrower portal and operations dashboard
server/   Express REST API — business rules, auth, loan lifecycle
```

## How a loan moves

A loan has one status at a time, and only certain moves are legal. The rule is
declared once on the server and enforced in the service layer, so an
out-of-order change is refused even if the request bypasses the interface.

```
APPLIED ──approve──> SANCTIONED ──disburse──> DISBURSED ──fully repaid──> CLOSED
   │
   └────reject─────> REJECTED
```

`REJECTED` and `CLOSED` are terminal. A borrower may hold only one loan in
`APPLIED`, `SANCTIONED` or `DISBURSED` at a time.

### Who does what

| Role           | Can see                    | Can do                                      |
| -------------- | -------------------------- | ------------------------------------------- |
| `borrower`     | their own loans only       | submit details, upload a salary slip, apply |
| `sales`        | Sales module               | track registered leads                      |
| `sanction`     | Sanction module            | approve or reject an application            |
| `disbursement` | Disbursement module        | release funds on a sanctioned loan          |
| `collection`   | Collection module          | record repayments, close a repaid loan      |
| `admin`        | all four dashboard modules | everything the executives can do            |

Access is checked on the server on every request. The frontend hides what a role
cannot use, but that is a convenience — the server is the boundary.

### Eligibility rules

An application is scored against four rules the moment the borrower submits
their details. All four are always evaluated, so someone who fails two is told
about both rather than fixing one and discovering the next.

- Age between 23 and 50
- Monthly salary of at least ₹25,000
- PAN in the format `ABCDE1234F`
- Not unemployed

### Loan terms

Amount ₹50,000 to ₹5,00,000, tenure 30 to 365 days, simple interest at a fixed
12% per annum:

```
interest = principal × 12/100 × tenureDays / 365
```

## Running it locally

You need Node.js 18.18 or newer and a MongoDB connection string — either a local
`mongod` or a free MongoDB Atlas cluster.

### 1. Backend

```bash
cd server
npm install
cp .env.example .env      # then fill in MONGODB_URI and JWT_SECRET
npm run seed              # creates one account per role
npm run dev               # http://localhost:5000
```

`JWT_SECRET` must be at least 32 characters. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Check it came up with `curl http://localhost:5000/api/health`.

### 2. Frontend

In a second terminal:

```bash
cd client
npm install
cp .env.example .env.local   # the default already points at localhost:5000
npm run dev                  # http://localhost:3000
```

### Seeding

```bash
npm run seed           # create or refresh the accounts, leave data alone
npm run seed:reset     # also clear all applications, loans and payments
```

`--reset` is opt-in rather than automatic, because a seed that silently destroys
data is one mistyped command away from erasing a demonstration.

## Demo accounts

Every account below shares the password **`Loanview@123`**.

| Email                       | Role           |
| --------------------------- | -------------- |
| `admin@loanview.com`        | `admin`        |
| `sales@loanview.com`        | `sales`        |
| `sanction@loanview.com`     | `sanction`     |
| `disbursement@loanview.com` | `disbursement` |
| `collection@loanview.com`   | `collection`   |
| `borrower@loanview.com`     | `borrower`     |

Two further borrower accounts, `rahul.mehta@example.com` and
`priya.nair@example.com`, are registered but have not applied, so the Sales
module has leads to show without anyone registering users by hand.

Set `SEED_PASSWORD` in the server environment to seed a deployment with
something other than the password published here.

### Trying the full lifecycle

1. Sign in as the borrower, submit your details, upload a salary slip, apply.
2. Sign in as sanction — the application is waiting. Approve it.
3. Sign in as disbursement and release the funds.
4. Sign in as collection and record a repayment. Paying the full outstanding
   balance closes the loan.

Signing in as `admin` walks all four steps without switching accounts.

## API

Base path `/api`. Every response is wrapped in the same envelope, so the
frontend has one shape to handle rather than one per endpoint:

```jsonc
{ "success": true,  "data": { /* ... */ }, "message": "optional" }
{ "success": false, "message": "what went wrong", "errors": { /* per field */ } }
```

Protected routes expect `Authorization: Bearer <token>`.

| Method  | Endpoint                             | Access         |
| ------- | ------------------------------------ | -------------- |
| `GET`   | `/health`                            | public         |
| `POST`  | `/auth/signup`                       | public         |
| `POST`  | `/auth/login`                        | public         |
| `GET`   | `/auth/me`                           | any signed-in  |
| `GET`   | `/borrower/profile`                  | borrower       |
| `POST`  | `/borrower/profile`                  | borrower       |
| `POST`  | `/borrower/salary-slip`              | borrower       |
| `GET`   | `/borrower/loans`                    | borrower       |
| `POST`  | `/borrower/loans`                    | borrower       |
| `GET`   | `/borrower/loans/:id`                | borrower       |
| `GET`   | `/files/:id`                         | owner or staff |
| `GET`   | `/sales/leads`                       | sales          |
| `GET`   | `/sanction/applications`             | sanction       |
| `GET`   | `/sanction/applications/:id`         | sanction       |
| `PATCH` | `/sanction/applications/:id/approve` | sanction       |
| `PATCH` | `/sanction/applications/:id/reject`  | sanction       |
| `GET`   | `/disbursement/loans`                | disbursement   |
| `GET`   | `/disbursement/loans/:id`            | disbursement   |
| `PATCH` | `/disbursement/loans/:id/disburse`   | disbursement   |
| `GET`   | `/collection/loans`                  | collection     |
| `GET`   | `/collection/loans/:id`              | collection     |
| `POST`  | `/collection/loans/:id/payments`     | collection     |

Every module route is open to `admin` as well as the role named.

## Notes on a few decisions

**Signup cannot choose a role.** Every account created through `/auth/signup` is
a borrower; staff accounts come from the seed script. A role sent in the request
body is ignored, because a field the client controls is not a permission.

**Passwords are never returned.** The hash is excluded at the schema level, so a
route that forgets to strip it still cannot leak it.

**Uploads are checked by content, not by name.** A file's leading bytes are
compared against the type it claims to be, since an extension is a claim about a
file rather than a fact about it.

**A rejected transition is refused by the service, not the route.** Both the
sanction screen and a direct API call go through the same check, so there is no
path that skips it.

**The token is kept in `localStorage` rather than a cookie.** The frontend and
the API are deployed on separate domains, where a cookie would depend on
third-party cookies being permitted — which browsers increasingly do not.
