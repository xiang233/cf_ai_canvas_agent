import { AIChatAgent } from "@cloudflare/ai-chat";
import { createWorkersAI } from "workers-ai-provider";
import { generateText, streamText, convertToModelMessages } from "ai";
import { routeAgentRequest } from "agents";
import { buildSystemPrompt } from "./agent/prompt";
import * as Canvas from "./canvas-tools";

export interface Env {
  AI: Ai;
  CanvasAgent: DurableObjectNamespace;
  ASSETS: Fetcher;
  CANVAS_URL: string;
  CANVAS_TOKEN: string;
}

const TOOL_DESCRIPTIONS = `
Available tools (respond with JSON array of tool calls):
- canvas_list_courses: {} 
- canvas_get_todo_items: {}
- canvas_get_upcoming_events: {}
- canvas_get_calendar_events: {}
- canvas_get_grades: { course_id: string }
- canvas_get_assignments: { course_id: string }
- canvas_get_announcements: { course_id: string }
- canvas_get_discussions: { course_id: string }
- canvas_get_files: { course_id: string }
- canvas_get_modules: { course_id: string }
- canvas_get_quizzes: { course_id: string }
- canvas_get_groups: {}
- canvas_search_files: { course_id: string, query: string }
- none: {} (if no Canvas data needed, answer from knowledge)
`;

async function planTools(model: any, userMessage: string, conversationContext: string): Promise<Array<{tool: string, params: Record<string, string>}>> {
  try {
    const { text } = await generateText({
      model,
      system: `You are a tool planner. Given a user message, output ONLY a JSON array of tool calls needed to answer it.
${TOOL_DESCRIPTIONS}
Rules:
- If the question needs course_id but you don't know it, include canvas_list_courses first
- Output ONLY valid JSON array, no explanation
- Use [{tool: "none", params: {}}] if no Canvas data needed
Examples:
"what courses am I in?" -> [{"tool":"canvas_list_courses","params":{}}]
"any upcoming deadlines?" -> [{"tool":"canvas_get_todo_items","params":{}},{"tool":"canvas_get_upcoming_events","params":{}}]
"what's my grade in CSE 5106?" -> [{"tool":"canvas_list_courses","params":{}},{"tool":"canvas_get_grades","params":{"course_id":"FIND_FROM_COURSES"}}]
"how do I study for exams?" -> [{"tool":"none","params":{}}]`,
      prompt: `${conversationContext}\nUser: ${userMessage}`,
      maxTokens: 200,
    });
    
    const json = text.trim().replace(/```json?|```/g, "").trim();
    return JSON.parse(json);
  } catch {
    return [{ tool: "none", params: {} }];
  }
}

