/**
 * 서버 사이드 날씨 서비스
 * Open-Meteo API 호출 및 데이터 변환
 */

import type { WeatherData, HourlyWeather } from '$lib/types';
import { getGridKey, getFromCache, setToCache } from './weatherCache';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

// 주요 도시 좌표 매핑
const CITIES: { name: string; lat: number; lon: number; range: number }[] = [
  { name: '서울', lat: 37.5665, lon: 126.978, range: 0.3 },
  { name: '부산', lat: 35.1796, lon: 129.0756, range: 0.3 },
  { name: '대구', lat: 35.8714, lon: 128.6014, range: 0.3 },
  { name: '인천', lat: 37.4563, lon: 126.7052, range: 0.3 },
  { name: '광주', lat: 35.1595, lon: 126.8526, range: 0.3 },
  { name: '대전', lat: 36.3504, lon: 127.3845, range: 0.3 },
  { name: '울산', lat: 35.5384, lon: 129.3114, range: 0.3 },
  { name: '세종', lat: 36.48, lon: 127.289, range: 0.2 },
  { name: '수원', lat: 37.2636, lon: 127.0286, range: 0.2 },
  { name: '고양', lat: 37.6584, lon: 126.832, range: 0.2 },
  { name: '용인', lat: 37.2411, lon: 127.1776, range: 0.2 },
  { name: '성남', lat: 37.42, lon: 127.1267, range: 0.2 },
  { name: '청주', lat: 36.6424, lon: 127.489, range: 0.2 },
  { name: '전주', lat: 35.8242, lon: 127.148, range: 0.2 },
  { name: '천안', lat: 36.8151, lon: 127.1139, range: 0.2 },
  { name: '제주', lat: 33.4996, lon: 126.5312, range: 0.3 },
];

/**
 * 좌표로 도시 이름 찾기
 */
function getCityName(lat: number, lon: number): string {
  for (const city of CITIES) {
    const latDiff = Math.abs(lat - city.lat);
    const lonDiff = Math.abs(lon - city.lon);
    if (latDiff < city.range && lonDiff < city.range) {
      return city.name;
    }
  }
  return '현재 위치';
}

/**
 * WMO 날씨 코드를 날씨 정보로 변환
 */
function getWeatherInfo(weatherCode: number, hour: number): { main: string; description: string; icon: string } {
  const isDaytime = hour >= 6 && hour < 18;
  const suffix = isDaytime ? 'd' : 'n';

  const weatherMap: Record<number, { main: string; description: string; icon: string }> = {
    0: { main: 'Clear', description: '맑음', icon: `01${suffix}` },
    1: { main: 'Clear', description: '대체로 맑음', icon: `01${suffix}` },
    2: { main: 'Clouds', description: '구름 조금', icon: `02${suffix}` },
    3: { main: 'Clouds', description: '흐림', icon: `04${suffix}` },
    45: { main: 'Fog', description: '안개', icon: `50${suffix}` },
    48: { main: 'Fog', description: '짙은 안개', icon: `50${suffix}` },
    51: { main: 'Drizzle', description: '이슬비', icon: `09${suffix}` },
    53: { main: 'Drizzle', description: '이슬비', icon: `09${suffix}` },
    55: { main: 'Drizzle', description: '이슬비', icon: `09${suffix}` },
    61: { main: 'Rain', description: '약한 비', icon: `10${suffix}` },
    63: { main: 'Rain', description: '비', icon: `10${suffix}` },
    65: { main: 'Rain', description: '강한 비', icon: `10${suffix}` },
    71: { main: 'Snow', description: '약한 눈', icon: `13${suffix}` },
    73: { main: 'Snow', description: '눈', icon: `13${suffix}` },
    75: { main: 'Snow', description: '강한 눈', icon: `13${suffix}` },
    80: { main: 'Rain', description: '소나기', icon: `09${suffix}` },
    81: { main: 'Rain', description: '소나기', icon: `09${suffix}` },
    82: { main: 'Rain', description: '강한 소나기', icon: `09${suffix}` },
    85: { main: 'Snow', description: '눈보라', icon: `13${suffix}` },
    86: { main: 'Snow', description: '강한 눈보라', icon: `13${suffix}` },
    95: { main: 'Thunderstorm', description: '뇌우', icon: `11${suffix}` },
    96: { main: 'Thunderstorm', description: '우박 뇌우', icon: `11${suffix}` },
    99: { main: 'Thunderstorm', description: '강한 우박 뇌우', icon: `11${suffix}` },
  };

  return weatherMap[weatherCode] || { main: 'Clear', description: '맑음', icon: `01${suffix}` };
}

/**
 * Open-Meteo API 호출
 */
async function fetchFromOpenMeteo(lat: number, lon: number) {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'weather_code',
      'wind_speed_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'weather_code',
      'wind_speed_10m',
    ].join(','),
    timezone: 'Asia/Seoul',
    forecast_days: '2',
  });

  const response = await fetch(`${FORECAST_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`);
  }

  return await response.json();
}

/**
 * 날씨 데이터 가져오기 (캐싱 적용)
 * 정시가 바뀌면 캐시를 무효화하여 시간 단위 업데이트 보장
 */
export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  // 캐시 키 생성
  const cacheKey = getGridKey(lat, lon);
  const currentHour = new Date().getHours();
  
  // 캐시 확인
  const cached = getFromCache(cacheKey);
  if (cached) {
    // 캐시 데이터에 isFromCache 플래그 추가하여 반환
    return {
      ...cached.data,
      isFromCache: true,
      dataHour: currentHour
    };
  }
  
  console.log(`[Cache MISS] ${cacheKey}, fetching from API...`);
  
  // API 호출
  const data = await fetchFromOpenMeteo(lat, lon);
  
  // 데이터 변환
  const currentWeatherInfo = getWeatherInfo(data.current.weather_code, currentHour);
  
  const hourly: HourlyWeather[] = data.hourly.time.slice(0, 48).map((time: string, index: number) => {
    const date = new Date(time);
    const hour = date.getHours();
    const weatherInfo = getWeatherInfo(data.hourly.weather_code[index], hour);
    
    return {
      time,
      temp: Math.round(data.hourly.temperature_2m[index]),
      feelsLike: Math.round(data.hourly.apparent_temperature[index]),
      humidity: data.hourly.relative_humidity_2m[index],
      windSpeed: Math.round(data.hourly.wind_speed_10m[index] / 3.6 * 10) / 10,
      description: weatherInfo.description,
      icon: weatherInfo.icon,
      main: weatherInfo.main,
      pop: (data.hourly.precipitation_probability[index] || 0),
    };
  });
  
  const weatherData: WeatherData = {
    current: {
      temp: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m / 3.6 * 10) / 10,
      description: currentWeatherInfo.description,
      icon: currentWeatherInfo.icon,
      main: currentWeatherInfo.main,
    },
    hourly,
    location: {
      city: getCityName(lat, lon),
      lat,
      lon,
    },
    cachedAt: Date.now(),
    cacheKey,
    isFromCache: false,
    dataHour: currentHour,
  };
  
  // 캐시에 저장
  setToCache(cacheKey, weatherData);
  
  return weatherData;
}

/**
 * 기본 위치 (서울) 날씨 가져오기
 */
export async function getDefaultWeatherData(): Promise<WeatherData> {
  return getWeatherData(37.5665, 126.978);
}

