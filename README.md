# 오늘 뭐 입지? 👔

날씨 기반 옷차림 추천 앱입니다. 현재 위치의 날씨 정보를 바탕으로 오늘 하루 어떤 옷을 입으면 좋을지 추천해드립니다.

## 주요 기능

- 🌡️ **실시간 날씨 정보** - 현재 온도, 체감 온도, 습도, 풍속 확인
- 👕 **옷차림 추천** - 온도와 날씨 조건에 맞는 옷 추천
- ⏰ **시간별 예보** - 24시간 동안의 날씨 변화 확인
- 🌅 **아침/오후 비교** - 일교차를 고려한 옷차림 제안
- ☔ **우산 알림** - 강수 확률에 따른 우산 필요 여부
- ⚡ **서버 사이드 캐싱** - 동일 지역 요청 최적화

## 기술 스택

- **Frontend**: SvelteKit + TypeScript
- **UI**: Tailwind CSS + DaisyUI
- **API**: Open-Meteo (무료, API 키 불필요)
- **배포**: Vercel (Edge Cache 활용)
- **패키지 매니저**: pnpm

## 캐싱 전략 🚀

API 호출 최적화를 위한 2단계 캐싱:

### 1. 서버 인메모리 캐시
- 위치 기반 격자 캐싱 (약 10km 반경 동일 캐시)
- TTL: 10분
- 같은 지역의 요청은 캐시에서 반환

### 2. Vercel Edge Cache
- `Cache-Control: public, s-maxage=600, stale-while-revalidate=3600`
- CDN 레벨 캐싱으로 서버 부하 감소

**결과**: 일 PV 10,000건 이상도 API 호출은 수백 건으로 최소화!

## 시작하기

### 설치

```bash
pnpm install
```

### 개발 서버 실행

```bash
pnpm dev
```

### 빌드

```bash
pnpm build
```

### 미리보기

```bash
pnpm preview
```

## Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

또는 GitHub 연동 후 자동 배포 설정

## 프로젝트 구조

```
src/
├── app.css                        # 전역 스타일
├── app.html                       # HTML 템플릿
├── lib/
│   ├── clothingService.ts         # 옷 추천 로직
│   ├── components/                # UI 컴포넌트
│   │   ├── WeatherCard.svelte
│   │   ├── HourlyForecast.svelte
│   │   ├── ClothingRecommendation.svelte
│   │   ├── LoadingSpinner.svelte
│   │   └── TimePeriodComparison.svelte
│   └── server/                    # 서버 전용 코드
│       ├── weatherCache.ts        # 캐싱 로직
│       └── weatherService.ts      # API 호출
└── routes/
    ├── +layout.svelte             # 레이아웃
    ├── +page.server.ts            # 서버 데이터 로딩
    ├── +page.svelte               # 메인 페이지
    └── api/
        └── weather/
            └── +server.ts         # 날씨 API 엔드포인트
```

## API 정보

### Open-Meteo
- 완전 무료 (상업용도 포함)
- API 키 불필요
- CORS 지원
- 일일 제한: 10,000건 (비상업용)

### 내부 API

```
GET /api/weather?lat={위도}&lon={경도}
```

- 좌표 없으면 서울 기본값
- 응답에 캐시 키와 캐시 시간 포함

## 라이선스

MIT
