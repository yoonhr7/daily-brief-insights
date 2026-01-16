# GitHub Actions 배포 가이드

이 문서는 Daily Brief Insights를 GitHub Actions를 통해 자동으로 실행하는 방법을 설명합니다.

## 🚀 배포 개요

이 프로젝트는 GitHub Actions를 사용하여 매일 자동으로 실행됩니다:

-   **오전 브리핑**: 매일 오전 8시 (KST)
-   **오후 브리핑**: 매일 오후 8시 (KST)

## 📋 사전 준비사항

### 1. GitHub Repository 생성

1. GitHub에서 새 Repository 생성
2. 로컬 프로젝트를 GitHub에 푸시

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/daily-brief-insights.git
git push -u origin main
```

### 2. API 키 발급

다음 API 키들을 미리 발급받아야 합니다:

#### Notion API

-   [설정 가이드](./NOTION_SETUP.md) 참고
-   `NOTION_API_KEY`: Notion Integration Token
-   `NOTION_DATABASE_ID`: Database ID

#### Kakao API

-   [설정 가이드](./KAKAO_API_SETUP.md) 참고
-   `KAKAO_REST_API_KEY`: REST API 키
-   `KAKAO_ACCESS_TOKEN`: 사용자 액세스 토큰

#### Naver API

-   [Naver Developers](https://developers.naver.com/apps/#/list) 접속
-   애플리케이션 등록 → "검색" API 선택 → "뉴스" 활성화
-   웹 서비스 URL: `http://localhost` (개발용)
-   `NAVER_CLIENT_ID`: Client ID
-   `NAVER_CLIENT_SECRET`: Client Secret

#### OpenAI API

