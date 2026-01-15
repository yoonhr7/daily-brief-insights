# Architecture Overview

## Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                         index.ts                            │
│                    (Entry Point / Main)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Jobs Layer                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  scheduler.ts                                         │  │
│  │  - DailyBriefScheduler                                │  │
│  │  - Cron job management                                │  │
│  │  - Morning/Evening runs                               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  DailyBriefService.ts                                 │  │
│  │  - Main orchestration service                         │  │
│  │  - Runs analysis for both domains                     │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  AnalyzeNewsUseCase.ts                                │  │
│  │  - Fetch news → Analyze → Save → Notify              │  │
│  │  - Domain-agnostic workflow                           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│                  (Pure Business Logic)                      │
│                                                             │
│  ┌─────────────────────┐         ┌─────────────────────┐   │
│  │   Economy Domain    │         │     IT Domain       │   │
│  │                     │         │                     │   │
│  │  types.ts           │         │  types.ts           │   │
│  │  - EconomyInsight   │         │  - ITInsight        │   │
│  │  - IssueType        │         │  - ChangeType       │   │
│  │  - MarketDirection  │         │  - ImpactLevel      │   │
│  │                     │         │                     │   │
│  │  entities.ts        │         │  entities.ts        │   │
│  │  - Factory funcs    │         │  - Factory funcs    │   │
│  │  - Business rules   │         │  - Business rules   │   │
│  └─────────────────────┘         └─────────────────────┘   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Shared Domain                            │  │
│  │                                                       │  │
│  │  types.ts                                             │  │
│  │  - Domain, Priority, InsightStatus                    │  │
│  │  - BaseInsight, NewsArticle                           │  │
│  │                                                       │  │
│  │  insight.ts                                           │  │
│  │  - Insight union type                                 │  │
│  │  - Type guards                                        │  │
│  │                                                       │  │
│  │  repositories.ts                                      │  │
│  │  - NewsRepository (interface)                         │  │
│  │  - InsightRepository (interface)                      │  │
│  │  - NotificationService (interface)                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                        │
│              (External System Adapters)                     │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  rss/RSSNewsRepository.ts                             │  │
│  │  - Implements NewsRepository                          │  │
│  │  - Fetches RSS feeds                                  │  │
│  │  - Parses articles                                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  notion/NotionInsightRepository.ts                    │  │
│  │  - Implements InsightRepository                       │  │
│  │  - Saves to Notion DB                                 │  │
│  │  - Maps domain types to Notion properties             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  kakao/KakaoNotificationService.ts                    │  │
│  │  - Implements NotificationService                     │  │
│  │  - Sends to KakaoTalk                                 │  │
│  │  - Formats messages                                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    External Systems
        ┌─────────┬──────────────┬──────────┐
        │   RSS   │    Notion    │  Kakao   │
        │  Feeds  │   Database   │   Talk   │
        └─────────┴──────────────┴──────────┘
```

## Dependency Flow

```
Jobs → Application → Domain ← Infrastructure
```

**Key Principles:**
- Domain layer has **NO** dependencies on external layers
- Infrastructure depends on Domain (implements interfaces)
- Application orchestrates Domain and Infrastructure
- Jobs trigger Application

## Domain Separation

```
Economy Domain                    IT Domain
━━━━━━━━━━━━━━                    ━━━━━━━━━━

Question:                         Question:
"WHY did it happen?"              "WHY does it matter?"

Focus:                            Focus:
- Exchange rate                   - Product releases
- Interest rate                   - Policy changes
- Equity market                   - Tech adoption/deprecation
- Commodity                       - Security issues
- Policy                          - Organization changes

Analysis Style:                   Analysis Style:
Cause → Effect                    Change → Impact

Tone:                             Tone:
Neutral analyst                   Practical, no hype
```

**CRITICAL: Never mix Economy and IT domain logic**

## Data Flow

```
1. RSS Feeds
   └─→ NewsRepository.fetchNews(domain)
       └─→ NewsArticle[]

2. Analysis (TODO: Implement)
   └─→ AnalyzeNewsUseCase.analyzeArticles()
       └─→ Insight[]

3. Storage
   └─→ InsightRepository.save(insight)
       └─→ Notion Database

4. Notification
   └─→ NotificationService.sendBatch(insights)
       └─→ KakaoTalk Message
```

## Type Hierarchy

```
BaseInsight (shared)
├─→ EconomyInsight (economy domain)
│   └─→ EconomyInsightData
│       ├─→ EconomyIssueType
│       ├─→ MarketDirection
│       └─→ causes[], effects[]
│
└─→ ITInsight (it domain)
    └─→ ITInsightData
        ├─→ ITChangeType
        ├─→ ImpactLevel
        ├─→ AffectedParty[]
        └─→ actionItems[]

Insight = EconomyInsight | ITInsight
```

## Configuration

All configuration comes from environment variables:

```typescript
// Infrastructure factories
RSSNewsRepository.fromEnv()
NotionInsightRepository.fromEnv()
KakaoNotificationService.fromEnv()
DailyBriefScheduler.fromEnv()
```

No hard-coded credentials or configuration.

## Extension Points

### To add new domain:

1. Create `src/domain/[name]/types.ts`
2. Create `src/domain/[name]/entities.ts`
3. Update `src/domain/shared/insight.ts` union type
4. Update `AnalyzeNewsUseCase` to handle new domain
5. Update infrastructure mappers

### To add new notification channel:

1. Implement `NotificationService` interface
2. Update `DailyBriefService` constructor
3. No domain changes needed!

### To add new data source:

1. Implement `NewsRepository` interface
2. Update `DailyBriefService` constructor
3. No domain changes needed!

## Testing Strategy (TODO)

```
Domain Layer:
- Unit tests for entities
- Pure functions, easy to test
- No mocking needed

Application Layer:
- Unit tests with mocked repositories
- Test orchestration logic

Infrastructure Layer:
- Integration tests with real APIs
- Or use test doubles
```

## Current Status

✅ Complete:
- Project structure
- Domain types and entities
- Repository interfaces
- Infrastructure implementations (basic)
- Application orchestration
- Job scheduler

⏳ TODO:
- **Analysis logic** (most important!)
- Notion query implementations
- Error handling & retry
- Logging
- Tests
- UUID generation
