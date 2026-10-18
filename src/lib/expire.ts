import { db } from "./db";

export async function expireStaleOffers() {
  await db.offer.updateMany({
    where: {
      status: { in: ["SENT", "PENDING"] },
      expiry: { lt: new Date() },
    },
    data: { status: "EXPIRED" },
  });
}
