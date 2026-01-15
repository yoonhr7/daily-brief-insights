# DailyBrief 문서 인덱스

## 📚 전체 문서 가이드

프로젝트의 모든 문서를 한눈에 확인하고, 목적에 맞는 문서를 찾아보세요.

---

## 🚀 시작하기

### 처음 사용자

1. **[QUICKSTART.md](QUICKSTART.md)** ⭐ 필독!
   - 20분 안에 완전히 설정하기
   - 단계별 스크린샷 포함
   - 초보자 친화적

2. **[README.md](README.md)**
   - 프로젝트 개요
   - 기술 스택
   - 빠른 사용법

---

## 🔧 설정 가이드

### API 설정

3. **[KAKAO_API_SETUP.md](KAKAO_API_SETUP.md)**
   - 카카오톡 "나에게 보내기" 설정
   - Access Token 발급 방법
   - 문제 해결

4. **[NAVER_API_SETUP.md](NAVER_API_SETUP.md)**
   - 네이버 뉴스 API 설정
   - Client ID/Secret 발급
   - 무료 사용량 안내

### 상세 설정

5. **[SETUP.md](SETUP.md)**
   - Notion Database 상세 설정
   - 환경 변수 전체 목록
   - 프로덕션 배포 가이드

---

## 📖 개발 문서

### 아키텍처

6. **[ARCHITECTURE.md](ARCHITECTURE.md)**
   - Clean Architecture 다이어그램
   - 계층별 역할 설명
   - 도메인 분리 원칙
   - 타입 계층 구조

### 코드 구조

```
src/
├── domain/           → 순수 비즈니스 로직
│   ├── economy/     → 경제 도메인
│   ├── it/          → IT 도메인
│   └── shared/      → 공통 타입
├── application/      → 유즈케이스
├── infrastructure/   → 외부 어댑터
│   ├── google/      → Google News
│   ├── naver/       → Naver News
│   ├── notion/      → Notion DB
│   └── kakao/       → KakaoTalk
└── jobs/            → 스케줄러
```

---

## 💡 사용법

### 기본 명령어

```bash
# 설치
npm install

# 빌드
npm run build

# 타입 체크
npm run type-check

# 즉시 실행 (테스트)
npm run dev -- --now

# 스케줄러 시작 (프로덕션)
npm start
```

### 개발 모드

```bash
# Watch 모드 (파일 변경 시 자동 재실행)
npm run dev
```

---

## 🎯 프로젝트 목적별 가이드

### 💰 경제 분석을 추가하고 싶다면

1. [src/domain/economy/types.ts](src/domain/economy/types.ts) - 타입 정의 확인
2. [src/infrastructure/google/GoogleNewsRepository.ts](src/infrastructure/google/GoogleNewsRepository.ts) - 검색 쿼리 수정
3. [src/application/AnalyzeNewsUseCase.ts](src/application/AnalyzeNewsUseCase.ts) - 분석 로직 구현

### 💻 IT 분석을 추가하고 싶다면

1. [src/domain/it/types.ts](src/domain/it/types.ts) - 타입 정의 확인
2. [src/infrastructure/naver/NaverNewsRepository.ts](src/infrastructure/naver/NaverNewsRepository.ts) - 검색 쿼리 수정
3. [src/application/AnalyzeNewsUseCase.ts](src/application/AnalyzeNewsUseCase.ts) - 분석 로직 구현

### 🔔 알림 채널을 추가하고 싶다면

1. [src/domain/shared/repositories.ts](src/domain/shared/repositories.ts) - `NotificationService` 인터페이스 확인
2. 새 파일: `src/infrastructure/slack/SlackNotificationService.ts` (예시)
3. [src/index.ts](src/index.ts) - 새 서비스 등록

### 📰 뉴스 소스를 추가하고 싶다면

1. [src/domain/shared/repositories.ts](src/domain/shared/repositories.ts) - `NewsRepository` 인터페이스 확인
2. 새 파일: `src/infrastructure/reddit/RedditNewsRepository.ts` (예시)
3. [src/index.ts](src/index.ts) - `CompositeNewsRepository`에 추가

---

## 🐛 문제 해결

### 자주 발생하는 문제

#### ❌ TypeScript 에러

```bash
npm run type-check
```

에러 메시지를 확인하고 타입 불일치 해결

#### ❌ API 인증 실패

- `.env` 파일 확인
- 키 값이 올바른지 재확인
- API 키가 만료되지 않았는지 확인

#### ❌ 뉴스가 수집되지 않음

```bash
npm run dev -- --now
```

로그에서 어떤 단계에서 실패하는지 확인

#### ❌ Notion에 저장되지 않음

- Integration이 Database에 연결되어 있는지 확인
- Database 속성 이름이 정확한지 확인 (한글 포함)

---

## 📊 프로젝트 상태

### ✅ 완료된 기능

- Clean Architecture 구조
- 도메인 타입 정의 (Economy, IT)
- Google News + Naver News 통합
- Notion Database 연동
- KakaoTalk 알림
- Cron 스케줄러

### ⏳ 구현 필요

- **분석 로직** (가장 중요!)
  - LLM API 연동 (Claude, GPT)
  - 또는 Rule-based 분석
- Notion 쿼리 메서드 (findByDomain, update)
- 에러 핸들링 & 재시도 로직
- 로깅 프레임워크
- 테스트 코드

---

## 🤝 기여하기

### 코딩 규칙

1. **TypeScript Strict Mode**
   - `any` 사용 금지
   - 모든 타입 명시

2. **Clean Architecture**
   - Domain은 외부 의존성 없음
   - Infrastructure는 Domain 인터페이스 구현

3. **도메인 분리**
   - Economy와 IT 로직 절대 혼합 금지

### 커밋 메시지

```
feat: Add LLM-based analysis logic
fix: Handle Naver API rate limiting
docs: Update QUICKSTART guide
refactor: Extract duplicate logic to utility
```

---

## 📞 지원

### 문서에서 답을 찾지 못했다면

1. 프로젝트 Issues 확인
2. 새 Issue 생성
3. Discussion 참여

---

## 📝 라이선스

MIT License

---

## 🗂️ 문서 요약

| 문서 | 대상 | 내용 |
|------|------|------|
| [QUICKSTART.md](QUICKSTART.md) | 초보자 | 20분 완전 설정 |
| [README.md](README.md) | 모든 사용자 | 프로젝트 개요 |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 개발자 | 아키텍처 설명 |
| [SETUP.md](SETUP.md) | 고급 사용자 | 상세 설정 |
| [KAKAO_API_SETUP.md](KAKAO_API_SETUP.md) | API 설정 | 카카오톡 API |
| [NAVER_API_SETUP.md](NAVER_API_SETUP.md) | API 설정 | 네이버 API |
| [DOCUMENTATION.md](DOCUMENTATION.md) | 모든 사용자 | 문서 인덱스 (이 파일) |

---

**문서를 읽었다면, 이제 [QUICKSTART.md](QUICKSTART.md)로 시작하세요! 🚀**
