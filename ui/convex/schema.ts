import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
   pendingMoves: defineTable({
    matchId: v.number(),
    roundNumber: v.number(),
    player: v.string(),
    role: v.union(v.literal("challenger"), v.literal("conman")),
    commitment: v.string(),
    signature: v.string(),
    createdAt: v.number(),
  }).index("by_match_round", ["matchId", "roundNumber"]),

  pendingReveals: defineTable({
    matchId: v.number(),
    roundNumber: v.number(),
    player: v.string(),
    role: v.union(v.literal("challenger"), v.literal("conman")),
    choice: v.number(),
    nonce: v.string(),
    createdAt: v.number(),
  }).index("by_match_round", ["matchId", "roundNumber"]),
});