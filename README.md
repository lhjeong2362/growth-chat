# ☕ Coffee Chat Roulette

> **단어 하나로 첫 대화를 시작합니다.**

행사장에서 처음 만난 사람과 무슨 이야기를 해야 할지 고민될 때,  
하나의 키워드를 입력하면 **사용자 자신의 AI(Claude / ChatGPT)**가 아이스브레이킹 질문을 만들고, 웹에서 룰렛을 돌려 오늘의 질문 하나를 뽑아주는 서비스입니다.

---

## Why

오프라인 네트워킹에서 가장 어려운 순간은 사람을 만나는 것보다 **첫 질문을 꺼내는 순간**입니다.

Coffee Chat Roulette는 이 부담을 줄여줍니다.

```text
Keyword
↓
User's AI
↓
Questions
↓
Roulette
↓
Conversation
```

예를 들어 `게임`을 입력하면 AI가 다음과 같은 질문들을 만들어줍니다.

```text
"인생 게임 OST 하나를 고른다면?"
"게임 속 직업 하나를 현실에서 해본다면?"
"최근 시간 가는 줄 모르고 했던 게임은?"
```

그중 하나를 룰렛으로 뽑아 바로 대화를 시작합니다.

---

## Concept

Coffee Chat Roulette의 핵심은 세 가지입니다.

### 1. Keyword

사용자는 대화하고 싶은 주제 하나만 입력합니다.

```text
게임
커피
여행
개발
음악
영화
```

복잡한 프로필이나 회원가입은 없습니다.

### 2. Bring Your Own AI

서비스에서 별도의 LLM API를 호출하지 않습니다.

사용자가 이미 사용하고 있는 Claude 또는 ChatGPT가 MCP를 통해 질문을 생성합니다.

```text
Coffee Chat Web
        ↓
    Session Code
        ↓
Claude / ChatGPT
        ↓
   MCP Server
        ↓
   Questions
```

이를 통해 서버에서 별도의 LLM API Key나 토큰 비용을 사용하지 않는 구조를 실험합니다.

### 3. Roulette

생성된 질문을 목록으로 보여주지 않습니다.

질문들이 빠르게 지나가는 Roulette Animation 이후 하나의 질문을 선택합니다.

```text
🎰

게임 속 직업 하나를...
최근 재미있게 한...
인생 게임 OST...

↓

💬 오늘의 첫 질문

"인생 게임 OST 하나를 고른다면?"
```

`🎲 다시 돌리기`를 누르면 다른 질문을 뽑을 수 있습니다.

---

# User Flow

```text
페이지 접속
↓
단어 하나 입력
↓
질문 만들기
↓
세션 코드 발급
↓
Claude / ChatGPT에 요청
↓
AI가 질문 생성
↓
웹에서 질문 수신
↓
룰렛
↓
오늘의 첫 질문
↓
대화 시작
```

---

# MCP Flow

웹에서 키워드를 입력합니다.

```text
게임
```

세션 코드가 생성됩니다.

```text
ABCD
```

웹에서는 사용자에게 다음 문구를 제공합니다.

```text
커피챗 세션 ABCD 질문 만들어줘
```

사용자가 자신의 Claude 또는 ChatGPT에 해당 문장을 입력합니다.

AI는 Coffee Chat MCP를 통해 세션 정보를 확인합니다.

```text
get_request("ABCD")
```

AI가 해당 키워드에 어울리는 아이스브레이킹 질문을 생성한 뒤 다시 MCP를 통해 전달합니다.

```text
submit_questions(
  "ABCD",
  [
    "...",
    "...",
    "..."
  ]
)
```

웹은 질문이 도착하면 자동으로 Roulette 화면으로 전환합니다.

---

# Question Style

질문은 크게 두 가지 느낌을 섞습니다.

### Comfortable

누구나 부담 없이 답할 수 있는 질문.

