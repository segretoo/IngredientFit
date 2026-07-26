# 학술적 근거 (Research Grounding)

성분핏의 개인화 설계는 추천시스템·대화형 추천·성분 데이터 3개 분야의 논문에 근거한다.
아래 논문 3편은 서비스 설계 방향을 뒷받침하는 근거 자료다. 발표·보고서에서
"왜 이렇게 만들었나"를 설명할 때 이 문서를 참고한다.

> 함께 보기: [`RELATED_WORK.md`](RELATED_WORK.md)(유사 서비스·선행 연구 조사),
> [`PROPOSAL_SKIN_PROFILE.md`](PROPOSAL_SKIN_PROFILE.md)(피부타입 프로필 제안서).
> 이 문서는 위 논문 3편 기준 매핑이고, 위 두 문서는 경쟁 서비스·추가 선행 연구를 다룬다.

## 참고 논문

| 약칭 | 논문 |
|---|---|
| **Gao 2021** | Advances and Challenges in Conversational Recommender Systems: A Survey (Gao et al., 2021) |
| **Lin 2023** | How Can Recommender Systems Benefit from Large Language Models: A Survey (Lin et al., 2023) |
| **CPDat 2018** | The Chemical and Products Database (CPDat), a resource for exposure-relevant data on chemicals in consumer products (Dionisio et al., Scientific Data, 2018) |

## 설계 결정 ↔ 논문 매핑

| 성분핏 기능 | 근거 논문 | 개념 |
|---|---|---|
| 피부타입 설문(4문항) | Gao 2021 §2 | **Question-based Preference Elicitation** — item이 아니라 attribute/user profile을 물어 선호를 명시적으로 끌어냄 |
| 프로필로 신규 사용자 대응 | Gao 2021 §1 | **Cold-start** — 이력 없는 사용자도 프로필로 즉시 개인화 |
| 프로필을 추천 피처로 주입 | Lin 2023 §3.1.1 | **User-level Feature Augmentation** (KAR/CUP) — 구조화된 사용자 지식을 추천 피처로 |
| 대화형 4단계 추천 | Gao 2021 §1 · Lin 2023 §3.4 | **Multi-turn CRS / User Interaction** — 여러 턴에 걸쳐 선호를 좁혀감 |
| 👍/👎 피드백 루프(설계) | Gao 2021 §1, §4 | **Interactive Rec / Exploitation-Exploration** — 각 추천 뒤 feedback signal로 다음 추천 조정 |
| refPosition 배치 점수 | **CPDat 2018** | 퍼스널케어 제품은 법적으로 **함량 내림차순 기재 의무** → 기재 순서로 함량(weight fraction) 예측 가능 |
| 데이터 확보(공공 DB) | **CPDat 2018** | EPA CompTox의 성분·함량·기능적 용도 **공개 DB** — 크롤링 없이 합법 확보 |
| AI는 계산 안 하고 분류·설명만 | Lin 2023 §3 | LLM을 Feature Engineering(분류)·설명 생성에만 써서 **환각 회피** |

## 핵심 논지 3가지

### 1. 피부타입 프로필 = 질문 기반 선호 유도 (Gao 2021)

정적 추천은 "사용자가 무엇을 좋아하는가"를 과거 이력에서 암묵적으로 추정한다.
대화형 추천(CRS)은 **질문으로 선호를 직접 끌어낸다**(Gao 2021 §2, Question-based
Preference Elicitation). 성분핏의 피부타입 설문이 정확히 이것 — 얼굴 촬영 같은 복잡한
장치 없이, 4개 질문으로 사용자 attribute(유수분·민감도)를 명시적으로 수집한다.
이력이 전혀 없는 신규 사용자(**cold-start**, Gao 2021 §1)도 즉시 개인화된다.

구현: `lib/skinProfile.ts`의 `SKIN_QUESTIONS` → `resolveSkinProfile` →
`applySkinTypePreference`가 성분 순서를 재정렬. 안전장치(`lib/safety.ts`) 다음에
적용되어 안전 제외를 되돌리지 않는다(순서 고정: 안전 > 피부타입).

### 2. 피드백 학습 = 인터랙티브 추천의 feedback signal (Gao 2021) — 설계 단계

Gao 2021 §1은 인터랙티브 추천에서 "각 추천 뒤에 사용자가 그 추천을 얼마나 좋아하는지
feedback signal이 따라온다"고 설명하고, §4에서 **탐색-활용 트레이드오프(E&E)** 를
핵심 과제로 든다. 성분핏의 "이 추천 만족했나요? 👍/👎"가 이 feedback signal이다.

단계적 설계(정직하게):
1. **수집** — 결과 카드에서 👍/👎를 localStorage `ingredientfit:feedback`에 누적.
   로그인 붙으면 `recommendation_feedback` 테이블(`lib/supabase/schema.sql`)로 이관.
2. **개인별 재순위** — 이 사용자가 👎한 `(성분, 제품)`은 다음 추천에서 하향.
   `applySkinTypePreference` **다음 단계**로 체이닝(순서: 안전 > 피부타입 > 피드백).
   신규 후보엔 페널티 없음 = Gao의 **exploration** 여지 유지.
3. **집계 기반 개선(미래)** — 사용자가 쌓이면 "이 성분+피부타입 조합의 만족도"를
   전역 신호로 집계해 진짜 알고리즘 개선.

한계 명시: 현재는 단일 사용자 로컬 신호라 통계적 학습이 아니다. 이번 라운드는
**스키마·설계까지만** 구현했고 실제 수집/재순위 코드는 다음 단계다.

### 3. refPosition = 함량 순서 기재 의무의 학술적 근거 (CPDat 2018)

성분핏 가성비 점수의 60%를 차지하는 "전성분 배치 점수"는 **CPDat 2018이 학술적으로
뒷받침한다**. CPDat은 "퍼스널케어 제품은 법적으로 성분을 함량 내림차순으로 기재해야
하므로(mandated by law to list ingredients in decreasing weight fraction order),
기재 순서에 모델을 적용해 각 성분의 함량(5th~95th percentile weight fraction)을
예측했다"고 명시한다.

즉 성분핏이 "기재 순서로 함량을 추정한다"는 접근은 EPA 연구진이 실제로 쓴 방법과
같다. 동시에 CPDat(EPA CompTox Dashboard)은 성분·함량·기능적 용도를 담은 **공개
DB**라, 크롤링 없이 합법적으로 데이터를 확보할 수 있는 출처다(→ README 데이터 확보
전략의 학술적 보강).

> 관련: `docs/FEEDBACK.md`(교수님 피드백 반영 기록)의 "전성분 기재 순서의 법적 한계와
> 보정 장치" 항목과 이어진다. 1% 이하 성분은 순서 무관 기재가 가능하다는 한계는
> refPosition(성분별 기준위치)으로 보정한다.
