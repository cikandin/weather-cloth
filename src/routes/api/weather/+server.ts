/**
 * 날씨 API 엔드포인트
 * GET /api/weather?lat=37.5665&lon=126.978
 * 
 * 서버 사이드 캐싱으로 동일 지역 요청 최적화
 * Cache-Control 헤더로 Vercel Edge Cache도 활용
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getWeatherData, getDefaultWeatherData } from '$lib/server/weatherService';
import { getCacheStats } from '$lib/server/weatherCache';

export const GET: RequestHandler = async ({ url, setHeaders }) => {
  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');
  
  try {
    let weatherData;
    
    if (lat && lon) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      
      // 유효성 검사
      if (isNaN(latitude) || isNaN(longitude)) {
        return json({ error: 'Invalid coordinates' }, { status: 400 });
      }
      
      // 한국 범위 체크 (대략적인 범위)
      if (latitude < 33 || latitude > 43 || longitude < 124 || longitude > 132) {
        console.warn('Coordinates outside Korea, using default location');
        weatherData = await getDefaultWeatherData();
      } else {
        weatherData = await getWeatherData(latitude, longitude);
      }
    } else {
      // 좌표 없으면 서울 기본값
      weatherData = await getDefaultWeatherData();
    }
    
    // Vercel Edge Cache 설정 (10분 캐시, 1시간 stale-while-revalidate)
    setHeaders({
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600'
    });
    
    // 캐시 통계 로깅
    const stats = getCacheStats();
    console.log(`[Cache Stats] Valid: ${stats.validEntries}, Expired: ${stats.expiredEntries}`);
    
    return json(weatherData);
    
  } catch (error) {
    console.error('Weather API error:', error);
    return json(
      { error: 'Failed to fetch weather data' }, 
      { status: 500 }
    );
  }
};

