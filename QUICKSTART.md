# 빠른 시작 가이드 (Quick Start)

## 전체 설정 순서

```
1. 의존성 설치 (1분)
   ↓
2. Notion 설정 (5분)
   ↓
3. 네이버 API 설정 (3분)
   ↓
4. 카카오 API 설정 (10분)
   ↓
5. 환경 변수 설정 (2분)
   ↓
6. 빌드 & 실행
```

**총 소요 시간: 약 20-30분**

---

## Step 1: 의존성 설치

```bash
# 프로젝트 디렉토리로 이동
cd daily-brief-insights

# npm 패키지 설치
npm install
```

---

## Step 2: Notion 설정 (5분)

### 2.1 Notion Integration 생성

1. https://www.notion.so/my-integrations 접속
2. "+ New integration" 클릭
3. 이름: `DailyBrief`
4. **Internal Integration Token** 복사 → 메모장에 저장

### 2.2 Notion Database 생성

1. Notion에서 새 페이지 생성
2. `/database` 입력 → "Table" 선택
3. Database 이름: `Daily Brief Insights`
4. 다음 속성(Property) 추가:

| 속성 이름 | 타입 | 옵션 |
|---------|------|------|
| 제목 | Title | (기본) |
| 도메인 | Select | 경제, IT |
| 상태 | Select | 초안, 발행됨, 보관됨 |
| 우선순위 | Select | 높음, 중간, 낮음 |
| 분석일 | Date | - |
| 태그 | Multi-select | - |
| 요약 | Text | - |
| 이슈유형 | Select | 환율, 금리, 증시, 원자재, 정책, 기타 |
| 변화유형 | Select | 제품출시, 정책변경, 기술도입, 기술폐기, 보안, 조직변화, 기타 |
| 영향도 | Select | 긴급, 중요, 보통, 낮음 |

5. 데이터베이스 우측 상단 `...` → "Add connections" → `DailyBrief` integration 선택
6. URL에서 Database ID 복사:
   ```
   https://www.notion.so/workspace/DATABASE_ID?v=...
                                   ^^^^^^^^^^^
   ```

---

## Step 3: 네이버 API 설정 (3분)

1. https://developers.naver.com/ 접속
2. "Application" → "애플리케이션 등록"
3. 정보 입력:
   - 이름: `DailyBrief`
   - 사용 API: **검색** ✅
   - 서비스 URL: `http://localhost`
4. 등록 완료 후:
   - **Client ID** 복사
   - **Client Secret** 복사

📖 자세한 설명: [NAVER_API_SETUP.md](NAVER_API_SETUP.md)

---

## Step 4: 카카오 API 설정 (10분)

### 4.1 앱 생성

1. https://developers.kakao.com/ 접속
2. "내 애플리케이션" → "애플리케이션 추가하기"
3. 앱 이름: `DailyBrief`
4. **REST API 키** 복사

### 4.2 카카오 로그인 활성화

1. 앱 선택 → "카카오 로그인" 메뉴
2. 활성화 ON
3. Redirect URI: `http://localhost:3000/callback` 등록

### 4.3 동의 항목 설정

1. "카카오 로그인" → "동의 항목"
2. **"카카오톡 메시지 전송"** 찾기
3. 접근 권한 ON

### 4.4 Access Token 발급

브라우저에서 접속 (REST_API_KEY를 실제 키로 변경):

```
https://kauth.kakao.com/oauth/authorize?client_id=YOUR_REST_API_KEY&redirect_uri=http://localhost:3000/callback&response_type=code&scope=talk_message
```

1. 동의하고 계속하기
2. 리다이렉트된 URL에서 `code=` 뒤의 코드 복사
3. 다음 명령 실행 (Git Bash 또는 PowerShell):

```bash
curl -X POST "https://kauth.kakao.com/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "client_id=YOUR_REST_API_KEY" \
  -d "redirect_uri=http://localhost:3000/callback" \
  -d "code=YOUR_CODE"
```

4. 응답에서 `access_token` 값 복사

📖 자세한 설명: [KAKAO_API_SETUP.md](KAKAO_API_SETUP.md)

---

## Step 5: 환경 변수 설정 (2분)

### 5.1 .env 파일 생성

```bash
cp .env.example .env
```

### 5.2 .env 파일 편집

