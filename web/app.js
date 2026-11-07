const API_BASE_URL = "http://localhost:3000";
const POLL_INTERVAL_MS = 2000;
const MAX_KEYWORD_LENGTH = 20;
const MOCK_READY_DELAY_MS = 2500;
const MOCK_SESSION_CODE = "TST7";
const MOCK_SCENARIO = new URLSearchParams(window.location.search).get("mock");
const MOCK_SCENARIOS = new Set(["1", "ready", "empty", "expired"]);
const IS_MOCK_MODE = MOCK_SCENARIOS.has(MOCK_SCENARIO);

const AppState = Object.freeze({
  INPUT: "input",
  WAITING: "waiting",
  ROULETTE: "roulette",
  RESULT: "result",
  ERROR: "error"
});

const screens = [...document.querySelectorAll("[data-screen]")];
const keywordForm = document.querySelector("#keyword-form");
const keywordInput = document.querySelector("#keyword-input");
const keywordError = document.querySelector("#keyword-error");
const createSessionButton = document.querySelector("#create-session-button");
const sessionCode = document.querySelector("#session-code");
const aiPrompt = document.querySelector("#ai-prompt");
const copyPromptButton = document.querySelector("#copy-prompt-button");
const copyFeedback = document.querySelector("#copy-feedback");
const rouletteQuestion = document.querySelector("#roulette-question");
const resultQuestion = document.querySelector("#result-question");
const rerollButton = document.querySelector("#reroll-button");
const restartButton = document.querySelector("#restart-button");
const errorTitle = document.querySelector("#error-title");
const errorMessage = document.querySelector("#error-message");
const errorRetryButton = document.querySelector("#error-retry-button");

let currentState = AppState.INPUT;
let currentSession = "";
let questions = [];
let selectedQuestion = "";
let pollTimerId = null;
let rouletteRunId = 0;
let mockSession = null;

function setAppState(nextState) {
  currentState = nextState;

  for (const screen of screens) {
    screen.hidden = screen.dataset.screen !== nextState;
  }

  if (nextState !== AppState.WAITING) stopPolling();
}

function setKeywordError(message) {
  keywordError.textContent = message;
  keywordInput.setAttribute("aria-invalid", String(Boolean(message)));
}

function validateKeyword(value) {
  const word = value.trim();

  if (!word) return "대화하고 싶은 주제를 입력해주세요.";
  if (word.length > MAX_KEYWORD_LENGTH) return `키워드는 ${MAX_KEYWORD_LENGTH}자 이내로 입력해주세요.`;

  return "";
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (response.ok) return data;

  const error = new Error(data.message || "요청을 처리하지 못했습니다.");
  error.code = data.error;
  error.status = response.status;
  throw error;
}

