# ☕ Coffee Chat Roulette

> 행사장에서 **“누구와 이야기해야 하지?”**, **“무슨 말을 걸어야 하지?”**를 해결하는 네트워킹 추천 서비스

Coffee Chat Roulette는 Growth Log와 같은 오프라인 커뮤니티 행사에서 참가자의 **직군, 관심사, 배우고 싶은 것, 도와줄 수 있는 것**을 기반으로 지금 만나면 좋은 사람을 추천해주는 서비스입니다.

단순 랜덤 매칭이 아니라, 사용자의 네트워킹 목적에 따라 후보를 필터링하고 **추천 이유와 대화 시작 주제까지 함께 제공**합니다.

---

## 🎯 Problem

오프라인 행사에는 다양한 사람들이 모이지만 실제 네트워킹은 생각보다 쉽게 발생하지 않습니다.

특히 처음 참가한 사람은 다음과 같은 어려움을 겪습니다.

- 누가 어떤 사람인지 알기 어렵습니다.
- 누구에게 먼저 말을 걸어야 할지 모르겠습니다.
- 처음 보는 사람에게 말을 걸 명분이 없습니다.
- 만나더라도 어떤 이야기를 시작해야 할지 어렵습니다.
- 결국 기존에 알고 있던 사람과만 이야기하게 됩니다.

즉,

> **사람이 없는 것이 아니라, 연결을 시작할 장치가 부족합니다.**

Coffee Chat Roulette는 이 문제를 해결합니다.

---

# 💡 Solution

사용자는 간단한 프로필 정보를 등록합니다.

```text
Role
Mobile

Interests
AI
Game
Side Project

Want to Learn
React
AI / LLM

Can Help
Unity
C#
Game Development
```

행사장에서 현재 원하는 네트워킹 목적을 선택합니다.

```text
오늘 어떤 사람을 만나고 싶나요?

[ 나와 다른 분야 ]
[ 관심사가 비슷한 사람 ]
[ 내가 배울 수 있는 사람 ]
[ 내가 도울 수 있는 사람 ]
[ 완전 랜덤 ]
```

서비스는 참가자 정보를 비교하여 조건에 맞는 사람을 추천합니다.

```text
☕ Today's Coffee Chat

김민수
Frontend Developer

Interests
AI · Side Project · Startup

Why this match?

✓ 당신과 다른 직군이에요.
✓ AI에 관심이 있어요.
✓ React를 알려줄 수 있어요.

Conversation Starter

"최근 AI를 프로젝트에서
어떻게 활용하고 계세요?"

[ ☕ 만났어요 ]
[ 🎲 다른 사람 ]
```

---

# 🔑 Core Concept

Coffee Chat Roulette의 핵심은 단순히 사람을 추천하는 것이 아닙니다.

```text
Discover
   ↓
Match
   ↓
Talk
   ↓
Connect
```

사용자가 실제 대화를 시작할 수 있도록 다음 세 가지를 제공합니다.

### 1. Who

누구를 만나면 좋은지 추천합니다.

### 2. Why

왜 이 사람을 추천했는지 알려줍니다.

### 3. What to Talk About

어떤 이야기를 시작하면 좋은지 알려줍니다.

---

# 👤 User Profile

사용자 입력은 자유 입력보다 **미리 준비된 태그 선택 방식**을 사용합니다.

행사장에서 빠르게 사용할 수 있고, 매칭 기준도 명확하게 유지할 수 있습니다.

---

## Role

사용자의 주요 직군입니다.

**1개만 선택합니다.**

```text
Frontend
Backend
Mobile
Game
AI
Designer
Product Manager
Marketing
Founder
Student
```

예시:

```text
Role

[ Frontend ]
[ Backend ]
[ Mobile ✓ ]
[ Game ]
[ AI ]
[ Design ]
```

---

# ❤️ Interests

현재 관심 있는 주제입니다.

> **“어떤 이야기를 좋아하는가?”**

최대 3개까지 선택합니다.

```text
AI
Side Project
Startup
Open Source
Career
Community
Game
Product
Automation
Content
```

예시:

```text
Interests

[ AI ✓ ]
[ Game ✓ ]
[ Side Project ✓ ]
```

---

# 📚 Want to Learn

현재 배우고 싶은 기술이나 분야입니다.

최대 2~3개를 선택합니다.

