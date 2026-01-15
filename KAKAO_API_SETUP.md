# 카카오톡 API 설정 가이드

## 1. 카카오 개발자 계정 생성

1. https://developers.kakao.com/ 접속
2. 카카오 계정으로 로그인
3. 우측 상단 "시작하기" 클릭

## 2. 애플리케이션 생성

1. "내 애플리케이션" 클릭
2. "애플리케이션 추가하기" 버튼 클릭
3. 앱 정보 입력:
   - **앱 이름**: DailyBrief (원하는 이름)
   - **사업자명**: 개인 (개인 프로젝트)
4. "저장" 클릭

## 3. REST API 키 확인

1. 생성된 앱 선택
2. "앱 설정" → "앱 키" 메뉴
3. **REST API 키** 복사 → `.env` 파일의 `KAKAO_REST_API_KEY`

```env
KAKAO_REST_API_KEY=복사한_REST_API_키
```

## 4. 카카오 로그인 활성화

1. 좌측 메뉴 "제품 설정" → "카카오 로그인" 클릭
2. "활성화 설정" → **ON**
3. "Redirect URI" 설정:
   - "Redirect URI 등록" 클릭
   - `http://localhost:3000/callback` 입력
   - "저장" 클릭

## 5. 동의 항목 설정 (중요!)

1. "제품 설정" → "카카오 로그인" → "동의 항목" 메뉴
2. **"카카오톡 메시지 전송"** 항목 찾기
3. 설정:
   - **필수 동의**: OFF
   - **동의 단계**: 앱 사용 중 동의
   - **접근 권한**: ON (활성화)

이제 "나에게 보내기" 기능 사용 가능!

## 6. Access Token 발급

### 방법 1: 브라우저를 통한 간편 발급 (추천)

#### 6.1 인가 코드 받기

브라우저에서 다음 URL 접속 (REST_API_KEY를 실제 키로 변경):

```
https://kauth.kakao.com/oauth/authorize?client_id=YOUR_REST_API_KEY&redirect_uri=http://localhost:3000/callback&response_type=code&scope=talk_message
```

**예시:**
```
https://kauth.kakao.com/oauth/authorize?client_id=abc123def456&redirect_uri=http://localhost:3000/callback&response_type=code&scope=talk_message
```

#### 6.2 동의하기

- 카카오 로그인 화면 → 로그인
- "카카오톡 메시지 전송" 동의 → "동의하고 계속하기"

#### 6.3 인가 코드 복사

- 리다이렉트된 URL에서 `code=` 부분 복사
- 예: `http://localhost:3000/callback?code=ABC123XYZ789`
- → `ABC123XYZ789` 부분이 인가 코드

#### 6.4 Access Token 발급

Windows PowerShell 또는 Git Bash에서:

```bash
curl -v -X POST "https://kauth.kakao.com/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "client_id=YOUR_REST_API_KEY" \
  -d "redirect_uri=http://localhost:3000/callback" \
  -d "code=YOUR_CODE"
```

**예시:**
```bash
curl -v -X POST "https://kauth.kakao.com/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "client_id=abc123def456" \
  -d "redirect_uri=http://localhost:3000/callback" \
  -d "code=ABC123XYZ789"
```

**Windows에서 curl이 없다면:**

1. https://www.postman.com/ 설치
2. POST 요청으로 위 파라미터 입력
3. Send

#### 6.5 응답에서 토큰 복사

```json
{
  "access_token": "여기가_Access_Token입니다_복사하세요",
  "token_type": "bearer",
  "refresh_token": "갱신용_토큰",
  "expires_in": 21599
}
```

`access_token` 값을 `.env` 파일에:

```env
KAKAO_ACCESS_TOKEN=복사한_Access_Token
```

### 방법 2: 코드로 자동 발급 (선택)

간단한 Node.js 스크립트 작성:

```javascript
// get-kakao-token.js
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('REST API Key: ', (apiKey) => {
  const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${apiKey}&redirect_uri=http://localhost:3000/callback&response_type=code&scope=talk_message`;

  console.log('\n1. 다음 URL을 브라우저에서 열어주세요:');
  console.log(authUrl);
  console.log('\n2. 동의하고 리다이렉트된 URL에서 code= 파라미터를 복사하세요\n');

  rl.question('인가 코드 입력: ', async (code) => {
    const response = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: apiKey,
        redirect_uri: 'http://localhost:3000/callback',
        code: code,
      }),
    });

    const data = await response.json();
    console.log('\n✅ Access Token:');
    console.log(data.access_token);
    console.log('\n.env 파일에 추가하세요:');
    console.log(`KAKAO_ACCESS_TOKEN=${data.access_token}`);

    rl.close();
  });
});
```

실행:
```bash
node get-kakao-token.js
```

## 7. .env 파일 최종 확인

```env
# KakaoTalk Configuration
KAKAO_REST_API_KEY=your_rest_api_key_here
KAKAO_ACCESS_TOKEN=your_access_token_here
```

## 8. 테스트

### 간단한 테스트 (curl)

```bash
curl -v -X POST "https://kapi.kakao.com/v2/api/talk/memo/default/send" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'template_object={"object_type":"text","text":"테스트 메시지입니다!","link":{"web_url":"https://developers.kakao.com"}}'
```

성공하면 나에게 카카오톡 메시지가 전송됩니다!

### 프로젝트로 테스트

```bash
npm run dev -- --now
```

## 9. 문제 해결

### ❌ "invalid_client" 에러
- REST API 키가 잘못되었거나
- Redirect URI가 등록되지 않음
- → 카카오 개발자 콘솔에서 다시 확인

### ❌ "invalid_grant" 에러
- 인가 코드가 만료됨 (10분 유효)
- 인가 코드는 1회만 사용 가능
- → 새로 인가 코드를 발급받으세요

### ❌ "insufficient_scope" 에러
- "카카오톡 메시지 전송" 권한 없음
- → "동의 항목"에서 권한 활성화 확인
- → 인가 코드 URL에 `scope=talk_message` 포함 확인

### ❌ Access Token 만료
- Access Token은 약 6시간 유효
- Refresh Token으로 갱신 가능 (구현 필요)
- 개인용이므로 만료 시 다시 발급해도 됨

### ❌ "msg_blocked" 에러
- 사용자가 메시지 수신 차단
- → 카카오톡 설정에서 해제

## 10. Refresh Token으로 자동 갱신 (선택 사항)

Access Token이 자주 만료된다면:

```typescript
// 추가 구현 필요
async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.KAKAO_REST_API_KEY!,
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();
  return data.access_token;
}
```

## 11. 사용 제한

**무료 플랜:**
- 하루 1,000건 메시지 전송 가능
- "나에게 보내기"는 제한 없음 (개인용)

**현재 구현:**
- 하루 2회 실행 = 2건/일
- ✅ 충분히 사용 가능

## 참고 자료

- [카카오 로그인 가이드](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [메시지 API 가이드](https://developers.kakao.com/docs/latest/ko/message/rest-api)
- [나에게 보내기](https://developers.kakao.com/docs/latest/ko/message/rest-api#send-me)
