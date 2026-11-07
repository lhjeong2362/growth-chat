# Coffee Chat Roulette — Agent Guide

Coffee Chat Roulette is a Growth Log event PoC. A visitor enters one keyword; their own Claude or ChatGPT, connected through MCP, generates safe icebreaker questions; the web page selects one through a roulette interaction.

## Goal and scope

The end-to-end flow is the product:

```text
Keyword → session → user's AI + MCP → questions → polling → roulette → conversation
```

- The server must **not** call an LLM API or require OpenAI/Anthropic API keys.
- The PoC is a static vanilla web client plus a Node.js remote MCP/HTTP server.
- Complete the core path before visual polish or extra features.

Out of scope: login, accounts, database, profiles, participant matching, history, QR, WebSocket, React/Next.js, state-management libraries, and extra MCP tools.

## Project layout

```text
web/
  index.html
  style.css
  app.js
server/
  server.js
  session.js
  safety.js
  package.json
AGENTS.md
CONVENTION.md
```

## Parallel ownership

| Owner | Owns | Responsibilities |
| --- | --- | --- |
| A — Web/UI | `web/**` | Keyword input, session creation, copied AI prompt, 2-second polling, waiting/roulette/result states, reroll, Growth Log visual treatment |
| B — Server/MCP | `server/**` | Node HTTP server, CORS, sessions, TTL, MCP tools, safety filtering |

Each owner should be able to develop independently: A uses a mock API until the server is ready; B verifies endpoints and MCP tools directly. Do not edit the other owner’s area unless it is necessary and agreed first. Keep changes to shared documents small and coordinate them before merging.

## Fixed web API contract

Do not rename fields, change response shapes, or change status names without agreement by both owners.

### `POST /session`

Request:

```json
{ "word": "게임" }
```

Success response:

```json
{ "session": "ABCD" }
```

### `GET /session/:code`

Waiting:

```json
{ "status": "waiting", "questions": [] }
```

Ready:

```json
{ "status": "ready", "questions": ["인생 게임 OST 하나를 고른다면?"] }
```

All submitted questions filtered out:

```json
{ "status": "empty", "questions": [] }
```

Expired:

```json
{ "status": "expired", "questions": [] }
```

The web client polls every 2 seconds while the session is waiting. Server errors use a consistent shape, for example:

```json
{ "error": "SESSION_NOT_FOUND", "message": "Session not found." }
```

## Fixed MCP contract

Only these two tools belong in the PoC.

### `get_request`

Input:

```json
{ "session": "ABCD" }
```

Output:

```json
{
  "word": "게임",
  "tone": "신박",
  "count": 5,
  "rules": [
    "처음 만난 사람에게 가볍게 물어볼 수 있는 질문",
    "30초 안에 답할 수 있는 질문",
    "민감 정보, 성적 질문, 비난·평가 질문 금지"
  ]
}
```

### `submit_questions`

Input:

```json
{
  "session": "ABCD",
  "questions": ["인생 게임 OST 하나를 고른다면?", "연봉이 얼마예요?"]
}
```

Output:

```json
{ "stored": 1, "filtered": 1 }
```

## Session and safety rules

- Store sessions only in an in-memory `Map`; server restarts may clear them.
- Default session TTL is 30 minutes. Expire and clean stale sessions regularly.
- Use short, readable session codes and exclude ambiguous characters such as `O`, `0`, `I`, and `1`.
- A session includes `code`, `word`, `tone`, `count`, `rules`, `questions`, and `createdAt`.
- Calculate state from session data; do not add unnecessary state flags.
- Filter every submitted question before storing it. The filter blocks sexual content, romance/dating, income/assets, age, marriage/childbirth, religion, politics, health, appearance evaluation, ability criticism, and questions likely to embarrass someone.
- Keep the keyword list and filtering logic in `server/safety.js`; do not duplicate it across files.
- Do not log full questions or potentially sensitive input unnecessarily.

## UI principles

Follow the Growth Log tone: mobile-first, one clear action per screen, a large Korean headline with a small English label, generous whitespace, simple borders, and a clear CTA. Avoid heavy gradients, neon, glassmorphism, and excessive motion. The roulette is the one light playful moment.

The only app states are:

```text
INPUT → WAITING → ROULETTE → RESULT
                 └→ ERROR
```

The waiting screen shows the session code and a copyable prompt such as `커피챗 세션 ABCD 질문 만들어줘`. Reroll should avoid immediately repeating the displayed question when alternatives exist.

## Priorities and done criteria

1. P0: keyword → session → MCP → question storage → browser receives `ready`.
2. P1: safety filtering and expiration behavior.
3. P2: roulette and reroll experience.
4. P3: visual polish.

The PoC is done once a user can enter `게임`, create a session, ask their connected AI to generate questions for that code, receive questions through `submit_questions`, and see one safe question selected in the browser. Preserve the shared contracts while making changes.

## Worktree rules (Claude Code · Codex)

A and B work in separate git worktrees so their changes never overlap.

| Owner | Tool | Branch | Worktree path | Owns |
| --- | --- | --- | --- | --- |
| A | Claude Code | `feat/web` | `../growth-chat-cc` | `web/**` |
| B | Codex | `feat/mcp-server` | `../growth-chat-codex` | `server/**` |

One-time setup (each person runs only their own line):

```bash
cd growth-chat && git pull origin main
git worktree add ../growth-chat-cc -b feat/web            # A
git worktree add ../growth-chat-codex -b feat/mcp-server  # B
```

- The main checkout (`growth-chat/`) is for `main` only. Do not edit code or commit there.
- Before editing, run `git branch --show-current`. If it prints `main`, stop and tell the user.
- Never read or write the other owner's worktree path.
- Shared files (`AGENTS.md`, `CONVENTION.md`, `CLAUDE.md`, `README.md`, `.gitignore`) are not edited inside a worktree. Ask the user instead.
- Do not create files at the repository root; keep dependency files inside your own directory (e.g. `server/package.json`).
- Sync with `git fetch origin && git rebase origin/main` before starting and before opening a PR.
- Merge to `main` only through a GitHub PR merged by a human. If a conflict appears, do not resolve it yourself; report it to the user.
- After merging: `git worktree remove <path>` and `git branch -d <branch>`.
