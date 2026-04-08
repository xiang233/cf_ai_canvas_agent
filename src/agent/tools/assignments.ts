import { tool } from "ai";
import { z } from "zod";
import type { CanvasConfig } from "../../canvas-tools";
import * as Canvas from "../../canvas-tools";

export function assignmentTools(cfg: CanvasConfig) {
  return {
    canvas_get_assignments: tool({
      description: "List assignments for a course, sorted by due date. Use this for deadlines, pending work, and submission status.",
      parameters: z.object({
        course_id: z.string().describe("Canvas course ID"),
      }),
      execute: async ({ course_id }) => {
        try { return await Canvas.getAssignments(cfg, course_id); }
        catch (e: any) { return { error: e.message }; }
      },
    }),

    canvas_get_todo_items: tool({
      description: "Get the student's global todo list — all pending assignments and tasks across all courses. Use this for 'what do I need to do' or 'upcoming deadlines' questions.",
      parameters: z.object({}),
      execute: async () => {
        try { return await Canvas.getTodoItems(cfg); }
        catch (e: any) { return { error: e.message }; }
      },
    }),

    canvas_get_upcoming_events: tool({
      description: "Get upcoming events and deadlines across all courses.",
      parameters: z.object({}),
      execute: async () => {
        try { return await Canvas.getUpcomingEvents(cfg); }
        catch (e: any) { return { error: e.message }; }
      },
    }),

    canvas_get_quizzes: tool({
      description: "List quizzes available in a course.",
      parameters: z.object({ course_id: z.string() }),
      execute: async ({ course_id }) => {
        try { return await Canvas.getQuizzes(cfg, course_id); }
        catch (e: any) { return { error: e.message }; }
      },
    }),

    canvas_submit_assignment: tool({
      description: "Submit an assignment (text or URL submission only — file uploads must be done directly on Canvas).",
      parameters: z.object({
        course_id: z.string(),
        assignment_id: z.string(),
        submission_type: z.enum(["online_text_entry", "online_url"]),
        body: z.string().describe("The submission text or URL"),
      }),
      execute: async ({ course_id, assignment_id, submission_type, body }) => {
        try { return await Canvas.submitAssignment(cfg, course_id, assignment_id, submission_type, body); }
        catch (e: any) { return { error: e.message }; }
      },
    }),
  };
}
