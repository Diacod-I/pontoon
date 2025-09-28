import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createMatch = mutation({
  args: {
    matchId: v.number(),
    userAddress: v.string(),
    betAmount: v.string(),
    timestamp: v.number(),
    txHash: v.string(),
  },
  handler: async (ctx, args) => {
    const matchId = await ctx.db.insert("matches", {
      matchId: args.matchId,
      userAddress: args.userAddress,
      betAmount: args.betAmount,
      timestamp: args.timestamp,
      txHash: args.txHash,
      status: "ACTIVE",
      currentRound: 1,
      createdAt: Date.now(),
    });

    return matchId;
  },
});

export const getMatchById = query({
  args: { matchId: v.number() },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query("matches")
      .withIndex("by_matchId", (q) => q.eq("matchId", args.matchId))
      .first();

    if (!match) return null;

    // Also get rounds for this match
    const rounds = await ctx.db
      .query("rounds")
      .withIndex("by_matchId", (q) => q.eq("matchId", args.matchId))
      .collect();

    return {
      ...match,
      rounds: rounds.sort((a, b) => a.roundNumber - b.roundNumber),
    };
  },
});

export const updateMatchStatus = mutation({
  args: {
    matchId: v.number(),
    status: v.string(),
    currentRound: v.optional(v.number()),
    finalReward: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query("matches")
      .withIndex("by_matchId", (q) => q.eq("matchId", args.matchId))
      .first();

    if (!match) throw new Error("Match not found");

    await ctx.db.patch(match._id, {
      status: args.status,
      currentRound: args.currentRound,
      finalReward: args.finalReward,
    });

    return match._id;
  },
});

export const getUserMatches = query({
  args: { userAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matches")
      .withIndex("by_userAddress", (q) => q.eq("userAddress", args.userAddress))
      .order("desc")
      .collect();
  },
});

export const getMatchesByTxHash = query({
  args: { txHash: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matches")
      .withIndex("by_txHash", (q) => q.eq("txHash", args.txHash))
      .collect();
  },
});
