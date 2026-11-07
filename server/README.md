# Coffee Chat Server (Web API + Remote MCP)

```bash
cd server
npm install
npm start          # PORT=3000, WEB_ORIGIN=* (기본값)
npm test           # POST /session → get_request → submit_questions → GET ready, 안전 필터 확인
```

| Endpoint | 용도 |
| --- | --- |
| `POST /session` | `{ "word": "게임" }` → `{ "session": "ABCD" }` |
| `GET /session/:code` | `waiting` / `ready` / `empty` / `expired`(410) |
| `POST /mcp` | Remote MCP (Streamable HTTP, stateless). 도구: `get_request`, `submit_questions` |

## AI 연결

claude.ai·ChatGPT는 **공개 HTTPS URL**이 필요합니다. 로컬 테스트는 터널을 사용하세요.

```bash
npx cloudflared tunnel --url http://localhost:3000   # 또는: ngrok http 3000
# → https://xxxx.trycloudflare.com/mcp 를 MCP URL로 사용
```

| AI | 연결 방법 |
| --- | --- |
| Claude (claude.ai / Desktop) | Settings → Connectors → Add custom connector → URL `https://<host>/mcp` |
| Claude Code | `claude mcp add --transport http coffee-chat https://<host>/mcp` |
| ChatGPT | Settings → Apps & Connectors → Advanced → Developer mode 켜기 → Create → URL `https://<host>/mcp`, 인증 `No authentication` |
| Gemini CLI | `~/.gemini/settings.json`에 `{ "mcpServers": { "coffee-chat": { "httpUrl": "https://<host>/mcp" } } }` |

## 사용

AI에게 `커피챗 세션 ABCD 질문 만들어줘`라고 보냅니다. 직무·관심사를 같이 적으면(예: `나는 백엔드 개발자고 보드게임 좋아해`) 질문에 반영됩니다.
적지 않으면 AI가 한 번 물어보고, 건너뛰면 키워드만으로 만듭니다. 사용자 정보는 서버에 저장되지 않습니다.
