/**
 * 공유 타입 정의
 */

export interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
    main: string;
  };
  hourly: HourlyWeather[];
  location: {
    city: string;
    lat: number;
    lon: number;
  };
  cachedAt: number;
  cacheKey: string;
  isFromCache: boolean; // 캐시에서 가져온 데이터인지 여부
  dataHour: number; // 데이터가 속한 시간대 (정시 기준)
}

export interface HourlyWeather {
  time: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  main: string;
  pop: number;
}