```text
React
Vue
Spring
Node.js
Unity
Flutter
Python
AI / LLM
AWS
Figma
UX
Product
Marketing
```

예시:

```text
Want to Learn

[ React ✓ ]
[ AI / LLM ✓ ]
```

---

# 🤝 Can Help

다른 사람에게 알려주거나 도움을 줄 수 있는 기술입니다.

`Want to Learn`과 같은 Skill Tag Pool을 사용합니다.

예시:

```text
Can Help

[ Unity ✓ ]
[ C# ✓ ]
[ Game Development ✓ ]
```

---

# 🧩 Profile Data

최종적으로 사용자의 프로필은 다음과 같은 형태로 저장합니다.

```js
{
  role: "Mobile",

  interests: [
    "AI",
    "Game",
    "Side Project"
  ],

  wantToLearn: [
    "React",
    "AI/LLM"
  ],

  canHelp: [
    "Unity",
    "C#",
    "Game Development"
  ]
}
```

MVP에서는 `localStorage`에 저장합니다.

---

# 🎯 Networking Goals

Roulette를 실행하기 전에 사용자가 현재 원하는 네트워킹 목적을 선택합니다.

---

## 1. 나와 다른 분야

다른 직군의 참가자를 추천합니다.

```text
My Role
Mobile

↓

Other Role
Frontend
Backend
Design
AI
...
```

기본 조건:

```js
me.role !== other.role
```

추가로 공통 관심사가 있는 사람에게 높은 점수를 줄 수 있습니다.

예:

```text
나
Mobile
AI 관심

상대
Backend
AI 관심

→ 다른 직군 + 공통 관심사
```

---

# 2. 관심사가 비슷한 사람

두 사용자의 `interests`를 비교합니다.

```text
나

AI
Game
Side Project

상대

AI
Startup
Side Project
```

교집합:

```text
AI
Side Project
```

따라서:

```text
Common Interests: 2
```

공통 관심사가 많은 사람일수록 높은 점수를 받습니다.

---

# 3. 내가 배울 수 있는 사람

내가 배우고 싶은 것과 상대가 도와줄 수 있는 것을 비교합니다.

```text
My Want to Learn
        ↓
Other Can Help
```

예:

```text
나

Want to Learn
React
AI

상대

Can Help
React
TypeScript
```

결과:

```text
React Match
```

추천 이유:

```text
✓ React 경험을 공유받을 수 있어요.
```

---

# 4. 내가 도울 수 있는 사람

내가 도와줄 수 있는 것과 상대가 배우고 싶은 것을 비교합니다.

```text
My Can Help
       ↓
Other Want to Learn
```

예:

```text
나

Can Help
Unity
Game Development

상대

Want to Learn
Game Development
React
```

결과:

```text
Game Development Match
```

추천 이유:

```text
✓ 당신의 Game Development 경험이 도움이 될 수 있어요.
```

---

# 5. 완전 랜덤

아직 만나지 않은 참가자 중 한 명을 랜덤으로 추천합니다.

```text
Participants
    ↓
Exclude visited users
    ↓
Random
```

새로운 사람을 우연히 만날 수 있는 Roulette의 재미를 유지합니다.

---

# 🧮 Matching Logic

복잡한 AI 추천 시스템 대신 Rule Based Matching을 사용합니다.

예:

```js
score =
  commonInterestCount * 2 +
  learnMatchCount * 3 +
  helpMatchCount * 3 +
  differentRoleBonus;
```

예를 들어:

```text
민수

공통 관심사 2개
+4

배울 수 있는 기술 1개
+3

내가 도울 수 있는 기술 1개
+3

다른 직군
+1

Total
11
```

---

# 🎲 Why Roulette?

가장 높은 점수를 가진 사람을 무조건 추천하지 않습니다.

상위 후보를 만든 뒤 그중 한 명을 랜덤으로 추천합니다.

```text
Candidates

민수     11
지윤      9
현우      8
Alex      3
```

상위 3명:

```text
민수
지윤
현우
```

그중 랜덤 선택:

```js
const candidates = rankedMembers.slice(0, 3);

const selected =
  candidates[
    Math.floor(Math.random() * candidates.length)
  ];
```

이를 통해

```text
Matching
+
Randomness
```

두 가지 경험을 동시에 제공합니다.

---

# 💬 Conversation Starter

사람만 추천하면 사용자는 다시 고민하게 됩니다.

