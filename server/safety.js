const QUESTION_MAX_LENGTH = 200;

// ponytail: substring keyword match, misses paraphrases; the AI-side rules are the first line of defense.
export const BLOCKED_KEYWORDS = [
  // 성적·신체
  "섹스", "성관계", "야한", "몸매", "sex",
  // 연애
  "연애", "애인", "남자친구", "여자친구", "남친", "여친", "이상형", "첫사랑", "짝사랑", "소개팅", "데이트", "썸타",
  // 경제
  "연봉", "월급", "재산", "자산", "집값", "대출", "빚", "salary",
  // 나이·학벌
  "몇살", "나이가", "나이는", "나이를", "학번", "학벌", "출신학교", "대학어디",
  // 가족
  "결혼", "이혼", "출산", "임신", "자녀", "아이가있",
  // 종교·정치
  "종교", "교회", "신앙", "정치", "정당", "대통령",
  // 건강
  "질병", "병원", "아픈", "우울", "건강", "다이어트", "몸무게",
  // 외모·능력 평가
  "외모", "잘생", "예쁘", "못생", "뚱뚱", "키가몇", "못하는", "본인의단점", "약점이뭐",
  // 곤란·추궁
  "흑역사", "창피", "부끄러", "왜그랬",
];

function normalize(text) {
  return text.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

const NORMALIZED_KEYWORDS = BLOCKED_KEYWORDS.map(normalize);

export function isSafeQuestion(question) {
  if (typeof question !== "string") return false;
  const trimmed = question.trim();
  if (!trimmed || trimmed.length > QUESTION_MAX_LENGTH) return false;
  const normalized = normalize(trimmed);
  return !NORMALIZED_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function filterQuestions(questions) {
  const safe = [...new Set(questions.filter(isSafeQuestion).map((q) => q.trim()))];
  return { safe, filtered: questions.length - safe.length };
}
