import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
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
  }),
});