> “그래서 무슨 이야기를 하지?”

Coffee Chat Roulette는 상대방의 관심사를 기반으로 대화 시작 질문도 제공합니다.

---

## AI

```text
최근 AI를 실제 업무에서
어떻게 활용하고 계세요?
```

```text
요즘 가장 관심 있게 보고 있는
AI 기술이 있나요?
```

---

## Side Project

```text
최근 진행하고 있는
사이드 프로젝트가 있나요?
```

```text
요즘 만들어보고 싶은
서비스가 있으세요?
```

---

## Career

```text
요즘 커리어에서
가장 고민하고 있는 게 있나요?
```

---

## Design

```text
최근 인상 깊었던
서비스 UX가 있나요?
```

---

## Game

```text
최근 재미있게 플레이한
게임이 있나요?
```

---

# Conversation Starter Data

LLM 없이 미리 준비된 질문을 사용합니다.

```js
const conversationStarters = {
  AI: [
    "최근 AI를 실제 업무에서 어떻게 활용하고 계세요?",
    "요즘 가장 관심 있게 보고 있는 AI 기술이 있나요?"
  ],

  "Side Project": [
    "최근 진행 중인 사이드 프로젝트가 있나요?",
    "만들어보고 싶은 서비스가 있으세요?"
  ],

  Career: [
    "요즘 커리어에서 가장 고민하고 있는 게 있나요?"
  ],

  Game: [
    "최근 재미있게 플레이한 게임이 있나요?"
  ]
};
```

상대방의 관심사 중 하나를 선택하여 질문을 보여줍니다.

---

# 🔍 Why This Match?

추천 결과에서는 단순한 Match Score보다 **추천 이유**를 보여주는 것이 중요합니다.

Bad:

```text
92% Match
```

Better:

```text
Why this match?

✓ 당신과 다른 직군이에요.
✓ AI에 관심이 같아요.
✓ React를 알려줄 수 있어요.
```

사용자가 추천 결과를 이해할 수 있어야 실제 행동으로 이어질 가능성이 높습니다.

---

# ☕ Connected

실제로 상대방과 대화한 뒤:

```text
[ ☕ 만났어요 ]
```

버튼을 선택합니다.

해당 참가자는 오늘 만난 사람으로 기록됩니다.

```js
visitedMemberIds.push(member.id);
```

다음 Roulette에서는 제외됩니다.

```text
All Members
     ↓
Exclude Connected Members
     ↓
Matching
     ↓
Recommendation
```

---

# 💾 Local Storage

MVP에서는 Backend 없이 브라우저에 정보를 저장합니다.

```js
localStorage.setItem(
  "coffee-chat-profile",
  JSON.stringify(profile)
);
```

만난 사람:

```js
localStorage.setItem(
  "coffee-chat-history",
  JSON.stringify(history)
);
```

GitHub Pages만으로 서비스 전체를 실행할 수 있습니다.

---

# 📊 Today's Connections

사용자가 오늘 누구를 만났는지 보여줍니다.

```text
Today's Connections

☕ 4 Coffee Chats

민수
Backend / AI

지윤
Designer / UX

현우
Frontend / React

유진
Product / Startup
```

간단한 통계도 표시할 수 있습니다.

```text
4 New Connections

3 Different Roles

6 Shared Interests
```

---

# 🖥 User Flow

전체 사용자 흐름입니다.

```text
START

↓

Profile Setup

Role
Interest
Want to Learn
Can Help

↓

Select Networking Goal

↓

Matching

↓

Coffee Chat Result

↓

Why This Match?

↓

Conversation Starter

↓

Meet Offline

↓

"만났어요"

↓

Save Connection

↓

Next Coffee Chat
```

---

# 🔄 Application State

애플리케이션 상태 흐름은 다음과 같습니다.

```text
INIT

↓

PROFILE_SETUP

↓

SELECT_GOAL

↓

MATCHING

↓

RESULT

├── REROLL
│      ↓
│   MATCHING
│
└── CONNECTED
       ↓
   SAVE_HISTORY
       ↓
    SUMMARY
       ↓
   SELECT_GOAL
```

---

# 📱 Screens

MVP에서는 화면을 최대한 작게 구성합니다.

---

## Screen 1 — Profile

```text
Tell us about you

Role
[ Mobile ]

Interests
[ AI ] [ Game ] [ Side Project ]

Want to Learn
[ React ] [ AI ]

Can Help
[ Unity ] [ C# ]

[ Start Networking ]
```

