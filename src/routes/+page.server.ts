/**
 * 서버 사이드 데이터 로딩
 * 초기 페이지 로드 시 서울 날씨를 미리 가져옴
 */

import type { PageServerLoad } from './$types';
import { getDefaultWeatherData } from '$lib/server/weatherService';

export const load: PageServerLoad = async ({ setHeaders }) => {
  try {
    // 기본 위치(서울) 날씨 미리 로드
    const weatherData = await getDefaultWeatherData();
    
    // Vercel Edge Cache 설정
    setHeaders({
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600'
    });
    
    return {
      initialWeather: weatherData
    };
  } catch (error) {
    console.error('Failed to load initial weather:', error);
    return {
      initialWeather: null
    };
  }
};

