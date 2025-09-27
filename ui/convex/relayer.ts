import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitMove = mutation({
  args: {
    matchId: v.number(),
    roundNumber: v.number(),
    player: v.string(),
    role: v.union(v.literal("challenger"), v.literal("conman")),
    commitment: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pendingMoves")
      .withIndex("by_match_round", (q) =>
        q.eq("matchId", args.matchId).eq("roundNumber", args.roundNumber)
      )
      .filter((q) => q.eq(q.field("player"), args.player))
      .first();

    if (existing) {
      throw new Error("Move already submitted for this round");
    }

    await ctx.db.insert("pendingMoves", {
      ...args,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const submitReveal = mutation({
  args: {
    matchId: v.number(),
    roundNumber: v.number(),
    player: v.string(),
    role: v.union(v.literal("challenger"), v.literal("conman")),
    choice: v.number(),
    nonce: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pendingReveals")
      .withIndex("by_match_round", (q) =>
        q.eq("matchId", args.matchId).eq("roundNumber", args.roundNumber)
      )
      .filter((q) => q.eq(q.field("player"), args.player))
      .first();

    if (existing) {
      throw new Error("Reveal already submitted for this round");
    }

    await ctx.db.insert("pendingReveals", {
      ...args,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const getPendingMoves = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("pendingMoves")
      .collect();
  },
});

export const getPendingReveals = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("pendingReveals")
      .collect();
  },
});

export const getPendingRevealsByMatch = query({
  args: {
    matchId: v.number(),
    roundNumber: v.number(),
  },
  handler: async (ctx, { matchId, roundNumber }) => {
    return await ctx.db
      .query("pendingReveals")
      .withIndex("by_match_round", (q) =>
        q.eq("matchId", matchId).eq("roundNumber", roundNumber)
      )
      .collect();
  },
});

export const clearPendingMoves = mutation({
  args: {
    matchId: v.number(),
    roundNumber: v.number(),
  },
  handler: async (ctx, { matchId, roundNumber }) => {
    const moves = await ctx.db
      .query("pendingMoves")
      .withIndex("by_match_round", (q) =>
        q.eq("matchId", matchId).eq("roundNumber", roundNumber)
      )
      .collect();

    for (const move of moves) {
      await ctx.db.delete(move._id);
    }

    console.log(`Cleared ${moves.length} pending moves for match ${matchId} round ${roundNumber}`);
  },
});

export const clearPendingReveals = mutation({
  args: {
    matchId: v.number(),
    roundNumber: v.number(),
  },
  handler: async (ctx, { matchId, roundNumber }) => {
    const reveals = await ctx.db
      .query("pendingReveals")
      .withIndex("by_match_round", (q) =>
        q.eq("matchId", matchId).eq("roundNumber", roundNumber)
      )
      .collect();

    for (const reveal of reveals) {
      await ctx.db.delete(reveal._id);
    }

    console.log(`Cleared ${reveals.length} pending reveals for match ${matchId} round ${roundNumber}`);
  },
});

export const clearAllPendingForMatch = mutation({
  args: {
    matchId: v.number(),
    roundNumber: v.number(),
  },
  handler: async (ctx, { matchId, roundNumber }) => {
    const moves = await ctx.db
      .query("pendingMoves")
      .withIndex("by_match_round", (q) =>
        q.eq("matchId", matchId).eq("roundNumber", roundNumber)
      )
      .collect();

    for (const move of moves) {
      await ctx.db.delete(move._id);
    }

    const reveals = await ctx.db
      .query("pendingReveals")
      .withIndex("by_match_round", (q) =>
        q.eq("matchId", matchId).eq("roundNumber", roundNumber)
      )
      .collect();

    for (const reveal of reveals) {
      await ctx.db.delete(reveal._id);
    }
  },
});