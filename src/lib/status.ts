export const invoiceStatusLabel: Record<string, string> = {
  APPROVED: "Approved",
  DISPUTED: "Disputed",
  INELIGIBLE: "Ineligible",
};

export const offerStatusLabel: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PENDING: "Pending acceptance",
  ACCEPTED: "Accepted",
  REJECTED: "Declined",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

export const receiptStatusLabel: Record<string, string> = {
  INITIATED: "Initiated",
  UNCONFIRMED: "Unconfirmed",
  RECEIVED: "Received",
  DISPUTED: "Disputed",
  REVERSED: "Reversed",
};

export function toneFor(status: string): "neutral" | "good" | "warn" | "bad" | "accent" {
  switch (status) {
    case "APPROVED":
    case "ACCEPTED":
    case "RECEIVED":
    case "ACTIVE":
      return "good";
    case "SENT":
    case "PENDING":
    case "INITIATED":
    case "UNCONFIRMED":
    case "PILOT":
      return "accent";
    case "DRAFT":
    case "EXPIRED":
    case "INELIGIBLE":
      return "neutral";
    case "DISPUTED":
    case "REJECTED":
    case "REVERSED":
    case "CANCELLED":
      return "bad";
    default:
      return "warn";
  }
}