```text
"최근 재미있게 한 게임이 있나요?"
```

### Unexpected

조금 예상 밖이지만 가볍게 대화를 이어갈 수 있는 질문.

```text
"내 인생에 게임 BGM을 하나 깔 수 있다면 어떤 곡인가요?"
```

목표는 깊은 대화를 강요하는 것이 아니라 **첫 30초의 어색함을 줄이는 것**입니다.

---

# Safety

처음 만난 사람과 사용하는 서비스이므로 질문은 가벼워야 합니다.

다음과 같은 질문은 생성하지 않습니다.

- 성적이거나 신체와 관련된 질문
- 연애 경험을 묻는 질문
- 연봉, 재산 등의 경제적 정보
- 나이, 학벌 등의 개인정보
- 결혼, 출산 등 가족 관련 질문
- 종교나 정치 성향
- 건강 및 질병
- 외모나 능력에 대한 평가
- 상대를 곤란하게 하거나 추궁하는 질문

안전 규칙은 AI에게 전달하고, 제출된 질문은 서버에서도 간단한 필터를 거칩니다.

---

# UI / UX

Coffee Chat Roulette는 독립된 AI 서비스처럼 보이기보다 **Growth Log의 새로운 네트워킹 Activity**처럼 디자인합니다.

전체적으로 Growth Log의 기존 페이지가 가진

```text
작은 영문 Section Label
+
큰 한국어 Headline
+
짧은 설명
+
명확한 CTA
```

구조를 사용합니다.

화면은 기능을 많이 보여주기보다 **현재 해야 할 행동 하나에 집중**합니다.

---

## 01. Landing / Keyword

```text
COFFEE CHAT

처음 만난 사람과
무슨 이야기를 할까요?

대화하고 싶은 주제를
하나만 입력해보세요.

┌──────────────────────┐
│ 게임                  │
└──────────────────────┘

[ 질문 만들기 → ]
```

### UX

첫 화면에서는 MCP나 AI 구조를 설명하지 않습니다.

사용자가 알아야 할 것은 단 하나입니다.

> **“단어 하나를 입력하세요.”**

입력창과 CTA가 화면의 중심이 됩니다.

하단에는 가볍게 예시를 제공합니다.

```text
AI · 여행 · 게임 · 커피 · 개발 · 음악
```

예시 키워드를 누르면 바로 Input에 들어가도록 합니다.

---

## 02. Waiting

```text
COFFEE CHAT

AI에게 질문을
부탁해볼까요?

SESSION
ABCD

아래 문장을 내 AI에게 보내주세요.

┌────────────────────────────┐
│ 커피챗 세션 ABCD 질문 만들어줘 │
└────────────────────────────┘

[ 문장 복사하기 ]

● 질문을 기다리고 있어요
```

### UX

기술적인 `MCP`, `Tool`, `Polling` 같은 표현은 일반 사용자 화면에서 숨깁니다.

대신 행동 중심으로 설명합니다.

```text
1. 문장을 복사하세요.
2. Claude / ChatGPT에 붙여넣으세요.
3. 이 화면으로 돌아오세요.
```

세션 코드 `ABCD`는 Growth Log의 숫자/KPI처럼 크고 명확하게 표현합니다.

대기 상태에는 과한 Spinner보다 작은 Pulse 또는 Dot Animation을 사용합니다.

---

## 03. Roulette

질문이 도착하면 사용자의 추가 입력 없이 자동으로 전환합니다.

```text
COFFEE CHAT

오늘 어떤 이야기가
나올까요?

        🎰

┌────────────────────────────┐
│ 게임 속 직업 하나를...       │
└────────────────────────────┘
```

질문 카드가 빠르게 교체되다가 점점 느려지고 하나에서 멈춥니다.

### UX

Roulette는 카지노 스타일로 만들지 않습니다.

Coffee Chat의 가벼운 재미만 전달합니다.

