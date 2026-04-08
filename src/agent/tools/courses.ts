import { tool } from "ai";
import { z } from "zod";
import type { CanvasConfig } from "../../canvas-tools";
import * as Canvas from "../../canvas-tools";

export function courseTools(cfg: CanvasConfig) {
  return {
    canvas_list_courses: tool({
      description: "List all courses the student is currently enrolled in. Always call this first if you need a course ID.",
      parameters: z.object({}),
      execute: async () => {
        try { return await Canvas.listCourses(cfg); }
        catch (e: any) { return { error: e.message }; }
      },
    }),

    canvas_get_modules: tool({
      description: "Get the modules (units/weeks) for a specific course.",
      parameters: z.object({
        course_id: z.string().describe("Canvas course ID — get this from canvas_list_courses first"),
      }),
      execute: async ({ course_id }) => {
        try { return await Canvas.getModules(cfg, course_id); }
        catch (e: any) { return { error: e.message }; }
      },
    }),

    canvas_get_module_items: tool({
      description: "Get the items (lectures, assignments, files) inside a specific module.",
      parameters: z.object({
        course_id: z.string(),
        module_id: z.string(),
      }),
      execute: async ({ course_id, module_id }) => {
        try { return await Canvas.getModuleItems(cfg, course_id, module_id); }
        catch (e: any) { return { error: e.message }; }
      },
    }),

    canvas_get_pages: tool({
      description: "List pages (syllabus, notes, resources) in a course.",
      parameters: z.object({ course_id: z.string() }),
      execute: async ({ course_id }) => {
        try { return await Canvas.getPages(cfg, course_id); }
        catch (e: any) { return { error: e.message }; }
      },
    }),

    canvas_get_page_content: tool({
      description: "Get the full content of a specific course page.",
      parameters: z.object({
        course_id: z.string(),
        page_url: z.string().describe("The page URL slug from canvas_get_pages"),
      }),
      execute: async ({ course_id, page_url }) => {
        try { return await Canvas.getPageContent(cfg, course_id, page_url); }
        catch (e: any) { return { error: e.message }; }
      },
    }),
  };
}