-   [OpenAI Platform](https://platform.openai.com/api-keys)에서 API 키 발급
-   `OPENAI_API_KEY`: API Key
-   모델: GPT-4o-mini (자동 사용)

## 🔐 GitHub Secrets 설정

GitHub Repository에서 환경 변수를 Secrets로 등록해야 합니다.

### 설정 방법

1. GitHub Repository 페이지로 이동
2. **Settings** 클릭
3. 왼쪽 메뉴에서 **Secrets and variables** → **Actions** 클릭
4. **New repository secret** 버튼 클릭
5. 아래 Secrets를 하나씩 추가

### 필수 Secrets 목록

| Secret 이름           | 설명                     | 예시                       |
| --------------------- | ------------------------ | -------------------------- |
| `NOTION_API_KEY`      | Notion Integration Token | `your_notion_api_key`      |
| `NOTION_DATABASE_ID`  | Notion Database ID       | `your_notion_database_id`  |
| `KAKAO_REST_API_KEY`  | Kakao REST API 키        | `your_kakao_rest_api_key`  |
| `KAKAO_ACCESS_TOKEN`  | Kakao 액세스 토큰        | `your_kakao_access_token`  |
| `NAVER_CLIENT_ID`     | Naver Client ID          | `your_naver_client_id`     |
| `NAVER_CLIENT_SECRET` | Naver Client Secret      | `your_naver_client_secret` |
| `OPENAI_API_KEY`      | OpenAI API Key           | `your_openai_api_key`      |

### Secrets 추가 화면

```
Name: NOTION_API_KEY
Secret: your_notion_api_key

```

각 Secret을 위와 같이 추가합니다.

## ⚙️ GitHub Actions 워크플로우

워크플로우 파일: [`.github/workflows/daily-brief.yml`](.github/workflows/daily-brief.yml)

### 자동 실행 스케줄

-   **오전 브리핑**: 매일 오전 8시 (KST) = 23:00 UTC (전날)
-   **오후 브리핑**: 매일 오후 8시 (KST) = 11:00 UTC

> **참고**: GitHub Actions는 UTC 시간을 사용합니다.
>
> -   KST = UTC + 9시간
> -   오전 8시 KST = 23:00 UTC (전날)
> -   오후 8시 KST = 11:00 UTC

### 수동 실행

1. GitHub Repository → **Actions** 탭
2. 왼쪽에서 **Daily Brief Scheduler** 선택
3. **Run workflow** 버튼 클릭
4. **Run workflow** 확인

## 🔍 실행 확인

### Workflow 실행 로그 확인

1. GitHub Repository → **Actions** 탭
2. 최근 실행된 Workflow 클릭
3. 각 Step의 로그 확인

### 성공 확인 체크리스트

-   [ ] Workflow가 성공적으로 완료됨 (초록색 체크)
-   [ ] Notion Database에 새로운 페이지가 생성됨
-   [ ] KakaoTalk으로 알림이 전송됨

### 실패 시 확인사항

1. **Secrets 확인**: 모든 Secret이 정확하게 입력되었는지 확인
2. **API 권한 확인**:
    - Notion Integration이 Database에 접근 권한이 있는지
    - Kakao Access Token이 유효한지
    - Naver/Gemini API 키가 활성화되어 있는지
3. **Logs 확인**: Actions 탭에서 상세 로그 확인

## 🛠️ 로컬 테스트

배포 전 로컬에서 테스트하기:

```bash
# 환경 변수 설정 (.env 파일)
cp .env.example .env
# .env 파일을 실제 값으로 수정

# 의존성 설치
npm install

# 빌드
npm run build

# 즉시 실행 (스케줄 대기 없이)
npm start -- --now
```

## 📝 스케줄 변경

스케줄을 변경하려면 [`.github/workflows/daily-brief.yml`](.github/workflows/daily-brief.yml) 파일을 수정하세요.

```yaml
schedule:
    # 오전 6시 KST = 21:00 UTC (전날)
    - cron: "0 21 * * *"
    # 오후 6시 KST = 09:00 UTC
    - cron: "0 9 * * *"
```

### Cron 표현식 가이드

```
*    *    *    *    *
┬    ┬    ┬    ┬    ┬
│    │    │    │    │
│    │    │    │    └─ 요일 (0-6, 0=일요일)
│    │    │    └────── 월 (1-12)
│    │    └─────────── 일 (1-31)
│    └──────────────── 시 (0-23, UTC)
└───────────────────── 분 (0-59)
```

예시:

-   `0 23 * * *`: 매일 23:00 UTC (오전 8시 KST)
-   `0 11 * * *`: 매일 11:00 UTC (오후 8시 KST)
-   `0 9 * * 1-5`: 평일 09:00 UTC

## 🌐 운영 URL 설정

### Naver API 운영 URL

실제 운영 환경에서 사용할 경우:

1. [Naver Developers](https://developers.naver.com/apps/#/list) 접속
2. 애플리케이션 선택
3. **웹 서비스 URL** 수정:
    - 개발: `http://localhost`
    - 운영: `https://github.com/YOUR_USERNAME/daily-brief-insights` (또는 실제 서비스 URL)

> **참고**: Node.js 서버사이드 애플리케이션이므로 URL 제약이 없습니다. GitHub Actions에서 실행 시 URL 검증이 없습니다.

## 🚨 주의사항

1. **Secrets 보안**: GitHub Secrets는 절대 코드에 포함하지 마세요
2. **API 할당량**: 각 API의 일일 호출 제한을 확인하세요
3. **비용**: Google Gemini API는 무료 티어 제한이 있습니다
4. **타임존**: GitHub Actions는 UTC를 사용합니다 (KST = UTC+9)

## 📞 문제 해결

### API 인증 오류

-   Secrets가 올바르게 설정되었는지 확인
-   API 키가 유효한지 확인

### Notion 연동 오류

-   Integration이 Database에 접근 권한이 있는지 확인
-   Database ID가 정확한지 확인

### KakaoTalk 전송 실패

-   Access Token이 유효한지 확인
-   Kakao 앱이 활성화되어 있는지 확인

### GitHub Actions 실행 안됨

-   Repository가 Public인지 확인 (Private은 GitHub Pro 필요)
-   Workflow 파일이 `.github/workflows/` 경로에 있는지 확인

## 📚 추가 문서

-   [Notion 설정 가이드](./NOTION_SETUP.md)
-   [Kakao API 설정 가이드](./KAKAO_API_SETUP.md)
-   [OpenAI API 설정 가이드](./OPENAI_SETUP.md)
-   [테스트 가이드](./TEST.md)
