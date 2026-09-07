import type { RequestHandler } from "msw";

// Component tests can override these defaults with server.use(...).
export const handlers: RequestHandler[] = [];