---

# Screen 2 — Networking Goal

```text
Who do you want to meet?

[ 다른 분야 ]

[ 관심사가 비슷한 사람 ]

[ 내가 배울 수 있는 사람 ]

[ 내가 도울 수 있는 사람 ]

[ 🎲 Surprise Me ]
```

---

# Screen 3 — Roulette

```text
          ☕

Finding your
Coffee Chat...

민수
지윤
현우
Alex
...
```

카드가 빠르게 바뀌거나 셔플되는 간단한 애니메이션을 사용합니다.

---

# Screen 4 — Result

```text
☕ Today's Coffee Chat

김민수

Backend / AI

AI · LLM · Side Project


Why this match?

✓ 당신과 다른 직군
✓ AI 공통 관심사
✓ React 경험 보유


Conversation Starter

"최근 AI를 프로젝트에
어떻게 활용하고 계세요?"


[ ☕ 만났어요 ]

[ 🎲 다른 사람 ]
```

---

# Screen 5 — History

```text
Today's Connections

☕ 3 People

민수
Backend

지윤
Designer

현우
Frontend


[ Find Next Coffee Chat ]
```

---

# 🗃 Mock Member Data

100분 해커톤에서는 실제 Growth Log 회원 DB 대신 Mock Data를 사용합니다.

```js
const members = [
  {
    id: 1,
    name: "민수",
    role: "Backend",

    interests: [
      "AI",
      "Side Project"
    ],

    wantToLearn: [
      "Product",
      "Game Development"
    ],

    canHelp: [
      "Spring",
      "AWS",
      "AI/LLM"
    ]
  },

  {
    id: 2,
    name: "지윤",
    role: "Designer",

    interests: [
      "Product",
      "Community",
      "AI"
    ],

    wantToLearn: [
      "Frontend"
    ],

    canHelp: [
      "Figma",
      "UX"
    ]
  },

  {
    id: 3,
    name: "현우",
    role: "Frontend",

    interests: [
      "Open Source",
      "AI",
      "Startup"
    ],

    wantToLearn: [
      "AI/LLM",
      "AWS"
    ],

    canHelp: [
      "React",
      "TypeScript"
    ]
  }
];
```

약 **10~20명의 참가자 데이터**만 준비해도 충분히 자연스러운 데모가 가능합니다.

---

# 🏷 Tag Design

태그는 너무 많이 제공하지 않습니다.

태그가 많으면 입력 시간이 길어지고 매칭 결과 역시 의미가 약해집니다.

MVP 권장값:

```text
Role
1개

Interest
최대 3개

Want to Learn
최대 2개

Can Help
최대 2개
```

전체 입력을 **30초 안에 완료할 수 있는 수준**으로 유지합니다.

---

# ⚠️ Interest vs Skill

Interest와 Skill은 명확하게 구분합니다.

### Interest

```text
무슨 이야기를 좋아하는가?
```

예:

```text
AI
Startup
Game
Community
Side Project
```

### Skill

```text
무엇을 배우거나
알려줄 수 있는가?
```

예:

```text
React
Spring
Unity
AWS
Figma
AI / LLM
```

따라서 `Want to Learn`과 `Can Help`는 동일한 Skill Pool을 공유합니다.

```js
const skillTags = [
  "React",
  "Spring",
  "Unity",
  "Flutter",
  "Python",
  "AI/LLM",
  "AWS",
  "Figma",
  "UX",
  "Product",
  "Marketing"
];
```

---

# 🛠 Tech Stack

GitHub Pages 정적 배포를 기준으로 합니다.

```text
Frontend
HTML / CSS / JavaScript

or

Vite
React
TypeScript
```

Backend:

```text
None
```

Database:

```text
None
```

Data:

```text
Mock JSON
+
localStorage
```

---

# ⏱ 100-Minute Hackathon Scope

## 0 ~ 15 min

UI 및 기본 레이아웃

- Profile
- Networking Goal
- Result Card

---

## 15 ~ 30 min

Mock Member Data

- 10~20명
- Role
- Interests
- Want to Learn
- Can Help

---

## 30 ~ 50 min

Matching Logic

```text
Goal
↓
Filter
↓
Score
↓
Top Candidates
↓
Random
```

---

## 50 ~ 65 min

