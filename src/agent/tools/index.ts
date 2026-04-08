/**
 * Tool registry — import all tools from one place.
 * To add new tools: create a new file in this directory,
 * export a function that returns tool definitions,
 * then add it to the spread below. Nothing else needs to change.
 */

import type { CanvasConfig } from "../../canvas-tools";
import { courseTools } from "./courses";
import { assignmentTools } from "./assignments";
import { gradeTools, fileTools, discussionTools, calendarTools } from "./other";

export function allTools(cfg: CanvasConfig) {
  return {
    ...courseTools(cfg),
    ...assignmentTools(cfg),
    ...gradeTools(cfg),
    ...fileTools(cfg),
    ...discussionTools(cfg),
    ...calendarTools(cfg),
  };
}
