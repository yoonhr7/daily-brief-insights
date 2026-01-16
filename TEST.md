# 테스트 가이드

## 🧪 Notion 저장 테스트 (추천)

카카오톡 알림 없이 Notion에만 테스트 데이터를 저장합니다.

### 사전 준비

1. **Notion 설정 완료** ([QUICKSTART.md](QUICKSTART.md) 참고)
   - Integration 생성
   - Database 생성 및 속성 설정
   - Integration 연결

2. **.env 파일 생성**
   ```bash
   cp .env.example .env
   ```

3. **.env 파일에 Notion 정보 입력**
   ```env
   NOTION_API_KEY=your_notion_api_key
   NOTION_DATABASE_ID=your_notion_database_id
   ```

   > 💡 다른 API 키(카카오, 네이버)는 이 테스트에서 필요하지 않습니다!

### 실행

```bash
npm run test:notion
```

### 예상 결과

```
============================================================
Notion 저장 테스트 시작
============================================================
✅ Notion 연결 성공

📊 [경제] 테스트 인사이트 생성 중...
✅ 경제 인사이트 저장 완료

💻 [IT] 테스트 인사이트 생성 중...
✅ IT 인사이트 저장 완료

============================================================
✅ 모든 테스트 완료!
📖 Notion 데이터베이스를 확인해보세요.
============================================================
```

### Notion 확인

데이터베이스에 다음 2개 페이지가 생성되어야 합니다:

1. **[테스트] 달러 환율 급등** (경제)
   - 도메인: 경제
   - 이슈유형: 환율
   - 우선순위: 높음

2. **[테스트] GitHub Copilot 업데이트** (IT)
   - 도메인: IT
   - 변화유형: 제품출시
   - 영향도: 중요

---

## 📰 실제 뉴스 수집 테스트

실제 Google News + Naver News에서 뉴스를 수집합니다.

### 사전 준비

`.env` 파일에 다음 정보 필요:
```env
NOTION_API_KEY=your_key
NOTION_DATABASE_ID=your_id
NAVER_CLIENT_ID=your_id
NAVER_CLIENT_SECRET=your_secret
GOOGLE_NEWS_LANGUAGE=ko
GOOGLE_NEWS_COUNTRY=KR
```

### 실행

```bash
npm run test:news
```

### 예상 결과

```
============================================================
실제 뉴스 수집 + Notion 저장 테스트
============================================================
✅ 모든 서비스 초기화 완료

📊 [경제] 뉴스 수집 중...

[economy] Starting analysis...
[economy] Fetched 45 articles
TODO: Implement economy analysis for 45 articles
[economy] Generated 0 insights
📱 [알림 생략] 0개 인사이트

💻 [IT] 뉴스 수집 중...

[it] Starting analysis...
[it] Fetched 52 articles
TODO: Implement it analysis for 52 articles
[it] Generated 0 insights
📱 [알림 생략] 0개 인사이트

============================================================
✅ 테스트 완료!

⚠️  참고: 분석 로직이 미구현되어 Notion에 저장되지 않습니다.
   실제 저장 테스트는 test-notion.js를 사용하세요.
============================================================
```

> ⚠️ **중요**: 분석 로직이 미구현이므로 인사이트가 생성되지 않습니다.
> 뉴스 수집만 확인하고 싶을 때 사용하세요.

---

## 🔍 문제 해결

### ❌ "NOTION_API_KEY must be set"

**.env 파일 확인:**
1. 파일이 프로젝트 루트에 있는가?
2. 키 값이 정확한가?

```bash
# 현재 디렉토리 확인
pwd

# .env 파일 존재 확인
ls -la .env

# .env 파일 내용 확인 (첫 줄만)
head -n 1 .env
```

### ❌ "Failed to save insight to Notion"

**Notion 설정 확인:**
1. Integration이 Database에 연결되어 있는가?
2. Database 속성이 정확한가?

**필수 속성 (정확한 한글 이름):**
- 제목 (Title)
- 도메인 (Select)
- 상태 (Select)
- 우선순위 (Select)
- 분석일 (Date)
- 태그 (Multi-select)
- 요약 (Text)
- 이슈유형 (Select)
- 변화유형 (Select)
- 영향도 (Select)

### ❌ "Failed to fetch Google News"

**인터넷 연결 확인:**
```bash
curl https://news.google.com
```

### ❌ "Naver API error: 401"

**네이버 API 확인:**
1. Client ID/Secret이 정확한가?
2. 검색 API가 활성화되어 있는가?

---

## 🎯 단계별 테스트 순서

### 1️⃣ Notion 연결 테스트
```bash
npm run test:notion
```
✅ Notion에 2개 페이지 생성 확인

### 2️⃣ 뉴스 수집 테스트
```bash
npm run test:news
```
✅ 뉴스 수집 개수 확인 (예: 45개, 52개)

### 3️⃣ 카카오톡 테스트 (선택)

Access Token 발급 후:
```bash
node get-kakao-token.js
```

`.env`에 토큰 추가 후:
```bash
npm run dev -- --now
```

### 4️⃣ 전체 시스템 테스트

모든 API 키 설정 후:
```bash
npm start
```

---

## 📝 테스트 체크리스트

```
□ 1. .env 파일 생성
□ 2. Notion API 키 설정
□ 3. npm run test:notion 실행
□ 4. Notion에서 테스트 페이지 확인
□ 5. 네이버 API 키 설정
□ 6. npm run test:news 실행
□ 7. 뉴스 수집 개수 확인
□ 8. 카카오 Access Token 발급
□ 9. npm run dev -- --now 실행
□ 10. 전체 동작 확인
```

---

## 🧹 테스트 데이터 정리

테스트 후 Notion의 `[테스트]` 페이지들을 삭제해도 됩니다.

또는 Notion에서 필터를 사용:
```
제목 - 포함하지 않음 - [테스트]
```
