import { Loan, Profile, User } from "../../models";
import { LeadStage, UserRole } from "../../types/enums";

export interface Lead {
  id: string;
  name: string;
  email: string;
  registeredAt: Date;
  stage: LeadStage;
  eligibilityPassed: boolean;
  hasSalarySlip: boolean;
  monthlySalary: number | null;
  employmentMode: string | null;
}

export interface LeadSummary {
  totalBorrowers: number;
  registered: number;
  detailsSubmitted: number;
  documentsUploaded: number;
  converted: number;
}

/**
 * Borrowers who have registered but not yet submitted an application, grouped
 * by how far through the process they stopped.
 *
 * The stage is what makes this useful rather than a list of names: someone who
 * signed up and did nothing needs a different conversation from someone who
 * uploaded every document and then hesitated.
 */
export async function listLeads(): Promise<{ leads: Lead[]; summary: LeadSummary }> {
  const borrowers = await User.find({ role: UserRole.BORROWER, isActive: true }).sort({
    createdAt: -1,
  });

  const borrowerIds = borrowers.map((borrower) => borrower._id);

  // Three queries rather than one per borrower. With a lead list of any size,
  // querying inside the loop would multiply round trips by the row count.
  const [profiles, loans] = await Promise.all([
    Profile.find({ user: { $in: borrowerIds } }),
    Loan.find({ borrower: { $in: borrowerIds } }).select("borrower"),
  ]);

  const profileByUser = new Map(profiles.map((profile) => [profile.user.toString(), profile]));
  const borrowersWithLoans = new Set(loans.map((loan) => loan.borrower.toString()));

  const leads: Lead[] = [];
  let converted = 0;

  for (const borrower of borrowers) {
    const id = borrower._id.toString();

    // Anyone who has applied is no longer a lead — they belong to the sanction
    // queue from that point on.
    if (borrowersWithLoans.has(id)) {
      converted += 1;
      continue;
    }

    const profile = profileByUser.get(id);

    let stage: LeadStage = LeadStage.REGISTERED;
    if (profile?.salarySlip) {
      stage = LeadStage.DOCUMENTS_UPLOADED;
    } else if (profile) {
      stage = LeadStage.DETAILS_SUBMITTED;
    }

    leads.push({
      id,
      name: borrower.name,
      email: borrower.email,
      registeredAt: borrower.createdAt,
      stage,
      eligibilityPassed: profile?.bre.status === "PASSED",
      hasSalarySlip: Boolean(profile?.salarySlip),
      monthlySalary: profile?.monthlySalary ?? null,
      employmentMode: profile?.employmentMode ?? null,
    });
  }

  return {
    leads,
    summary: {
      totalBorrowers: borrowers.length,
      registered: leads.filter((lead) => lead.stage === LeadStage.REGISTERED).length,
      detailsSubmitted: leads.filter((lead) => lead.stage === LeadStage.DETAILS_SUBMITTED).length,
      documentsUploaded: leads.filter((lead) => lead.stage === LeadStage.DOCUMENTS_UPLOADED).length,
      converted,
    },
  };
}
