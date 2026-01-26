import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("notes").collect();
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const notes = await ctx.db.query("notes").filter(q => q.eq(q.field("id"), args.id)).collect();
    return notes[0] || null;
  },
});

export const save = mutation({
  args: { note: noteValidator },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("notes").filter(q => q.eq(q.field("id"), args.note.id)).first();
    if (existing) {
      await ctx.db.patch(existing._id, args.note);
    } else {
      await ctx.db.insert("notes", args.note);
    }
  },
});

export const deleteNote = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const note = await ctx.db.query("notes").filter(q => q.eq(q.field("id"), args.id)).first();
    if (note) {
      await ctx.db.delete(note._id);
    }
  },
});