```env
# Notion
NOTION_API_KEY=secret_xxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxx

# KakaoTalk
KAKAO_REST_API_KEY=xxxxxxxxxxxxxxxx
KAKAO_ACCESS_TOKEN=xxxxxxxxxxxxxxxx

# Naver
NAVER_CLIENT_ID=xxxxxxxxxxxxxxxx
NAVER_CLIENT_SECRET=xxxxxxxxxxxxxxxx

# Google News (기본값 사용 가능, 변경 선택)
GOOGLE_NEWS_LANGUAGE=ko
GOOGLE_NEWS_COUNTRY=KR

# Schedule (기본값 사용 가능)
MORNING_SCHEDULE=0 8 * * *    # 매일 오전 8시
EVENING_SCHEDULE=0 20 * * *   # 매일 오후 8시
```

---

## Step 6: 빌드 & 실행

### 6.1 빌드

```bash
npm run build
```

### 6.2 테스트 실행 (즉시 실행)

```bash
npm run dev -- --now
```

**예상 출력:**
```
Initializing DailyBrief...

[MANUAL] Running daily brief analysis now...
==================================================
Daily Brief Analysis Started
Time: 2024-01-14T06:00:00.000Z
==================================================
[economy] Starting analysis...
[economy] Fetched 45 articles
TODO: Implement economy analysis for 45 articles
[economy] Generated 0 insights
[economy] No insights generated. Skipping save and notification.
[economy] Analysis completed successfully
[it] Starting analysis...
[it] Fetched 52 articles
TODO: Implement it analysis for 52 articles
[it] Generated 0 insights
[it] No insights generated. Skipping save and notification.
[it] Analysis completed successfully
==================================================
Daily Brief Analysis Completed Successfully
==================================================
```

### 6.3 스케줄러 시작 (백그라운드 실행)

```bash
npm start
```

**예상 출력:**
```
Initializing DailyBrief...

Starting Daily Brief Scheduler...
Morning schedule: 0 8 * * *
Evening schedule: 0 20 * * *
Scheduler started successfully. Waiting for scheduled times...
```

이제 매일 오전 8시, 오후 8시에 자동 실행됩니다!

---

## 다음 단계

### ✅ 현재 상태
- 뉴스 수집: Google News + Naver News
- 저장소: Notion Database
- 알림: KakaoTalk
- **분석 로직: 미구현 (TODO)**

### 🔧 구현 필요
분석 로직을 추가해야 실제 인사이트가 생성됩니다:

**파일:** [src/application/AnalyzeNewsUseCase.ts](src/application/AnalyzeNewsUseCase.ts)

```typescript
private async analyzeArticles(
  articles: NewsArticle[],
  domain: Domain
): Promise<Insight[]> {
  // TODO: 여기에 분석 로직 구현
  // 옵션 1: LLM API (Claude, GPT) 사용
  // 옵션 2: Rule-based 분석
  // 옵션 3: 하이브리드
}
```

---

## 문제 해결

### ❌ "NOTION_API_KEY must be set"
- `.env` 파일이 프로젝트 루트에 있는지 확인
- 키 값이 올바르게 복사되었는지 확인

### ❌ "Failed to fetch Google News"
- 인터넷 연결 확인
- 방화벽이 차단하지 않는지 확인

### ❌ "Naver API error: 401"
- Client ID/Secret이 올바른지 확인
- 검색 API가 활성화되어 있는지 확인

### ❌ "KakaoTalk API error"
- Access Token이 만료되었을 수 있음 → 재발급
- "메시지 전송" 권한이 활성화되어 있는지 확인

---

## 유용한 명령어

```bash
# 타입 체크
npm run type-check

# 빌드
npm run build

# 개발 모드 (watch)
npm run dev

# 즉시 실행 (테스트용)
npm run dev -- --now

# 프로덕션 실행 (스케줄러)
npm start
```

---

## 추가 자료

- [README.md](README.md) - 프로젝트 개요
- [ARCHITECTURE.md](ARCHITECTURE.md) - 아키텍처 설명
- [SETUP.md](SETUP.md) - 상세 설정 가이드
- [NAVER_API_SETUP.md](NAVER_API_SETUP.md) - 네이버 API 상세
- [KAKAO_API_SETUP.md](KAKAO_API_SETUP.md) - 카카오 API 상세
