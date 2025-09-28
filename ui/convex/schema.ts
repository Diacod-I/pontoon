import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  matches: defineTable({
    matchId: v.number(),
    userAddress: v.string(),
    betAmount: v.string(),
    timestamp: v.number(),
    txHash: v.string(),
    status: v.string(),
    currentRound: v.number(),
    totalRounds: v.optional(v.number()),
    finalReward: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_matchId", ["matchId"])
    .index("by_userAddress", ["userAddress"])
    .index("by_txHash", ["txHash"]),

  rounds: defineTable({
    matchId: v.number(),
    roundNumber: v.number(),
    playerChoice: v.number(),
    winningNumber: v.number(),
    won: v.boolean(),
    timestamp: v.number(),
    txHash: v.string(),
  })
    .index("by_matchId", ["matchId"])
    .index("by_match_and_round", ["matchId", "roundNumber"]),
});
