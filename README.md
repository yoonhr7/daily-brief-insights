# Daily Brief Insights (DB Insights)

A batch-style analysis engine that runs twice daily to explain:
- **Economy**: Why events happened (cause → effect)
- **IT**: What changed and why it matters (change → impact)

## Project Identity

This is **NOT** a news summarizer.
This is an **analysis engine** that explains **context and reasons**.

### Domains

1. **Economy Domain**
   - Core Question: What happened and WHY did it happen?
   - Topics: Exchange rate, interest rate, equity market
   - Style: Cause → Effect, neutral analyst tone

2. **IT Domain**
   - Core Question: What changed and WHY does it matter?
   - Topics: Product releases, policy changes, tech adoption/deprecation, security, organization changes
   - Style: Change → Impact, practical, no hype

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js 20+
- **Package Manager**: npm
- **Architecture**: Clean Architecture
- **Execution**: CLI / cron job
- **News Sources**: Google News (RSS) + Naver News API

## Architecture

```
src/
├── domain/              # Pure domain logic (no dependencies)
│   ├── economy/        # Economy domain types and entities
│   ├── it/             # IT domain types and entities
│   └── shared/         # Shared types and interfaces
├── application/        # Use cases and orchestration
├── infrastructure/     # External adapters
│   ├── google/        # Google News RSS fetcher
│   ├── naver/         # Naver News API adapter
│   ├── news/          # Composite news repository
│   ├── notion/        # Notion database adapter
│   └── kakao/         # KakaoTalk notification
└── jobs/              # Scheduler
```

## Quick Start

**👉 처음 사용하시나요? [QUICKSTART.md](QUICKSTART.md) 가이드를 따라하세요! (20분 소요)**

---

## 🚀 Deployment

### GitHub Actions로 자동 실행

이 프로젝트는 GitHub Actions를 통해 매일 자동으로 실행됩니다.

**상세 배포 가이드: [DEPLOYMENT.md](DEPLOYMENT.md)**

#### 빠른 시작
1. GitHub Repository에 코드 푸시
2. Repository Settings → Secrets에 API 키 등록
3. 매일 자동 실행 (오전 8시, 오후 8시 KST)

#### 필수 GitHub Secrets
- `NOTION_API_KEY`
- `NOTION_DATABASE_ID`
- `KAKAO_REST_API_KEY`
- `KAKAO_ACCESS_TOKEN`
- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`
- `GEMINI_API_KEY`

자세한 내용은 [DEPLOYMENT.md](DEPLOYMENT.md)를 참고하세요.

---

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

**상세 가이드:**
- [KAKAO_API_SETUP.md](KAKAO_API_SETUP.md) - 카카오톡 API 설정
- [NAVER_API_SETUP.md](NAVER_API_SETUP.md) - 네이버 뉴스 API 설정
- [SETUP.md](SETUP.md) - 전체 상세 설정

Required variables:
- `NOTION_API_KEY`: Notion integration token
- `NOTION_DATABASE_ID`: Your "Daily Brief Insights" database ID
- `KAKAO_REST_API_KEY`: KakaoTalk REST API key
- `KAKAO_ACCESS_TOKEN`: KakaoTalk access token
- `NAVER_CLIENT_ID`: Naver API client ID (see [NAVER_API_SETUP.md](NAVER_API_SETUP.md))
- `NAVER_CLIENT_SECRET`: Naver API client secret

Optional variables:
- `GOOGLE_NEWS_LANGUAGE`: Language code (default: `ko`)
- `GOOGLE_NEWS_COUNTRY`: Country code (default: `KR`)

Optional (schedule):
- `MORNING_SCHEDULE`: Cron expression (default: `0 8 * * *` - 8 AM)
- `EVENING_SCHEDULE`: Cron expression (default: `0 20 * * *` - 8 PM)

### 3. Build

```bash
npm run build
```

## Usage

### Run Scheduler

Start the scheduler to run at scheduled times:

```bash
npm start
```

### Run Immediately (for testing)

```bash
npm run dev -- --now
```

Or with compiled version:

```bash
node dist/index.js --now
```

## Development

### Type Checking

```bash
npm run type-check
```

### Watch Mode (for development)

```bash
npm run dev
```

## Project Status

### Completed
- ✅ Clean Architecture structure
- ✅ Domain types (Economy & IT)
- ✅ Infrastructure adapters (Google News, Naver News, Notion, KakaoTalk)
- ✅ Composite news repository (multi-source aggregation)
- ✅ Application use cases
- ✅ Job scheduler

### TODO
- ⏳ Implement actual analysis logic (LLM integration or rule-based)
- ⏳ Implement Notion query methods (findByDomain, findById, update)
- ⏳ Add error handling and retry logic
- ⏳ Add logging framework
- ⏳ Add tests
- ⏳ Add proper UUID generation

## Notes

- **Domain Separation**: Economy and IT domains are completely separate. Never mix their logic.
- **Clean Architecture**: Domain layer has NO dependencies on external libraries or APIs.
- **Analysis**: Current implementation is a skeleton. Analysis logic needs to be implemented based on your preferred approach (LLM, rule-based, or hybrid).
