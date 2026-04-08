/**
 * Canvas LMS API Tools
 * Ported from the original Python canvas tools to Cloudflare Workers fetch() calls.
 * All tools use the Canvas REST API v1.
 */

export interface CanvasConfig {
  baseUrl: string;   // e.g. https://wustl.instructure.com
  token: string;     // Canvas access token
}

async function canvasFetch(cfg: CanvasConfig, path: string, opts: RequestInit = {}): Promise<unknown> {
  const url = `${cfg.baseUrl}/api/v1${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Canvas API error ${res.status} on ${path}: ${text.slice(0, 100)}`);
  }
  const data = await res.json();
  // Truncate arrays to save context window tokens
  if (Array.isArray(data) && data.length > 10) {
    return data.slice(0, 10);
  }
  return data;
}

// ── Course Management ──────────────────────────────────────────────

export async function listCourses(cfg: CanvasConfig): Promise<unknown> {
  return canvasFetch(cfg, "/courses?enrollment_state=active&per_page=50");
}

export async function getModules(cfg: CanvasConfig, courseId: string): Promise<unknown> {
  return canvasFetch(cfg, `/courses/${courseId}/modules?per_page=50`);
}

export async function getModuleItems(cfg: CanvasConfig, courseId: string, moduleId: string): Promise<unknown> {
  return canvasFetch(cfg, `/courses/${courseId}/modules/${moduleId}/items?per_page=50`);
}

// ── Assignments & Submissions ──────────────────────────────────────

export async function getAssignments(cfg: CanvasConfig, courseId: string): Promise<unknown> {
  return canvasFetch(cfg, `/courses/${courseId}/assignments?per_page=50&order_by=due_at`);
}

export async function submitAssignment(
  cfg: CanvasConfig,
  courseId: string,
  assignmentId: string,
  submissionType: string,
  body: string
): Promise<unknown> {
  return canvasFetch(cfg, `/courses/${courseId}/assignments/${assignmentId}/submissions`, {
    method: "POST",
    body: JSON.stringify({
      submission: {
        submission_type: submissionType,
        body,
      },
    }),
  });
}

// ── File Management ────────────────────────────────────────────────

export async function getFiles(cfg: CanvasConfig, courseId: string): Promise<unknown> {
  return canvasFetch(cfg, `/courses/${courseId}/files?per_page=50`);
}

export async function getFileInfo(cfg: CanvasConfig, fileId: string): Promise<unknown> {
  return canvasFetch(cfg, `/files/${fileId}`);
}

export async function getFolders(cfg: CanvasConfig, courseId: string): Promise<unknown> {
  return canvasFetch(cfg, `/courses/${courseId}/folders?per_page=50`);
}

export async function getFolderFiles(cfg: CanvasConfig, folderId: string): Promise<unknown> {
  return canvasFetch(cfg, `/folders/${folderId}/files?per_page=50`);
}

export async function searchFiles(cfg: CanvasConfig, courseId: string, query: string): Promise<unknown> {
  return canvasFetch(cfg, `/courses/${courseId}/files?search_term=${encodeURIComponent(query)}&per_page=20`);
}

// ── Discussions & Announcements ────────────────────────────────────

export async function getDiscussions(cfg: CanvasConfig, courseId: string): Promise<unknown> {
  return canvasFetch(cfg, `/courses/${courseId}/discussion_topics?per_page=20`);
}

export async function postDiscussionReply(
  cfg: CanvasConfig,
  courseId: string,
  topicId: string,
  message: string
): Promise<unknown> {
  return canvasFetch(cfg, `/courses/${courseId}/discussion_topics/${topicId}/entries`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export async function getAnnouncements(cfg: CanvasConfig, courseId: string): Promise<unknown> {
  return canvasFetch(cfg, `/courses/${courseId}/discussion_topics?only_announcements=true&per_page=20`);
}

// ── Course Content ─────────────────────────────────────────────────

export async function getPages(cfg: CanvasConfig, courseId: string): Promise<unknown> {
  return canvasFetch(cfg, `/courses/${courseId}/pages?per_page=30`);
}

export async function getPageContent(cfg: CanvasConfig, courseId: string, pageUrl: string): Promise<unknown> {
  return canvasFetch(cfg, `/courses/${courseId}/pages/${pageUrl}`);
}

// ── Grades & Calendar ──────────────────────────────────────────────

export async function getGrades(cfg: CanvasConfig, courseId: string): Promise<unknown> {
  // Returns the current user's enrollment including grades
  return canvasFetch(cfg, `/courses/${courseId}/enrollments?state[]=active&per_page=10`);
}

export async function getCalendarEvents(cfg: CanvasConfig): Promise<unknown> {
  const now = new Date().toISOString();
  return canvasFetch(cfg, `/calendar_events?start_date=${now}&per_page=30`);
}

export async function getTodoItems(cfg: CanvasConfig): Promise<unknown> {
  return canvasFetch(cfg, `/users/self/todo`);
}

export async function getUpcomingEvents(cfg: CanvasConfig): Promise<unknown> {
  return canvasFetch(cfg, `/users/self/upcoming_events`);
}

// ── Quizzes & Groups ───────────────────────────────────────────────

export async function getQuizzes(cfg: CanvasConfig, courseId: string): Promise<unknown> {
  return canvasFetch(cfg, `/courses/${courseId}/quizzes?per_page=20`);
}

export async function getGroups(cfg: CanvasConfig): Promise<unknown> {
  return canvasFetch(cfg, `/users/self/groups?per_page=20`);
}