Result UI

- Profile
- Why This Match
- Conversation Starter

---

## 65 ~ 75 min

Connection History

- `만났어요`
- 이미 만난 사용자 제외
- localStorage

---

## 75 ~ 90 min

UX / Animation

- Roulette
- Card Transition
- Connection Complete

---

## 90 ~ 100 min

GitHub Pages Deploy

- 모바일 확인
- 데모 시나리오 테스트
- 발표 준비

---

# ✅ MVP

100분 안에 다음 기능만 완성하는 것을 목표로 합니다.

### Must

- [x] 프로필 태그 선택
- [x] Networking Goal 선택
- [x] 참가자 매칭
- [x] Roulette 추천
- [x] Why This Match
- [x] Conversation Starter
- [x] 만난 사람 저장
- [x] 이미 만난 사람 제외

### Nice to Have

- [ ] Coffee Chat 횟수
- [ ] Networking Level
- [ ] Roulette Animation
- [ ] Networking Bingo
- [ ] QR Profile
- [ ] 행사별 참가자 Pool

---

# ❌ Out of Scope

100분 MVP에서는 다음 기능을 구현하지 않습니다.

- 로그인
- 회원가입
- 실제 Growth Log 회원 DB
- Backend
- 실시간 채팅
- 메시지 전송
- AI 기반 추천
- QR Scanner
- 실제 위치 기반 추천
- 복잡한 추천 알고리즘

---

# 🚀 Future

해커톤 이후 실제 서비스로 발전시킨다면 다음 기능을 추가할 수 있습니다.

---

## Growth Log Profile Integration

```text
Growth Log Profile

↓

Role
Skills
Interests

↓

Coffee Chat Matching
```

기존 Growth Log 프로필을 그대로 매칭 데이터로 활용합니다.

---

## Event Participant Pool

행사에 체크인한 사람만 추천합니다.

```text
Growth Log Meetup #12

28 People Here

↓

Coffee Chat Roulette
```

---

## QR Connection

상대방과 실제로 만났을 때 QR을 스캔합니다.

```text
Meet

↓

QR Scan

↓

Connection Complete
```

---

## Networking Bingo

Coffee Chat과 네트워킹 미션을 연결합니다.

```text
Mission

"다른 직군의 사람 만나기"

↓

Coffee Chat Roulette

↓

Designer 추천

↓

Meet

↓

Mission Complete
```

---

## Need / Offer Matching

Skill Exchange를 더 강화할 수 있습니다.

```text
You

Need
React

Offer
Unity


Alex

Need
Game Development

Offer
React


↓

Perfect Coffee Chat

React ↔ Unity
```

---

# 🎤 Demo Scenario

발표에서는 기능 설명보다 문제 상황으로 시작합니다.

```text
“커뮤니티 행사에 왔습니다.

주변에 30명이 있지만
아는 사람은 한 명도 없습니다.

누구에게 말을 걸어야 할까요?”
```

Coffee Chat Roulette 실행.

```text
오늘 만나고 싶은 사람

[ 나와 다른 분야 ]
```

Roulette:

```text
☕

Finding someone...
```

Result:

```text
김민수

Backend Developer


Why this match?

✓ 당신은 Mobile Developer
✓ 민수님은 Backend Developer
✓ 두 사람 모두 AI에 관심이 있습니다.
```

Conversation Starter:

```text
“최근 AI를 실제 프로젝트에서
어떻게 활용하고 계세요?”
```

대화 후:

```text
[ ☕ 만났어요 ]
```

결과:

```text
🎉 New Connection

1 Coffee Chat Completed
```

---

# 🌱 Why Growth Log?

Growth Log에는 이미 다양한 분야의 사람들이 모여 있습니다.

하지만 좋은 사람들이 한 공간에 존재하는 것과 실제 연결이 만들어지는 것은 다른 문제입니다.

Coffee Chat Roulette는

```text
People
↓
Discovery
↓
Conversation
↓
Connection
```

이라는 흐름을 만들어줍니다.

---

# ✨ Final Message

> **Coffee Chat Roulette는 사람을 랜덤으로 뽑는 서비스가 아닙니다.**

> **지금 나에게 의미 있는 사람을 발견하고, 실제 대화를 시작할 수 있도록 도와주는 네트워킹 도구입니다.**

### Discover → Talk → Connect

**Coffee Chat Roulette ☕**
