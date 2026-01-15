/**
 * 카카오 Access Token 발급 도우미 스크립트
 *
 * 사용법:
 * node get-kakao-token.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// .env.example에서 REST API Key 읽기
const apiKey = 'c8b91e8d03c8634930d33313240ff888';

console.log('='.repeat(60));
console.log('카카오 Access Token 발급 도우미');
console.log('='.repeat(60));
console.log('\n📋 Step 1: 다음 URL을 브라우저에서 열어주세요:\n');

const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${apiKey}&redirect_uri=http://localhost:3000/callback&response_type=code&scope=talk_message`;
console.log(authUrl);

console.log('\n📋 Step 2: 카카오 로그인 후 "동의하고 계속하기" 클릭');
console.log('📋 Step 3: 리다이렉트된 URL에서 code= 파라미터를 복사하세요');
console.log('   예: http://localhost:3000/callback?code=ABC123...');
console.log('   → ABC123... 부분만 복사\n');

rl.question('인가 코드를 입력하세요: ', async (code) => {
  console.log('\n⏳ Access Token을 발급 중입니다...\n');

  try {
    const response = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: apiKey,
        redirect_uri: 'http://localhost:3000/callback',
        code: code.trim(),
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('❌ 에러 발생:', data.error);
      console.error('상세:', data.error_description);
      console.log('\n💡 해결 방법:');
      console.log('  - 인가 코드가 만료되었을 수 있습니다 (10분 유효)');
      console.log('  - Step 1부터 다시 시작하세요');
    } else {
      console.log('✅ Access Token 발급 성공!\n');
      console.log('='.repeat(60));
      console.log('Access Token:');
      console.log(data.access_token);
      console.log('='.repeat(60));
      console.log('\n📝 .env 파일에 다음과 같이 추가하세요:\n');
      console.log(`KAKAO_ACCESS_TOKEN=${data.access_token}`);
      console.log('\n💡 참고:');
      console.log(`  - 유효 기간: ${Math.floor(data.expires_in / 3600)}시간`);
      console.log(`  - 만료 후 이 스크립트를 다시 실행하세요`);
    }
  } catch (error) {
    console.error('❌ 네트워크 에러:', error.message);
  }

  rl.close();
});