async function createSession(word) {
  if (IS_MOCK_MODE) return createMockSession(word);

  const response = await fetch(`${API_BASE_URL}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word })
  });

  return parseResponse(response);
}

async function getSession(code) {
  if (IS_MOCK_MODE) return getMockSession(code);

  const response = await fetch(`${API_BASE_URL}/session/${encodeURIComponent(code)}`);
  return parseResponse(response);
}

async function createMockSession(word) {
  const createdAt = Date.now();

  mockSession = {
    code: MOCK_SESSION_CODE,
    word,
    tone: "신박",
    count: 5,
    rules: [],
    questions: createMockQuestions(word),
    createdAt,
    readyAt: createdAt + MOCK_READY_DELAY_MS
  };

  await delay(250);
  return { session: mockSession.code };
}

async function getMockSession(code) {
  await delay(100);

  if (!mockSession || mockSession.code !== code) {
    const error = new Error("Session not found.");
    error.code = "SESSION_NOT_FOUND";
    error.status = 404;
    throw error;
  }

  if (Date.now() < mockSession.readyAt) {
    return { status: "waiting", questions: [] };
  }

  if (MOCK_SCENARIO === "empty") {
    return { status: "empty", questions: [] };
  }

  if (MOCK_SCENARIO === "expired") {
    return { status: "expired", questions: [] };
  }

  return { status: "ready", questions: mockSession.questions };
}

function createMockQuestions(word) {
  return [
    `${word}와 관련해 요즘 가장 재미있었던 순간은 무엇인가요?`,
    `처음 ${word}에 관심을 갖게 된 계기가 있나요?`,
    `${word}를 하루 동안 마음껏 즐긴다면 무엇을 하고 싶나요?`,
    `${word} 초보자에게 하나만 추천한다면 무엇인가요?`,
    `${word}에 어울리는 배경음악을 고른다면 어떤 곡인가요?`
  ];
}

async function handleCreateSession(event) {
  event.preventDefault();

  const word = keywordInput.value.trim();
  const validationMessage = validateKeyword(word);
  setKeywordError(validationMessage);

  if (validationMessage) {
    keywordInput.focus();
    return;
  }

  createSessionButton.disabled = true;
  createSessionButton.textContent = "세션을 만들고 있어요…";

  try {
    const data = await createSession(word);

    if (!data.session) throw new Error("세션 코드를 받지 못했습니다.");

    currentSession = data.session;
    sessionCode.textContent = currentSession;
    aiPrompt.textContent = `커피챗 세션 ${currentSession} 질문 만들어줘`;
    copyFeedback.textContent = "";
    setAppState(AppState.WAITING);
    startPolling();
  } catch (error) {
    showError("세션을 만들지 못했어요", getErrorMessage(error));
  } finally {
    createSessionButton.disabled = false;
    createSessionButton.innerHTML = '질문 만들기 <span aria-hidden="true">→</span>';
  }
}

function startPolling() {
  stopPolling();
  pollTimerId = window.setTimeout(pollSession, POLL_INTERVAL_MS);
}

function stopPolling() {
  if (pollTimerId === null) return;

  window.clearTimeout(pollTimerId);
  pollTimerId = null;
}

async function pollSession() {
  if (currentState !== AppState.WAITING || !currentSession) return;

  try {
    const data = await getSession(currentSession);

    if (data.status === "waiting") {
      pollTimerId = window.setTimeout(pollSession, POLL_INTERVAL_MS);
      return;
    }

    if (data.status === "ready" && Array.isArray(data.questions) && data.questions.length > 0) {
      questions = data.questions;
      runRoulette();
      return;
    }

    if (data.status === "empty") {
      showError("안전한 질문이 없어요", "다른 키워드로 새로운 질문을 만들어주세요.");
      return;
    }

    if (data.status === "expired") {
      showError("세션이 만료됐어요", "새로운 키워드로 다시 시작해주세요.");
      return;
    }

    showError("질문을 불러오지 못했어요", "알 수 없는 응답을 받았습니다. 다시 시작해주세요.");
  } catch (error) {
    showError("질문을 불러오지 못했어요", getErrorMessage(error));
  }
}

function getErrorMessage(error) {
  if (error.status === 404) return "세션을 찾을 수 없습니다. 새로운 세션을 만들어주세요.";
  if (error.status === 410) return "세션이 만료됐습니다. 새로운 세션을 만들어주세요.";
  if (error instanceof TypeError) return "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";

  return error.message || "잠시 후 다시 시도해주세요.";
}

function showError(title, message) {
  errorTitle.textContent = title;
  errorMessage.textContent = message;
  setAppState(AppState.ERROR);
}

function chooseQuestion() {
  const candidates = questions.length > 1
    ? questions.filter((question) => question !== selectedQuestion)
    : questions;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

function delay(duration) {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

async function runRoulette() {
  if (questions.length === 0) {
    showError("질문이 도착하지 않았어요", "새로운 키워드로 다시 시작해주세요.");
    return;
  }

  const runId = ++rouletteRunId;
  const targetQuestion = chooseQuestion();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const frameDelays = reducedMotion ? [] : [65, 70, 80, 90, 105, 125, 150, 190, 240];

  setAppState(AppState.ROULETTE);

  for (let index = 0; index < frameDelays.length; index += 1) {
    if (runId !== rouletteRunId) return;

    rouletteQuestion.textContent = questions[index % questions.length];
    await delay(frameDelays[index]);
  }

  if (runId !== rouletteRunId) return;

  selectedQuestion = targetQuestion;
  rouletteQuestion.textContent = targetQuestion;
  resultQuestion.textContent = targetQuestion;
  await delay(reducedMotion ? 0 : 260);

  if (runId === rouletteRunId) setAppState(AppState.RESULT);
}

async function copyPrompt() {
  const prompt = aiPrompt.textContent;

  try {
    await navigator.clipboard.writeText(prompt);
    copyFeedback.textContent = "복사했어요. 내 AI에게 붙여넣어 주세요.";
    copyPromptButton.textContent = "복사 완료";
    window.setTimeout(() => {
      copyPromptButton.textContent = "문장 복사하기";
    }, 1600);
  } catch {
    copyFeedback.textContent = "복사하지 못했어요. 문장을 길게 눌러 직접 복사해주세요.";
  }
}

function resetApp() {
  rouletteRunId += 1;
  currentSession = "";
  questions = [];
  selectedQuestion = "";
  mockSession = null;
  keywordForm.reset();
  setKeywordError("");
  setAppState(AppState.INPUT);
  keywordInput.focus();
}

function handleKeywordChip(event) {
  keywordInput.value = event.currentTarget.dataset.keyword;
  setKeywordError("");
  keywordInput.focus();
}

keywordForm.addEventListener("submit", handleCreateSession);
keywordInput.addEventListener("input", () => setKeywordError(""));
copyPromptButton.addEventListener("click", copyPrompt);
rerollButton.addEventListener("click", runRoulette);
restartButton.addEventListener("click", resetApp);
errorRetryButton.addEventListener("click", resetApp);
document.querySelectorAll(".keyword-chip").forEach((chip) => {
  chip.addEventListener("click", handleKeywordChip);
});
window.addEventListener("beforeunload", stopPolling);
