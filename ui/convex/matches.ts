import { mutation } from "./_generated/server";

export const create = mutation(({ db }, match) => {
  return db.insert("matches", match);
});

export const updateStatus = mutation(({ db }, { matchId, status }) => {
  const match = db
    .query("matches")
    .filter((q) => q.eq(q.field("matchId"), matchId))
    .first();
  if (!match) throw new Error("Match not found");
  return db.patch(match._id, { status });
});
