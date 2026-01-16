# OpenAI API 설정 가이드

이 문서는 Daily Brief Insights에서 사용할 OpenAI API 키를 발급받는 방법을 설명합니다.

## 📋 개요

Daily Brief Insights는 **OpenAI GPT-4o-mini** 모델을 사용하여 뉴스 기사를 분석하고 인사이트를 생성합니다.

- **모델**: GPT-4o-mini
- **용도**: 경제/IT 뉴스 분석 및 인사이트 생성
- **예상 비용**: 월 약 $0.45 (하루 2회 실행 기준)

## 🚀 API 키 발급 방법

### 1. OpenAI 계정 생성

1. [OpenAI Platform](https://platform.openai.com/)에 접속
2. **Sign up** 클릭하여 계정 생성
   - Google, Microsoft, Apple 계정으로 로그인 가능
3. 이메일 인증 완료

### 2. 결제 방법 등록

OpenAI API는 유료 서비스입니다. 무료 크레딧($5)이 제공되지만, 신규 가입 후 일정 기간이 지나면 만료됩니다.

1. [Billing 페이지](https://platform.openai.com/account/billing/overview)로 이동
2. **Add payment method** 클릭
3. 신용카드/체크카드 정보 입력
4. **Add payment method** 완료

### 3. API 키 생성

1. [API Keys 페이지](https://platform.openai.com/api-keys)로 이동
2. **+ Create new secret key** 클릭
3. 키 이름 입력 (예: "DailyBrief")
4. **Create secret key** 클릭
5. **생성된 API 키를 복사** (한 번만 표시됨!)
   - 형식: `sk-proj-...` 또는 `sk-...`
   - 안전한 곳에 보관

## 💰 요금 정보

### GPT-4o-mini 가격 (2026년 1월 기준)

| 항목 | 가격 |
|------|------|
| Input | $0.150 / 1M tokens |
| Output | $0.600 / 1M tokens |

### 예상 사용량 (하루 2회 실행)

- **뉴스 기사**: 하루 약 1,500개
- **분석 토픽**: 하루 약 6개 (경제 3개 + IT 3개)
- **월 토큰 사용량**: 약 500K tokens
- **월 예상 비용**: **약 $0.45**

> 💡 **비교**: Gemini Pro ($0.13/월)보다 약간 비싸지만, 더 안정적이고 품질이 우수합니다.

### 사용량 확인

1. [Usage 페이지](https://platform.openai.com/account/usage)에서 실시간 사용량 확인
2. 예산 알림 설정 권장:
   - **Settings** → **Limits**
   - Monthly budget 설정 (예: $10)

## 🔐 .env 파일 설정

API 키를 발급받은 후, 프로젝트의 `.env` 파일에 추가하세요.

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-your_actual_api_key_here
```

## ✅ 테스트

API 키가 제대로 작동하는지 테스트:

```bash
npm run build
npm run test:news
```

예상 출력:
```
[OpenAI Economy] Analyzing 환율 with 217 articles...
[OpenAI Economy] Requesting GPT-4o-mini analysis for 환율...
[OpenAI Economy] Received response (1234 chars)
[OpenAI Economy] Successfully parsed 환율 analysis
✅ 경제 인사이트 저장 완료
```

## 🚨 주의사항

### 1. API 키 보안

- **절대 코드에 직접 입력하지 마세요**
- `.env` 파일은 `.gitignore`에 포함되어 있음
- GitHub Secrets에 저장하여 사용 (배포 시)

### 2. 요금 관리

- **예산 알림 설정** 필수
- 사용하지 않을 때는 GitHub Actions를 중지
- 필요시 일일 실행 횟수 조정 (2회 → 1회)

### 3. Rate Limit

GPT-4o-mini 무료 티어:
- **RPM (Requests Per Minute)**: 500
- **TPM (Tokens Per Minute)**: 200,000

> 💡 현재 설정으로는 Rate Limit에 걸릴 가능성이 거의 없습니다.

## 🔄 대안

OpenAI 비용이 부담스럽다면:

### Option 1: Claude API (Anthropic)
- 모델: Claude 3.5 Haiku
- 비용: 월 약 $2
- 품질: 우수

### Option 2: 실행 빈도 줄이기
```yaml
# .github/workflows/daily-brief.yml
schedule:
  - cron: "0 23 * * *"  # 하루 1회만 실행
```

## 📞 문제 해결

### ❌ "Invalid API key"

- API 키가 정확한지 확인
- 앞뒤 공백 제거
- `sk-proj-` 또는 `sk-`로 시작하는지 확인

### ❌ "Insufficient credits"

- [Billing 페이지](https://platform.openai.com/account/billing/overview)에서 잔액 확인
- 결제 방법이 등록되어 있는지 확인

### ❌ "Rate limit exceeded"

- 요청이 너무 빠름
- 코드에서 자동으로 재시도하므로 대기
- 지속되면 프리미엄 플랜 고려

## 📚 추가 자료

- [OpenAI API 문서](https://platform.openai.com/docs/introduction)
- [GPT-4o-mini 가격 정책](https://openai.com/api/pricing/)
- [API 사용량 대시보드](https://platform.openai.com/account/usage)
