import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createRound = mutation({
  args: {
    matchId: v.number(),
    roundNumber: v.number(),
    playerChoice: v.number(),
    winningNumber: v.number(),
    won: v.boolean(),
    timestamp: v.number(),
    txHash: v.string(),
  },
  handler: async (ctx, args) => {
    const roundId = await ctx.db.insert("rounds", {
      matchId: args.matchId,
      roundNumber: args.roundNumber,
      playerChoice: args.playerChoice,
      winningNumber: args.winningNumber,
      won: args.won,
      timestamp: args.timestamp,
      txHash: args.txHash,
    });

    return roundId;
  },
});

export const getRoundsByMatch = query({
  args: { matchId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rounds")
      .withIndex("by_matchId", (q) => q.eq("matchId", args.matchId))
      .order("asc")
      .collect();
  },
});
