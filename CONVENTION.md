# Coffee Chat Roulette — Development Convention

## Runtime and code style

- Use current Node.js LTS, JavaScript, and ES modules.
- Prefer `const`; use `let` only for values that change; never use `var`.
- Use `camelCase` for variables and functions, `UPPER_SNAKE_CASE` for constants, and meaningful boolean names such as `isExpired` and `hasQuestions`.
- Prefer small, single-purpose functions and early returns over deeply nested conditionals.
- Use `async` / `await` rather than promise chains unless there is a clear reason not to.
- For this PoC, optimize in this order: readable → simple → reusable → abstract. Do not create controller/service/repository/factory layers without a concrete need.

Examples:

```js
const SESSION_TTL_MS = 30 * 60 * 1000;

export function getSession(code) {
  const session = sessions.get(code);

  if (!session) return null;

  if (isExpired(session)) {
    sessions.delete(code);
    return null;
  }

  return session;
}
```

## HTTP, session, and MCP conventions

- The contracts in `AGENTS.md` are shared interfaces. Never independently rename `session`, `questions`, `status`, `get_request`, or `submit_questions`.
- Use `400` for invalid requests, `404` for an unknown session, `410` for an expired session, and `500` for unexpected failures.
- Error responses use `{ "error": "CODE", "message": "Human-readable message." }`.
- Return only client-relevant data; never expose internal map size, process details, or raw session internals.
- Maintain session data in this general form:

```js
{
  code: "ABCD",
  word: "게임",
  tone: "신박",
  count: 5,
  rules: [],
  questions: [],
  createdAt: Date.now()
}
```

- Determine `ready` from whether safe questions exist. A completed submission with none safe is `empty`.
- Keep `BLOCKED_KEYWORDS`, `isSafeQuestion`, and question filtering together in `server/safety.js`. Normalize strings before checking.
- Avoid overly broad dependencies: Node and browser primitives are preferred for code generation, random selection, array shuffling, validation, and simple CSS animation.

## Web conventions

- Use vanilla HTML, CSS, and browser JavaScript; no build step is required.
- Keep one explicit application state:

```js
const AppState = {
  INPUT: "input",
  WAITING: "waiting",
  ROULETTE: "roulette",
  RESULT: "result",
  ERROR: "error"
};
```

- Do not model screens with competing booleans such as `isWaiting`, `isRoulette`, and `isResult`.
- Define `API_BASE_URL` once and use it for all requests.
- Use meaningful element IDs: `keyword-input`, `create-session-button`, `session-code`, `roulette-question`, and `reroll-button`.
- Write CSS mobile-first. Add a desktop media query only when it improves the layout.
- Maintain the Growth Log styling rules: whitespace, typography hierarchy, simple borders, clear CTA, minimal motion; no decorative excess.

## Validation and resilience

- Trim the keyword, reject an empty value, and cap it at 20 characters unless both owners agree otherwise.
- Poll at `POLL_INTERVAL_MS = 2000` while waiting; always stop polling when the session becomes ready, empty, expired, or errors.
- Gracefully show the empty, expired, and error states rather than leaving the waiting screen indefinitely.
- Reroll from candidates other than the current question when possible.
- Prioritize one manual end-to-end test: `POST /session` → `get_request` → `submit_questions` → `GET /session/:code` returns `ready`.
- Also test that a prohibited question, for example `연봉이 얼마예요?`, is counted as filtered and is never returned to the web client.

## Environment and logging

- Do not place secrets in source control. This PoC has no LLM API keys.
- Allowed environment settings include `PORT` and `WEB_ORIGIN`; commit an example file if needed, never a real `.env`.
- Keep logs concise and operational, for example `[session] created ABCD` or `[mcp] questions submitted ABCD stored=4 filtered=1`.
- Do not log full questions or sensitive inputs unless diagnosing a local issue.

## Git workflow

Use small, focused commits and protect the ownership boundary.

```text
main
├── feat/web
└── feat/mcp-server
```

Use `fix/*` for corrections and `chore/*` for maintenance. Suggested commit format:

```text
type: concise imperative message
```

Allowed types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`.

Examples:

```text
feat: add session creation endpoint
feat: add roulette animation
fix: stop polling expired sessions
docs: clarify MCP flow
```

- A edits `web/**`; B edits `server/**`.
- Discuss changes to `README.md`, `AGENTS.md`, `CONVENTION.md`, and every shared API/MCP field before merging.
- Keep commits independently reviewable; do not mix formatting churn with behavior changes.
- Before merge, verify the end-to-end flow and safety filter rather than adding features outside the PoC scope.

## Final decision rule

When considering a feature, ask: “Is it necessary to validate keyword → user AI → MCP → safe question → roulette in this 30-minute PoC?” If not, leave it out.
