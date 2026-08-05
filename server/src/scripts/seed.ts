import { connectDatabase, disconnectDatabase } from "../config/database";
import { FileAsset, Loan, Payment, Profile, User } from "../models";
import { hashPassword } from "../utils/password";
import { UserRole } from "../types/enums";
import { logger } from "../utils/logger";

/**
 * Creates one account per role so the system can be tested immediately after
 * setup, without registering six users by hand.
 *
 * Run with:
 *   npm run seed            create or refresh the accounts, leave data alone
 *   npm run seed -- --reset also clear all applications, loans and payments
 */

// Overridable so a deployed environment can seed with a different password
// than the one published in the documentation.
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "Loanview@123";

interface SeedAccount {
  name: string;
  email: string;
  role: UserRole;
  note: string;
}

const ACCOUNTS: SeedAccount[] = [
  {
    name: "Admin User",
    email: "admin@loanview.com",
    role: UserRole.ADMIN,
    note: "full access to every module",
  },
  {
    name: "Sales Executive",
    email: "sales@loanview.com",
    role: UserRole.SALES,
    note: "lead tracking only",
  },
  {
    name: "Sanction Executive",
    email: "sanction@loanview.com",
    role: UserRole.SANCTION,
    note: "approves or rejects applications",
  },
  {
    name: "Disbursement Executive",
    email: "disbursement@loanview.com",
    role: UserRole.DISBURSEMENT,
    note: "releases funds",
  },
  {
    name: "Collection Executive",
    email: "collection@loanview.com",
    role: UserRole.COLLECTION,
    note: "records repayments",
  },
  {
    name: "Demo Borrower",
    email: "borrower@loanview.com",
    role: UserRole.BORROWER,
    note: "applicant account",
  },
  // Extra applicants with no application yet, so the sales module has leads to
  // show without anyone having to register accounts by hand first.
  {
    name: "Rahul Mehta",
    email: "rahul.mehta@example.com",
    role: UserRole.BORROWER,
    note: "lead — registered, not yet applied",
  },
  {
    name: "Priya Nair",
    email: "priya.nair@example.com",
    role: UserRole.BORROWER,
    note: "lead — registered, not yet applied",
  },
];

const SEED_EMAILS = ACCOUNTS.map((account) => account.email);

/**
 * Wipes application data and any account this script did not create.
 *
 * Opt-in rather than automatic: a seed that silently destroys data is one
 * mistyped command away from erasing a demonstration that took time to set up.
 */
async function resetData(): Promise<void> {
  logger.warn("--reset supplied: clearing applications, loans, payments and uploads");

  const [payments, loans, profiles, files, users] = await Promise.all([
    Payment.deleteMany({}),
    Loan.deleteMany({}),
    Profile.deleteMany({}),
    FileAsset.deleteMany({}),
    User.deleteMany({ email: { $nin: SEED_EMAILS } }),
  ]);

  logger.info(
    `Removed ${payments.deletedCount} payments, ${loans.deletedCount} loans, ` +
      `${profiles.deletedCount} profiles, ${files.deletedCount} files, ` +
      `${users.deletedCount} non-seed accounts`,
  );
}

async function upsertAccount(account: SeedAccount): Promise<"created" | "updated"> {
  const alreadyExists = await User.exists({ email: account.email });

  // The password is re-hashed and rewritten on every run, so the documented
  // credentials always work even if someone changed a password while testing.
  const passwordHash = await hashPassword(SEED_PASSWORD);

  await User.findOneAndUpdate(
    { email: account.email },
    {
      $set: {
        name: account.name,
        role: account.role,
        passwordHash,
        isActive: true,
      },
    },
    { upsert: true, setDefaultsOnInsert: true },
  );

  return alreadyExists ? "updated" : "created";
}

function printCredentials(): void {
  const emailWidth = Math.max(...ACCOUNTS.map((a) => a.email.length));

  console.log("\n  Seed accounts — all share the same password\n");
  console.log(`  ${"EMAIL".padEnd(emailWidth)}  ${"ROLE".padEnd(14)}  NOTE`);
  console.log(`  ${"-".repeat(emailWidth)}  ${"-".repeat(14)}  ${"-".repeat(40)}`);

  for (const account of ACCOUNTS) {
    console.log(`  ${account.email.padEnd(emailWidth)}  ${account.role.padEnd(14)}  ${account.note}`);
  }

  console.log(`\n  Password for every account: ${SEED_PASSWORD}\n`);
}

async function main(): Promise<void> {
  const shouldReset = process.argv.includes("--reset");

  await connectDatabase();

  if (shouldReset) {
    await resetData();
  }

  let created = 0;
  let updated = 0;

  for (const account of ACCOUNTS) {
    const outcome = await upsertAccount(account);
    if (outcome === "created") created += 1;
    else updated += 1;
  }

  logger.info(`Seed complete — ${created} account(s) created, ${updated} refreshed`);
  printCredentials();

  await disconnectDatabase();
}

main().catch((error: unknown) => {
  logger.error("Seed failed", error);
  process.exit(1);
});
