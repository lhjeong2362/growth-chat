import { createServer } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { createSession, findSession, getStatus, isExpired, storeQuestions } from "./session.js";
import { filterQuestions } from "./safety.js";

const PORT = Number(process.env.PORT) || 3000;
const WEB_ORIGIN = process.env.WEB_ORIGIN || "*";
const WORD_MAX_LENGTH = 20;
const MAX_BODY_BYTES = 64 * 1024;
const MAX_SUBMITTED_QUESTIONS = 20;

const MCP_INSTRUCTIONS = `Coffee Chat Roulette: 행사장에서 처음 만난 사람과 나눌 아이스브레이킹 질문을 만든다.
사용자가 "커피챗 세션 ABCD 질문 만들어줘"처럼 4자리 세션 코드를 주면:
1) get_request로 키워드와 규칙을 확인한다.
2) 사용자가 직무·관심사 등 자기 정보를 이미 알려줬다면 반영한다. 알려주지 않았다면 "질문에 반영할 관심사나 직무가 있나요? (건너뛰어도 돼요)"라고 한 번만 짧게 묻고, 답이 없거나 건너뛰면 키워드만으로 만든다.
3) 규칙을 지켜 count개의 질문을 만들어 submit_questions로 제출한다. 편안한 질문과 예상 밖의 가벼운 질문을 섞는다.
4) 제출 후 "웹 화면으로 돌아가 룰렛을 확인하세요"라고 안내한다.`;

// ---------- MCP ----------

function toolText(data, isError = false) {
  return { content: [{ type: "text", text: JSON.stringify(data) }], isError };
}

function findActiveSession(code) {
  const session = findSession(code);
  if (!session) return { error: toolText({ error: "SESSION_NOT_FOUND", message: "세션을 찾을 수 없어요. 코드를 다시 확인해주세요." }, true) };
  if (isExpired(session)) return { error: toolText({ error: "SESSION_EXPIRED", message: "만료된 세션이에요. 웹에서 새로 시작해주세요." }, true) };
  return { session };
}

const sessionCodeSchema = z.string().min(1).max(10).describe("웹 화면에 표시된 4자리 세션 코드 (예: ABCD)");

function createMcpServer() {
  const server = new McpServer({ name: "coffee-chat-roulette", version: "0.1.0" }, { instructions: MCP_INSTRUCTIONS });

  server.registerTool(
    "get_request",
    {
      title: "커피챗 세션 요청 조회",
      description:
        "커피챗 세션 코드로 질문 생성 요청(키워드 word, 톤 tone, 개수 count, 규칙 rules)을 가져온다. " +
        "사용자가 '커피챗 세션 XXXX 질문 만들어줘'라고 하면 가장 먼저 호출한다. " +
        "그다음 사용자의 직무·관심사를 반영(모르면 한 번만 선택적으로 질문)해 질문을 만들고 submit_questions로 제출한다.",
      inputSchema: { session: sessionCodeSchema },
      annotations: { readOnlyHint: true },
    },
    async ({ session: code }) => {
      const { session, error } = findActiveSession(code);
      if (error) return error;
      const { word, tone, count, rules } = session;
      return toolText({ word, tone, count, rules });
    },
  );

  server.registerTool(
    "submit_questions",
    {
      title: "커피챗 질문 제출",
      description:
        "get_request의 규칙에 맞게 생성한 아이스브레이킹 질문들을 세션에 제출한다. " +
        "질문은 한국어 한 문장씩, 30초 안에 답할 수 있게. 사용자의 개인정보(이름, 회사명 등)는 질문에 넣지 않는다. " +
        "결과의 filtered는 안전 필터에 걸려 제외된 개수다. stored가 0이면 더 가벼운 질문으로 다시 제출한다.",
      inputSchema: {
        session: sessionCodeSchema,
        questions: z.array(z.string().max(300)).min(1).max(MAX_SUBMITTED_QUESTIONS).describe("생성한 질문 목록"),
      },
    },
    async ({ session: code, questions }) => {
      const { session, error } = findActiveSession(code);
      if (error) return error;
      const { safe, filtered } = filterQuestions(questions);
      storeQuestions(session, safe);
      console.log(`[mcp] questions submitted ${session.code} stored=${safe.length} filtered=${filtered}`);
      return toolText({ stored: safe.length, filtered });
    },
  );

  return server;
}

async function handleMcp(req, res, body) {
  // Stateless: one server + transport per request, so no MCP session bookkeeping.
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, body);
}

// ---------- Web API ----------

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function sendError(res, status, error, message) {
  sendJson(res, status, { error, message });
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) return null;
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

function handleCreateSession(res, body) {
  const word = typeof body?.word === "string" ? body.word.trim() : "";
  if (!word || word.length > WORD_MAX_LENGTH) {
    return sendError(res, 400, "INVALID_WORD", `Word must be 1-${WORD_MAX_LENGTH} characters.`);
  }
  const session = createSession(word);
  console.log(`[session] created ${session.code}`);
  sendJson(res, 201, { session: session.code });
}

function handleGetSession(res, code) {
  const session = findSession(code);
  if (!session) return sendError(res, 404, "SESSION_NOT_FOUND", "Session not found.");
  const status = getStatus(session);
  if (status === "expired") return sendJson(res, 410, { status, questions: [] });
  sendJson(res, 200, { status, questions: session.questions });
}

// ---------- Router ----------

async function route(req, res) {
  res.setHeader("Access-Control-Allow-Origin", WEB_ORIGIN);
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version",
    });
    return res.end();
  }

  const { pathname } = new URL(req.url, "http://localhost");

  if (pathname === "/mcp") {
    if (req.method !== "POST") {
      res.writeHead(405, { Allow: "POST" });
      return res.end();
    }
    const body = await readJson(req);
    if (body === null) return sendError(res, 400, "INVALID_JSON", "Request body must be JSON.");
    return handleMcp(req, res, body);
  }

  if (pathname === "/session" && req.method === "POST") {
    const body = await readJson(req);
    if (body === null) return sendError(res, 400, "INVALID_JSON", "Request body must be JSON.");
    return handleCreateSession(res, body);
  }

  const match = pathname.match(/^\/session\/([^/]+)$/);
  if (match && req.method === "GET") return handleGetSession(res, decodeURIComponent(match[1]));

  if (pathname === "/" && req.method === "GET") return sendJson(res, 200, { ok: true });

  sendError(res, 404, "NOT_FOUND", "Route not found.");
}

export const httpServer = createServer(async (req, res) => {
  try {
    await route(req, res);
  } catch (err) {
    console.error("[server] unexpected error", err.message);
    if (!res.headersSent) sendError(res, 500, "INTERNAL_ERROR", "Unexpected server error.");
    else res.end();
  }
});

if (import.meta.main) {
  httpServer.listen(PORT, () => console.log(`[server] listening on :${PORT} (MCP: /mcp)`));
}
