# 네이버 뉴스 API 설정 가이드

## 1. 네이버 개발자 센터 가입

1. https://developers.naver.com/ 접속
2. 네이버 계정으로 로그인
3. 개발자 센터 이용 약관 동의

## 2. 애플리케이션 등록

1. "Application" → "애플리케이션 등록" 클릭
2. 애플리케이션 정보 입력:
   - **애플리케이션 이름**: DailyBrief (또는 원하는 이름)
   - **사용 API**: **검색** 선택 (필수!)
   - **비로그인 오픈API 서비스 환경**:
     - WEB 설정 선택
     - 서비스 URL: `http://localhost` (개인용이므로 임의 설정)

3. "등록하기" 클릭

## 3. Client ID와 Client Secret 확인

애플리케이션 등록 완료 후:

1. "Application" → "내 애플리케이션" 선택
2. 등록한 애플리케이션 클릭
3. **Client ID** 복사 → `.env` 파일의 `NAVER_CLIENT_ID`
4. **Client Secret** 복사 → `.env` 파일의 `NAVER_CLIENT_SECRET`

## 4. .env 파일 설정

```env
# Naver News API Configuration
NAVER_CLIENT_ID=당신의_클라이언트_ID
NAVER_CLIENT_SECRET=당신의_클라이언트_시크릿
```

## 5. API 사용량 제한

**무료 플랜:**
- **하루 25,000건** 호출 가능
- 초당 10건 제한

**현재 구현:**
- 도메인당 6개 쿼리 × 20건 = 최대 120건/회
- 하루 2회 실행 = 약 240건/일
- ✅ 무료 한도 내 충분히 사용 가능

## 6. 테스트

### 6.1 API 테스트 (cURL)

```bash
curl "https://openapi.naver.com/v1/search/news.json?query=IT&display=5" \
  -H "X-Naver-Client-Id: YOUR_CLIENT_ID" \
  -H "X-Naver-Client-Secret: YOUR_CLIENT_SECRET"
```

성공 시 JSON 응답:
```json
{
  "items": [
    {
      "title": "뉴스 제목",
      "link": "https://...",
      "description": "뉴스 내용",
      "pubDate": "Mon, 14 Jan 2024 12:00:00 +0900"
    }
  ]
}
```

### 6.2 프로젝트 테스트

```bash
npm run dev -- --now
```

로그에서 확인:
```
[economy] Fetched XX articles
[it] Fetched XX articles
```

## 7. 문제 해결

### ❌ "인증 실패" 에러
- Client ID/Secret이 정확한지 확인
- 헤더 이름: `X-Naver-Client-Id`, `X-Naver-Client-Secret` (대소문자 구분)

### ❌ "검색 API를 추가하지 않았습니다"
- 애플리케이션 설정에서 **검색 API** 체크 확인
- 수정 후 몇 분 대기

### ❌ "호출 한도 초과"
- 하루 25,000건 초과 시 발생
- 다음날 0시(KST)에 리셋

### ❌ "Too Many Requests (429)"
- 초당 10건 제한 초과
- 현재 구현은 순차 호출이므로 문제 없음

## 8. 쿼리 커스터마이징

검색 키워드를 수정하고 싶다면:

[src/infrastructure/naver/NaverNewsRepository.ts](src/infrastructure/naver/NaverNewsRepository.ts:96-117) 파일에서:

```typescript
private getQueriesForDomain(domain: Domain): string[] {
  if (domain === 'economy') {
    return [
      '환율',      // 원하는 키워드로 변경
      '금리',
      '증시',
      // ... 추가 가능
    ];
  }
}
```

**팁:**
- 너무 많은 쿼리는 중복 결과 증가
- 도메인당 5-7개 쿼리 추천
- 구체적인 키워드가 일반적인 키워드보다 유용

## 9. 모니터링

네이버 개발자센터에서:
- "내 애플리케이션" → "통계" 메뉴
- 일별 호출량 확인 가능

## 참고 자료

- [네이버 검색 API 가이드](https://developers.naver.com/docs/serviceapi/search/news/news.md)
- [API 공통 가이드](https://developers.naver.com/docs/common/openapiguide/)