```text
빠르게 전환
↓
점점 느려짐
↓
Result Card에서 Stop
```

전체 애니메이션은 짧게 유지합니다.

---

## 04. Result

서비스에서 가장 중요한 화면입니다.

```text
TODAY'S QUESTION

오늘의 첫 질문

┌────────────────────────────┐
│                            │
│ "인생 게임 OST 하나를       │
│  고른다면 어떤 곡인가요?"   │
│                            │
└────────────────────────────┘

[ 🎲 다른 질문 뽑기 ]

새로운 주제로 시작하기
```

### UX

이 화면에서는 **질문이 Hero Content**입니다.

다른 UI보다 질문의 가독성을 가장 중요하게 봅니다.

질문은 큰 카드 안에서 충분한 여백을 갖고 표시합니다.

`다른 질문 뽑기`는 Primary Action.

`새로운 주제로 시작하기`는 Secondary Action으로 둡니다.

---

# Growth Log Style Direction

Coffee Chat 페이지는 Growth Log 본 서비스와 시각적으로 이어져야 합니다.

## Typography

Growth Log처럼

```text
COFFEE CHAT
작은 영문 Label

처음 만난 사람과
무슨 이야기를 할까요?
큰 한국어 Headline
```

형태의 Typography Hierarchy를 사용합니다.

텍스트를 많이 넣기보다 **짧은 문장을 크게 보여주는 방식**을 사용합니다.

---

## Layout

Desktop에서는 콘텐츠 폭을 제한하고 중앙에 배치합니다.

```text
┌──────────────────────────────────┐
│ Growth Log                       │
│                                  │
│          COFFEE CHAT             │
│                                  │
│       처음 만난 사람과            │
│       무슨 이야기를 할까요?        │
│                                  │
│       [ Keyword Input ]          │
│                                  │
│       [ 질문 만들기 → ]           │
│                                  │
└──────────────────────────────────┘
```

모바일에서는:

```text
Padding
↓
Label
↓
Headline
↓
Description
↓
Input / Card
↓
Primary CTA
```

한 열 구조를 유지합니다.

---

## Card

Growth Log의 활동/콘텐츠 카드처럼 질문과 세션을 하나의 명확한 영역으로 구분합니다.

카드는 장식 요소보다는

- 충분한 여백
- 명확한 Border
- 작은 Radius
- 강한 Typography

를 중심으로 구성합니다.

과도한 Glassmorphism, Gradient, Neon UI는 사용하지 않습니다.

---

## Color

별도의 Coffee Chat 브랜드 컬러를 만들지 않습니다.

Growth Log 본 사이트에서 사용하는

- Background
- Text
- Primary
- Muted
- Border

스타일을 그대로 가져오는 것을 원칙으로 합니다.

Coffee Chat의 `☕`, `🎲`, `💬` 등은 기능을 구분하는 작은 포인트로만 사용합니다.

---

## Motion

Animation 역시 최소한으로 사용합니다.

### 사용

- Button Hover
- Page Fade
- Waiting Pulse
- Roulette Text Transition
- Result Card 등장

### 사용하지 않음

- 과도한 Particle
- Confetti
- 3D Roulette
- 화면 전체가 움직이는 Animation

Growth Log의 차분한 커뮤니티 느낌 안에서 **Roulette 부분만 살짝 재미있게** 만드는 방향입니다.

---

# Responsive

행사장에서 스마트폰으로 사용하는 상황을 우선합니다.

### Mobile First

- 큰 Input
- 큰 CTA
- 한 손으로 누르기 쉬운 버튼
- 질문 카드 높은 가독성
- Scroll을 최소화
- 화면 하나에서 핵심 행동 하나만 제공

목표는 첫 화면 접속 후 설명을 읽지 않아도 사용할 수 있는 것입니다.

---

# Tech

