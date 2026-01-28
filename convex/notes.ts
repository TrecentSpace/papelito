import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const noteValidator = v.object({
  id: v.string(),
  title: v.string(),
  emoji: v.optional(v.string()),
  favorite: v.optional(v.boolean()),
  blocks: v.array(
    v.object({
      id: v.string(),
      type: v.union(
        v.literal("paragraph"),
        v.literal("heading1"),
        v.literal("heading2"),
        v.literal("heading3"),
        v.literal("bulleted-list"),
        v.literal("numbered-list"),
        v.literal("todo")
      ),
      content: v.string(),
      checked: v.optional(v.boolean()),
    })
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
});

// Helper function to get user (for queries - read-only)
async function getCurrentUserId(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  if (!user) {
    throw new Error("User not found. Please refresh the app.");
  }

  return user._id;
}

// Helper function to get or create user (for mutations)
async function getCurrentUserOrCreate(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  if (user) {
    return user._id;
  }

  // Create new user if doesn't exist
  const userId = await ctx.db.insert("users", {
    tokenIdentifier: identity.tokenIdentifier,
    name: identity.name,
    email: identity.email,
    imageUrl: identity.pictureUrl,
  });

  return userId;
}

// Mutation to ensure user exists in database
export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUserOrCreate(ctx);
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    return await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("id"), args.id))
      .collect();
    return notes[0] || null;
  },
});

export const save = mutation({
  args: { note: noteValidator },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrCreate(ctx);
    const existing = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("id"), args.note.id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args.note, userId });
    } else {
      await ctx.db.insert("notes", { ...args.note, userId });
    }
  },
});

export const deleteNote = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrCreate(ctx);
    const note = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (note) {
      await ctx.db.delete(note._id);
    }
  },
});