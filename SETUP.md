# Setup Guide

## Prerequisites

- Node.js 20 or higher
- npm 10 or higher
- Notion account with API access
- KakaoTalk account with developer access

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Notion

### 2.1 Create Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Give it a name (e.g., "Daily Brief")
4. Copy the "Internal Integration Token" → This is your `NOTION_API_KEY`

### 2.2 Create Database

1. Create a new page in Notion
2. Create a database (table) with these properties:

| Property Name | Type | Options |
|--------------|------|---------|
| 제목 | Title | - |
| 도메인 | Select | 경제, IT |
| 상태 | Select | 초안, 발행됨, 보관됨 |
| 우선순위 | Select | 높음, 중간, 낮음 |
| 분석일 | Date | - |
| 태그 | Multi-select | (empty initially) |
| 요약 | Text | - |
| 이슈유형 | Select | 환율, 금리, 증시, 원자재, 정책, 기타 |
| 변화유형 | Select | 제품출시, 정책변경, 기술도입, 기술폐기, 보안, 조직변화, 기타 |
| 영향도 | Select | 긴급, 중요, 보통, 낮음 |

3. Share the database with your integration:
   - Click "..." menu → "Add connections" → Select your integration
4. Copy the database ID from the URL:
   - URL format: `https://www.notion.so/[workspace]/[DATABASE_ID]?v=...`
   - This is your `NOTION_DATABASE_ID`

## Step 3: Set Up KakaoTalk

### 3.1 Create Kakao Developers App

1. Go to https://developers.kakao.com/
2. Create a new application
3. Go to "Settings" → "General"
4. Copy "REST API Key" → This is your `KAKAO_REST_API_KEY`

### 3.2 Get Access Token

1. Go to "Product Settings" → "Kakao Login"
2. Enable "Kakao Login"
3. Set Redirect URI: `https://localhost`
4. Go to https://developers.kakao.com/tool/rest-api/open/get/v2-user-me
5. Get authorization code and exchange for access token
6. Or use this URL (replace YOUR_REST_API_KEY):
   ```
   https://kauth.kakao.com/oauth/authorize?client_id=YOUR_REST_API_KEY&redirect_uri=https://localhost&response_type=code
   ```
7. After authorization, you'll get a code in URL
8. Exchange code for access token using:
   ```bash
   curl -v -X POST "https://kauth.kakao.com/oauth/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=authorization_code" \
     -d "client_id=YOUR_REST_API_KEY" \
     -d "redirect_uri=https://localhost" \
     -d "code=YOUR_CODE"
   ```
9. Copy the `access_token` → This is your `KAKAO_ACCESS_TOKEN`

### 3.3 Enable "Send to Me" Permission

1. In Kakao Developers Console
2. Go to "Product Settings" → "Kakao Login" → "Consent Items"
3. Enable "Send message to me" permission

## Step 4: Configure RSS Feeds

Find RSS feeds for economy and IT news. Examples:

**Economy:**
- Bloomberg
- Reuters Economics
- Financial Times
- Your local business news

**IT:**
- TechCrunch
- Hacker News
- The Verge
- GitHub Blog

## Step 5: Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# From Step 2
NOTION_API_KEY=secret_xxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# From Step 3
KAKAO_REST_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
KAKAO_ACCESS_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# From Step 4
ECONOMY_RSS_FEEDS=https://example.com/economy/rss,https://example2.com/finance/rss
IT_RSS_FEEDS=https://example.com/tech/rss,https://example2.com/dev/rss

# Schedule (optional, defaults shown)
MORNING_SCHEDULE=0 8 * * *    # 8 AM daily
EVENING_SCHEDULE=0 20 * * *   # 8 PM daily
```

## Step 6: Build and Run

### Build

```bash
npm run build
```

### Test Run (immediate execution)

```bash
npm run dev -- --now
```

Or with compiled version:

```bash
node dist/index.js --now
```

### Start Scheduler (production)

```bash
npm start
```

This will run continuously and execute at scheduled times.

## Cron Schedule Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7, 0 and 7 are Sunday)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

Examples:
- `0 8 * * *` - Every day at 8:00 AM
- `0 20 * * *` - Every day at 8:00 PM
- `0 */6 * * *` - Every 6 hours
- `0 9,21 * * *` - At 9 AM and 9 PM

## Troubleshooting

### Environment Variables Not Loading

Make sure `.env` file is in the project root. For production, consider:
- Using system environment variables
- Using a process manager like PM2 with ecosystem file
- Using Docker with env file

### Notion API Errors

- Verify integration has access to the database
- Check property names match exactly (Korean characters)
- Ensure database ID is correct (without the `?v=` part)

### KakaoTalk Not Sending

- Verify access token is valid (they expire)
- Check "Send to Me" permission is enabled
- Test with Kakao API console first

### RSS Feeds Not Working

- Check feed URLs are valid and accessible
- Some feeds may require User-Agent headers (already set)
- Try fetching feeds manually with curl to verify

## Next Steps

After setup is complete:

1. **Implement Analysis Logic**
   - Current implementation returns empty insights
   - Need to add LLM integration (Claude API, OpenAI, etc.)
   - Or implement rule-based analysis

2. **Add Error Handling**
   - Retry logic for API failures
   - Better error messages
   - Logging framework

3. **Production Deployment**
   - Use PM2 or similar process manager
   - Set up monitoring
   - Configure log rotation
   - Set up alerts for failures

4. **Testing**
   - Add unit tests for domain logic
   - Add integration tests for infrastructure
   - Test scheduling logic