| 영역 | 구성 |
|---|---|
| Web | HTML / CSS / JavaScript |
| AI | User's Claude / ChatGPT |
| Integration | Remote MCP |
| Session | Server Memory |
| Database | 없음 |
| LLM API | 없음 |
| Deploy | Static Web + MCP Server |

---

# PoC Scope

이번 PoC에서는 다음만 확인합니다.

- 단어 입력
- 세션 생성
- 사용자 AI와 MCP 연결
- AI 질문 생성
- 질문 웹 전달
- 안전 필터
- Roulette
- 다시 돌리기

다음 기능은 구현하지 않습니다.

- 회원가입 / 로그인
- 사용자 프로필
- 참가자 매칭
- 채팅
- History
- Database
- 서버 LLM API
- QR
- Networking Bingo

---

# Success

PoC가 성공하면 다음 경험이 완성됩니다.

```text
"게임"
↓
내 AI에게 질문 요청
↓
질문 5개 생성
↓
🎰
↓
"인생 게임 OST 하나를 고른다면?"
↓
첫 대화 시작
```

---

## Coffee Chat Roulette

**단어 하나로 첫 대화를 시작합니다.**

`GROW TOGETHER · TALK TOGETHER`

---

# 서버 실행 & 로컬 연결 테스트

## 서버 실행

```bash
cd server
npm install
npm start      # http://localhost:3000 (MCP: /mcp)
npm test       # 세션 → get_request → submit_questions → ready, 안전 필터 E2E
```

환경 변수: `PORT`(기본 `3000`), `WEB_ORIGIN`(CORS 허용 Origin, 기본 `*`).

## 테스트용 세션 만들기

웹 없이도 세션을 만들어 테스트할 수 있습니다.

```bash
curl -X POST -H 'Content-Type: application/json' \
  http://localhost:3000/session -d '{"word":"게임"}'
# → {"session":"ABCD"}

curl http://localhost:3000/session/ABCD
# AI가 제출하면 → {"status":"ready","questions":[...]}
```

## 공개 URL 열기 (claude.ai · ChatGPT용)

claude.ai와 ChatGPT는 클라우드에서 MCP 서버에 접속하므로 `localhost`에 바로 붙지 못합니다. 터널로 공개 HTTPS URL을 만듭니다.

```bash
npx cloudflared tunnel --url http://localhost:3000
# → https://xxxx.trycloudflare.com  (MCP URL: https://xxxx.trycloudflare.com/mcp)
```

터널을 다시 띄우면 URL이 바뀌므로 커넥터 URL도 다시 등록해야 합니다.

## AI별 연결

| AI | 연결 방법 | URL |
| --- | --- | --- |
| Claude Code | `claude mcp add --transport http coffee-chat http://localhost:3000/mcp` | localhost 가능 |
| Claude (claude.ai / Desktop) | Settings → Connectors → Add custom connector | 터널 `https://…/mcp` |
| ChatGPT | Settings → Apps & Connectors → Advanced → Developer mode 켜기 → Create, 인증 `No authentication` | 터널 `https://…/mcp` |
| Gemini CLI | `~/.gemini/settings.json` 또는 프로젝트 `.gemini/settings.json`에 아래 설정 | localhost 가능 |

```json
{
  "mcpServers": {
    "coffee-chat": { "httpUrl": "http://localhost:3000/mcp" }
  }
}
```

## 질문 생성 테스트

1. 위 curl 또는 웹에서 세션 코드를 발급합니다.
2. 연결한 AI에게 보냅니다.

   ```text
   커피챗 세션 ABCD 질문 만들어줘. 나는 백엔드 개발자고 보드게임을 좋아해.
   ```

   직무·관심사를 적으면 질문에 반영되고, 적지 않으면 AI가 한 번 물어봅니다. 이 정보는 서버에 저장되지 않습니다.
3. AI가 `get_request` → `submit_questions`를 호출하면 `GET /session/ABCD`가 `ready`로 바뀌고 웹이 룰렛으로 전환됩니다.
