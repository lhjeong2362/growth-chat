import { randomInt } from "node:crypto";

export const SESSION_TTL_MS = 30 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000;
// Keep expired sessions a little longer so the web can still see "expired" instead of 404.
const SESSION_RETENTION_MS = SESSION_TTL_MS * 2;
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O, 0, I, 1
const CODE_LENGTH = 4;

const DEFAULT_TONE = "신박";
const DEFAULT_COUNT = 5;
const DEFAULT_RULES = [
  "처음 만난 사람에게 가볍게 물어볼 수 있는 질문",
  "30초 안에 답할 수 있는 질문",
  "민감 정보, 성적 질문, 비난·평가 질문 금지",
  "사용자가 대화에서 알려준 직무·관심사가 있으면 질문에 자연스럽게 반영하되, 그 개인정보를 질문에 그대로 쓰지 않는다",
];

const sessions = new Map();

function createCode() {
  let code;
  do {
    code = Array.from({ length: CODE_LENGTH }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join("");
  } while (sessions.has(code));
  return code;
}

export function createSession(word) {
  const session = {
    code: createCode(),
    word,
    tone: DEFAULT_TONE,
    count: DEFAULT_COUNT,
    rules: DEFAULT_RULES,
    questions: [],
    submittedAt: null,
    createdAt: Date.now(),
  };
  sessions.set(session.code, session);
  return session;
}

export function findSession(code) {
  return sessions.get(String(code).trim().toUpperCase()) ?? null;
}

export function isExpired(session) {
  return Date.now() - session.createdAt > SESSION_TTL_MS;
}

export function getStatus(session) {
  if (isExpired(session)) return "expired";
  if (session.questions.length > 0) return "ready";
  if (session.submittedAt) return "empty";
  return "waiting";
}

export function storeQuestions(session, questions) {
  session.questions = questions;
  session.submittedAt = Date.now();
}

setInterval(() => {
  const now = Date.now();
  for (const [code, session] of sessions) {
    if (now - session.createdAt > SESSION_RETENTION_MS) sessions.delete(code);
  }
}, CLEANUP_INTERVAL_MS).unref();
