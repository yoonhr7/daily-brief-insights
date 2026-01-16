# 디버깅 가이드

## 노션 저장 문제 해결

노션에 인사이트가 저장되지 않는 문제를 해결하기 위해 상세한 로그를 추가했습니다.

### 테스트 실행

```bash
npm run test:news
```

### 확인할 로그 포인트

테스트를 실행하면 다음과 같은 순서로 로그가 출력됩니다:

#### 1️⃣ 뉴스 수집 단계
```
[economy] Starting analysis...
[economy] Fetched 15 articles
```
- ✅ 기사가 수집되었는지 확인
- ❌ 0개인 경우 → Google News/Naver API 문제

#### 2️⃣ LLM 분석 단계
```
[LLM Economy] Analyzing 15 articles with Gemini...
[LLM Economy] Analyzing 환율 with 8 articles...
[LLM Economy] Requesting Gemini analysis for 환율...
[LLM Economy] Received response (1234 chars)
[LLM Economy] Successfully parsed 환율 analysis
[LLM Economy] Title: 📌 환율 상승세, 1,400원 돌파 [연합뉴스·KBS 등 15건]
[LLM Economy] Created insight for 환율
[LLM Economy] Generated 3 insights
```
- ✅ Gemini API 응답을 받았는지 확인
- ✅ JSON 파싱이 성공했는지 확인
- ✅ 인사이트가 생성되었는지 확인
- ❌ 에러 메시지가 있는지 확인

#### 3️⃣ 노션 저장 단계
```
[economy] Generated 3 insights
[economy] Attempting to save 3 insights to Notion...
[economy] Saving insight 1/3: 📌 환율 상승세, 1,400원 돌파 [연합뉴스·KBS 등 15건]
[Notion] Preparing to save insight: 📌 환율 상승세, 1,400원 돌파 [연합뉴스·KBS 등 15건]
[Notion] Mapped properties: { ... }
[Notion] Successfully created page
[economy] ✓ Successfully saved insight 1
```
- ✅ 노션 API 호출이 성공했는지 확인
- ❌ 에러 메시지가 있는지 확인

### 자주 발생하는 문제

#### A. Gemini API 키 에러
```
Error: GEMINI_API_KEY must be set
```
**해결**: `.env` 파일에 `GEMINI_API_KEY` 추가

#### B. 노션 속성 에러
```
[Notion] Error message: body failed validation: body.properties.쉬운설명.rich_text should be defined...
```
**해결**: 노션 데이터베이스에 `쉬운설명` 속성(Rich Text 타입) 추가
- [NOTION_SETUP.md](NOTION_SETUP.md) 참고

#### C. 기사 수 부족
```
[LLM Economy] Not enough articles, skipping analysis
```
**원인**: 주제별로 3개 미만의 기사만 수집됨
**해결**: 정상 동작 (충분한 기사가 없어서 분석 생략)

#### D. Gemini API 할당량 초과
```
Error: 429 Resource has been exhausted
```
**해결**: 무료 할당량 초과 (1,500 요청/일). 잠시 후 다시 시도

#### E. 노션 API 키 에러
```
Error: Unauthorized
```
**해결**: `.env` 파일의 `NOTION_API_KEY` 확인

### 전체 로그 예시 (정상 동작)

```
==========================================================
실제 뉴스 수집 + Notion 저장 테스트
==========================================================
✅ 모든 서비스 초기화 완료

📊 [경제] 뉴스 수집 중...

[economy] Starting analysis...
[economy] Fetched 25 articles
[LLM Economy] Analyzing 25 articles with Gemini...
[LLM Economy] Analyzing 환율 with 8 articles...
[LLM Economy] Requesting Gemini analysis for 환율...
[LLM Economy] Received response (1523 chars)
[LLM Economy] Successfully parsed 환율 analysis
[LLM Economy] Title: 📌 환율 상승세, 1,400원 돌파 [연합뉴스·KBS 등 8건]
[LLM Economy] Created insight for 환율
[LLM Economy] Analyzing 금리 with 6 articles...
[LLM Economy] Requesting Gemini analysis for 금리...
[LLM Economy] Received response (1421 chars)
[LLM Economy] Successfully parsed 금리 analysis
[LLM Economy] Title: 📌 금리 동결 전망, 연준 신중 접근 [한경·머니투데이 등 6건]
[LLM Economy] Created insight for 금리
[LLM Economy] Analyzing 증시 with 11 articles...
[LLM Economy] Requesting Gemini analysis for 증시...
[LLM Economy] Received response (1598 chars)
[LLM Economy] Successfully parsed 증시 analysis
[LLM Economy] Title: 📌 증시 상승세, 코스피 2,500 돌파 [이데일리·서울경제 등 11건]
[LLM Economy] Created insight for 증시
[LLM Economy] Generated 3 insights
[economy] Generated 3 insights
[economy] Attempting to save 3 insights to Notion...
[economy] Saving insight 1/3: 📌 환율 상승세, 1,400원 돌파 [연합뉴스·KBS 등 8건]
[Notion] Preparing to save insight: 📌 환율 상승세, 1,400원 돌파 [연합뉴스·KBS 등 8건]
[Notion] Successfully created page
[economy] ✓ Successfully saved insight 1
[economy] Saving insight 2/3: 📌 금리 동결 전망, 연준 신중 접근 [한경·머니투데이 등 6건]
[Notion] Preparing to save insight: 📌 금리 동결 전망, 연준 신중 접근 [한경·머니투데이 등 6건]
[Notion] Successfully created page
[economy] ✓ Successfully saved insight 2
[economy] Saving insight 3/3: 📌 증시 상승세, 코스피 2,500 돌파 [이데일리·서울경제 등 11건]
[Notion] Preparing to save insight: 📌 증시 상승세, 코스피 2,500 돌파 [이데일리·서울경제 등 11건]
[Notion] Successfully created page
[economy] ✓ Successfully saved insight 3
[economy] Saved 3 insights to Notion
📱 [알림 생략] 3개 인사이트
[economy] Analysis completed successfully
```

### 다음 단계

위 로그를 보고 어느 단계에서 문제가 발생하는지 확인한 후:

1. **Gemini API 문제**: API 키 확인, 할당량 확인
2. **JSON 파싱 문제**: LLM 응답 형식 확인
3. **노션 저장 문제**: 노션 속성 확인, API 키 확인

전체 로그를 공유해주시면 구체적인 해결책을 제시하겠습니다.
