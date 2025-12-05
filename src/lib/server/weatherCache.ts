/**
 * 서버 사이드 날씨 데이터 캐싱
 * 동일 지역의 요청은 캐시에서 반환하여 API 호출 최소화
 */

import type { WeatherData } from '$lib/types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  hourTimestamp: number; // 캐시된 시간의 정시 타임스탬프
}

interface WeatherCache {
  [key: string]: CacheEntry<WeatherData>;
}

export type { WeatherData };

// 인메모리 캐시 (Vercel Serverless 함수 내에서 유지)
const cache: WeatherCache = {};

// 캐시 TTL: 10분 (600,000ms)
const CACHE_TTL = 10 * 60 * 1000;

/**
 * 현재 시간의 정시(hour) 타임스탬프 반환
 * 예: 11:35 → 11:00의 타임스탬프
 */
function getCurrentHourTimestamp(): number {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  return now.getTime();
}

/**
 * 좌표를 격자(grid) 키로 변환
 * 약 10km 반경 내의 요청은 같은 캐시 사용
 * 위도/경도 소수점 첫째자리까지만 사용 (약 11km 정밀도)
 */
export function getGridKey(lat: number, lon: number): string {
  const gridLat = Math.round(lat * 10) / 10;
  const gridLon = Math.round(lon * 10) / 10;
  return `${gridLat},${gridLon}`;
}

/**
 * 캐시에서 데이터 조회
 * 정시가 바뀌면 캐시를 무효화 (시간 단위 업데이트)
 */
export function getFromCache(key: string): { data: WeatherData; isFromCache: boolean } | null {
  const entry = cache[key];
  
  if (!entry) {
    return null;
  }
  
  // 만료 확인
  if (Date.now() > entry.expiresAt) {
    delete cache[key];
    return null;
  }
  
  // 정시가 바뀌었으면 캐시 무효화 (시간 단위 업데이트)
  const currentHour = getCurrentHourTimestamp();
  if (entry.hourTimestamp !== currentHour) {
    console.log(`[Cache INVALIDATE] ${key} - 시간 변경 (${new Date(entry.hourTimestamp).getHours()}시 → ${new Date(currentHour).getHours()}시)`);
    delete cache[key];
    return null;
  }
  
  console.log(`[Cache HIT] ${key}`);
  return { data: entry.data, isFromCache: true };
}

/**
 * 캐시에 데이터 저장
 */
export function setToCache(key: string, data: WeatherData): void {
  const now = Date.now();
  cache[key] = {
    data,
    timestamp: now,
    expiresAt: now + CACHE_TTL,
    hourTimestamp: getCurrentHourTimestamp()
  };
  console.log(`[Cache SET] ${key}, expires in ${CACHE_TTL / 1000}s, hour: ${new Date().getHours()}시`);
}

/**
 * 캐시 통계
 */
export function getCacheStats() {
  const keys = Object.keys(cache);
  const now = Date.now();
  const validEntries = keys.filter(key => cache[key].expiresAt > now);
  
  return {
    totalEntries: keys.length,
    validEntries: validEntries.length,
    expiredEntries: keys.length - validEntries.length
  };
}

/**
 * 만료된 캐시 정리
 */
export function cleanExpiredCache(): void {
  const now = Date.now();
  for (const key of Object.keys(cache)) {
    if (cache[key].expiresAt <= now) {
      delete cache[key];
    }
  }
}

