import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  matches: defineTable({
    matchId: v.number(),
    player1: v.string(),
    betAmount: v.string(),
    createdAt: v.number(),
    status: v.string(),
    currentRound: v.number(),
  }),
  rounds: defineTable({
    matchId: v.number(),
    roundNumber: v.number(),
    playerChoice: v.number(),
    bombNumber: v.number(),
    survived: v.boolean(),
    startTime: v.number(),
  }),
});