async function executeTool(tool: string, params: Record<string, string>, cfg: Canvas.CanvasConfig, courseCache: Map<string, any[]>): Promise<{tool: string, result: unknown}> {
  try {
    switch (tool) {
      case "canvas_list_courses": {
        const data = await Canvas.listCourses(cfg) as any[];
        courseCache.set("courses", data);
        return { tool, result: data };
      }
      case "canvas_get_todo_items":
        return { tool, result: await Canvas.getTodoItems(cfg) };
      case "canvas_get_upcoming_events":
        return { tool, result: await Canvas.getUpcomingEvents(cfg) };
      case "canvas_get_calendar_events":
        return { tool, result: await Canvas.getCalendarEvents(cfg) };
      case "canvas_get_groups":
        return { tool, result: await Canvas.getGroups(cfg) };
      case "canvas_get_grades": {
        let courseId = params.course_id;
        if (courseId === "FIND_FROM_COURSES" || !courseId) {
          const courses = courseCache.get("courses") || (await Canvas.listCourses(cfg) as any[]);
          courseCache.set("courses", courses);
          courseId = String(courses[0]?.id || "");
        }
        return { tool, result: await Canvas.getGrades(cfg, courseId) };
      }
      case "canvas_get_assignments": {
        let courseId = params.course_id;
        if (courseId === "FIND_FROM_COURSES" || !courseId) {
          const courses = courseCache.get("courses") || (await Canvas.listCourses(cfg) as any[]);
          courseCache.set("courses", courses);
          courseId = String(courses[0]?.id || "");
        }
        return { tool, result: await Canvas.getAssignments(cfg, courseId) };
      }
      case "canvas_get_announcements": {
        let courseId = params.course_id;
        if (!courseId || courseId === "FIND_FROM_COURSES") {
          const courses = courseCache.get("courses") || (await Canvas.listCourses(cfg) as any[]);
          courseCache.set("courses", courses);
          courseId = String(courses[0]?.id || "");
        }
        return { tool, result: await Canvas.getAnnouncements(cfg, courseId) };
      }
      case "canvas_get_discussions": {
        let courseId = params.course_id;
        if (!courseId || courseId === "FIND_FROM_COURSES") {
          const courses = courseCache.get("courses") || (await Canvas.listCourses(cfg) as any[]);
          courseId = String(courses[0]?.id || "");
        }
        return { tool, result: await Canvas.getDiscussions(cfg, courseId) };
      }
      case "canvas_get_files": {
        let courseId = params.course_id;
        if (!courseId || courseId === "FIND_FROM_COURSES") {
          const courses = courseCache.get("courses") || (await Canvas.listCourses(cfg) as any[]);
          courseId = String(courses[0]?.id || "");
        }
        return { tool, result: await Canvas.getFiles(cfg, courseId) };
      }
      case "canvas_get_modules": {
        let courseId = params.course_id;
        if (!courseId || courseId === "FIND_FROM_COURSES") {
          const courses = courseCache.get("courses") || (await Canvas.listCourses(cfg) as any[]);
          courseId = String(courses[0]?.id || "");
        }
        return { tool, result: await Canvas.getModules(cfg, courseId) };
      }
      case "canvas_get_quizzes": {
        let courseId = params.course_id;
        if (!courseId || courseId === "FIND_FROM_COURSES") {
          const courses = courseCache.get("courses") || (await Canvas.listCourses(cfg) as any[]);
          courseId = String(courses[0]?.id || "");
        }
        return { tool, result: await Canvas.getQuizzes(cfg, courseId) };
      }
      case "canvas_search_files": {
        return { tool, result: await Canvas.searchFiles(cfg, params.course_id, params.query) };
      }
      default:
        return { tool: "none", result: null };
    }
  } catch (e: any) {
    return { tool, result: { error: e.message } };
  }
}

export class CanvasAgent extends AIChatAgent<Env> {
  async onChatMessage() {
    const workersAI = createWorkersAI({ binding: this.env.AI });
    const cfg: Canvas.CanvasConfig = {
      baseUrl: this.env.CANVAS_URL,
      token: this.env.CANVAS_TOKEN,
    };

    const lastMessage = this.messages[this.messages.length - 1];
    const userText = typeof lastMessage?.content === "string"
      ? lastMessage.content
      : (lastMessage?.content as any[])?.find((p: any) => p.type === "text")?.text || "";

    // Build short conversation context for planner
    const recentMsgs = this.messages.slice(-4).map((m: any) => {
      const content = typeof m.content === "string" ? m.content :
        (m.content as any[])?.find((p: any) => p.type === "text")?.text || "";
      return `${m.role}: ${content.slice(0, 100)}`;
    }).join("\n");

    // STEP 1: Plan — ask Llama which tools to call
    const plan = await planTools(workersAI("@cf/meta/llama-3.3-70b-instruct-fp8-fast"), userText, recentMsgs);

    // STEP 2: Execute — run the tools in parallel where possible
    let canvasContext = "";
    if (plan.length > 0 && plan[0].tool !== "none") {
      const courseCache = new Map<string, any[]>();
      // Execute sequentially to handle dependencies (e.g. need courses before grades)
      const results: string[] = [];
      for (const { tool, params } of plan) {
        if (tool === "none") continue;
        const { result } = await executeTool(tool, params || {}, cfg, courseCache);
        const summary = JSON.stringify(result).slice(0, 1500);
        results.push(`[${tool}]: ${summary}`);
      }
      if (results.length > 0) {
        canvasContext = `\n\n[CANVAS DATA]\n${results.join("\n\n")}\n[END CANVAS DATA]\n\nThe student asked: "${userText}"\nUsing the Canvas data above, answer this question clearly and concisely in plain English.`;
      }
    }

    // STEP 3: Aggregate — ask Llama to summarize with real data injected
    const result = streamText({
      model: workersAI("@cf/meta/llama-3.3-70b-instruct-fp8-fast"),
      system: buildSystemPrompt() + canvasContext,
      messages: await convertToModelMessages(this.messages),
      maxTokens: 1024,
    });

    return result.toUIMessageStreamResponse();
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/agents/")) {
      const agentResponse = await routeAgentRequest(request, env);
      if (agentResponse) return agentResponse;
    }
    return env.ASSETS.fetch(request);
  },
};
