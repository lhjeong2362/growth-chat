# Agent 작업 지침 (Claude Code · Codex 공통)

이 저장소는 두 사람이 서로 다른 AI 도구로 동시에 개발한다.

| 담당 | 도구        | 브랜치            | worktree 경로          | 소유 디렉터리 |
| ---- | ----------- | ----------------- | ---------------------- | ------------- |
| A    | Claude Code | `feat/web`        | `../growth-chat-cc`    | `web/`        |
| B    | Codex       | `feat/mcp-server` | `../growth-chat-codex` | `server/`     |

명세는 `PRD.kimm.md`를 따른다. 범위 밖 기능은 만들지 않는다.

---

## 1. 반드시 worktree에서 작업한다

메인 체크아웃(`growth-chat/`)은 `main` 전용이다. **여기서 코드를 수정하거나 커밋하지 않는다.**

최초 1회 (각자 자기 줄만 실행):

```bash
cd growth-chat
git pull origin main

# A (Claude Code)
git worktree add ../growth-chat-cc -b feat/web

# B (Codex)
git worktree add ../growth-chat-codex -b feat/mcp-server
```

작업 시작 전 확인:

```bash
git worktree list
git branch --show-current   # feat/web 또는 feat/mcp-server 여야 한다
```

- 현재 브랜치가 `main`이면 **아무것도 수정하지 말고 멈춘 뒤** 사용자에게 알린다.
- 상대방의 worktree 경로(`../growth-chat-cc`, `../growth-chat-codex`)에는 읽기·쓰기 모두 하지 않는다.

---

## 2. 파일 소유권

| 경로                                                               | 소유자          | 규칙                                                |
| ------------------------------------------------------------------ | --------------- | --------------------------------------------------- |
| `web/**`                                                           | A (Claude Code) | B는 수정 금지                                       |
| `server/**`                                                        | B (Codex)       | A는 수정 금지                                       |
| `PRD.kimm.md`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `.gitignore` | 공유            | worktree에서 수정 금지. 바꿔야 하면 사용자에게 요청 |

- 자기 소유 디렉터리 밖의 파일을 고쳐야 할 것 같으면 **고치지 말고 사용자에게 보고**한다.
- 루트에 새 파일(`package.json` 등)을 만들지 않는다. 의존성 파일은 각자 디렉터리 안에 둔다 (`server/package.json`).

---

## 3. 두 영역 사이의 계약 (변경 금지)

`web/`와 `server/`는 아래 HTTP 계약으로만 연결된다. 상대 코드를 import하지 않는다.

```text
POST /session
  body: { participants: [{ id, name, info }] }
  res:  { code: "ABCD" }

GET /session/:code
  res:  { status: "waiting" | "ready", personal: [{ id, questions: [] }], common: [] }
```

- 계약을 바꿔야 하면 코드를 고치기 전에 사용자에게 먼저 알린다. 양쪽이 합의한 뒤 이 섹션을 갱신한다.
- 상대 쪽이 아직 없을 때는 각자 목업으로 개발한다 (A는 가짜 응답, B는 `curl`).

---

## 4. 커밋 · 병합

- 커밋은 자기 브랜치에만 한다. `main`에 직접 커밋하거나 push하지 않는다.
- 커밋 메시지 접두어: `web:` / `server:`
- 작업 시작 전과 PR 전에 `main`을 받아온다:

```bash
git fetch origin && git rebase origin/main
```

- `main` 병합은 GitHub PR로 하고, 사용자가 직접 머지한다.
- 파일 소유권을 지켰다면 충돌은 공유 파일에서만 난다. 충돌이 나면 해결하지 말고 사용자에게 알린다.

---

## 5. 정리

병합이 끝난 뒤:

```bash
cd growth-chat
git worktree remove ../growth-chat-cc      # 또는 ../growth-chat-codex
git branch -d feat/web                      # 또는 feat/mcp-server
```
