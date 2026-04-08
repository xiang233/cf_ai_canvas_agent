import { tool } from "ai";
import { z } from "zod";
import type { CanvasConfig } from "../../canvas-tools";
import * as Canvas from "../../canvas-tools";

export function gradeTools(cfg: CanvasConfig) {
  return {
    canvas_get_grades: tool({
      description: "Get current grades for a specific course. Shows score, grade, and enrollment details.",
      parameters: z.object({ course_id: z.string() }),
      execute: async ({ course_id }) => {
        try { return await Canvas.getGrades(cfg, course_id); }
        catch (e: any) { return { error: e.message }; }
      },
    }),
  };
}

export function fileTools(cfg: CanvasConfig) {
  return {
    canvas_get_files: tool({
      description: "List all files in a course.",
      parameters: z.object({ course_id: z.string() }),
      execute: async ({ course_id }) => {
        try { return await Canvas.getFiles(cfg, course_id); }
        catch (e: any) { return { error: e.message }; }
      },
    }),

    canvas_search_files: tool({
      description: "Search for files by name in a course. Use this to find specific documents, slides, or PDFs.",
      parameters: z.object({
        course_id: z.string(),
        query: z.string().describe("Search term to find in file names"),
      }),
      execute: async ({ course_id, query }) => {
        try { return await Canvas.searchFiles(cfg, course_id, query); }
        catch (e: any) { return { error: e.message }; }
      },
    }),

    canvas_get_file_info: tool({
      description: "Get details and download URL for a specific file.",
      parameters: z.object({ file_id: z.string() }),
      execute: async ({ file_id }) => {
        try { return await Canvas.getFileInfo(cfg, file_id); }
        catch (e: any) { return { error: e.message }; }
      },
    }),

    canvas_get_folders: tool({
      description: "List folders in a course.",
      parameters: z.object({ course_id: z.string() }),
      execute: async ({ course_id }) => {
        try { return await Canvas.getFolders(cfg, course_id); }
        catch (e: any) { return { error: e.message }; }
      },
    }),

    canvas_get_folder_files: tool({
      description: "List files inside a specific folder.",
      parameters: z.object({ folder_id: z.string() }),
      execute: async ({ folder_id }) => {
        try { return await Canvas.getFolderFiles(cfg, folder_id); }
        catch (e: any) { return { error: e.message }; }
      },
    }),
  };
}

export function discussionTools(cfg: CanvasConfig) {
  return {
    canvas_get_announcements: tool({
      description: "Get instructor announcements for a course. Use this when students ask about announcements, updates, or news from a course.",
      parameters: z.object({ course_id: z.string() }),
      execute: async ({ course_id }) => {
        try { return await Canvas.getAnnouncements(cfg, course_id); }
        catch (e: any) { return { error: e.message }; }
      },
    }),

    canvas_get_discussions: tool({
      description: "Get discussion topics for a course.",
      parameters: z.object({ course_id: z.string() }),
      execute: async ({ course_id }) => {
        try { return await Canvas.getDiscussions(cfg, course_id); }
        catch (e: any) { return { error: e.message }; }
      },
    }),

    canvas_post_discussion: tool({
      description: "Post a reply to a discussion topic.",
      parameters: z.object({
        course_id: z.string(),
        topic_id: z.string(),
        message: z.string(),
      }),
      execute: async ({ course_id, topic_id, message }) => {
        try { return await Canvas.postDiscussionReply(cfg, course_id, topic_id, message); }
        catch (e: any) { return { error: e.message }; }
      },
    }),
  };
}

export function calendarTools(cfg: CanvasConfig) {
  return {
    canvas_get_calendar_events: tool({
      description: "Get upcoming calendar events for the student.",
      parameters: z.object({}),
      execute: async () => {
        try { return await Canvas.getCalendarEvents(cfg); }
        catch (e: any) { return { error: e.message }; }
      },
    }),

    canvas_get_groups: tool({
      description: "List all groups the student belongs to.",
      parameters: z.object({}),
      execute: async () => {
        try { return await Canvas.getGroups(cfg); }
        catch (e: any) { return { error: e.message }; }
      },
    }),
  };
}
