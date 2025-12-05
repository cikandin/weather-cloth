/**
 * 옷 추천 서비스
 * 체온 유지 관점에서 옷 두께 레벨 가이드 제공
 */

export type AgeGroup = 'child' | 'adult' | 'senior';

// 보온 레벨 (1-5, 높을수록 두꺼운 옷 필요)
export type WarmthLevel = 1 | 2 | 3 | 4 | 5;

// 겉옷 두께 단계
export const OUTER_LEVELS = [
  { level: 5, name: '롱패딩/두꺼운 코트', desc: '한파 대비 최대 보온', icon: '🧥' },
  { level: 4, name: '숏패딩/코트', desc: '겨울용 보온', icon: '🧥' },
  { level: 3, name: '자켓/바람막이', desc: '쌀쌀한 날씨 대비', icon: '🧤' },
  { level: 2, name: '가디건/얇은 겉옷', desc: '환절기용', icon: '👔' },
  { level: 1, name: '겉옷 불필요', desc: '따뜻한 날씨', icon: '✨' },
] as const;

// 상의 두께 단계
export const TOP_LEVELS = [
  { level: 5, name: '히트텍 + 니트', desc: '레이어드 필수', icon: '🧶' },
  { level: 4, name: '두꺼운 니트/기모', desc: '보온 상의', icon: '🧶' },
  { level: 3, name: '맨투맨/후드티', desc: '적당한 두께', icon: '👕' },
  { level: 2, name: '긴팔 티셔츠', desc: '얇은 긴팔', icon: '👕' },
  { level: 1, name: '반팔/민소매', desc: '시원한 상의', icon: '👕' },
] as const;

// 하의 두께 단계
export const BOTTOM_LEVELS = [
  { level: 5, name: '기모바지/내복', desc: '최대 보온', icon: '👖' },
  { level: 4, name: '두꺼운 청바지', desc: '겨울용 하의', icon: '👖' },
  { level: 3, name: '청바지/슬랙스', desc: '일반 긴바지', icon: '👖' },
  { level: 2, name: '얇은 면바지', desc: '가벼운 긴바지', icon: '👖' },
  { level: 1, name: '반바지/치마', desc: '시원한 하의', icon: '🩳' },
] as const;

// 온도별 보온 레벨 매핑
function getWarmthLevel(temp: number): WarmthLevel {
  if (temp < 0) return 5;      // 영하: 최대 보온
  if (temp < 5) return 5;      // 0~5도: 최대 보온
  if (temp < 10) return 4;     // 5~10도: 높은 보온
  if (temp < 15) return 3;     // 10~15도: 중간 보온
  if (temp < 20) return 2;     // 15~20도: 낮은 보온
  return 1;                    // 20도 이상: 보온 불필요
}

// 온도 구간별 라벨
function getTemperatureLabel(temp: number): { label: string; emoji: string; colorClass: string } {
  if (temp < 0) return { label: '한파', emoji: '🥶', colorClass: 'text-blue-600' };
  if (temp < 5) return { label: '매우 추움', emoji: '🧊', colorClass: 'text-blue-500' };
  if (temp < 10) return { label: '추움', emoji: '❄️', colorClass: 'text-cyan-500' };
  if (temp < 15) return { label: '쌀쌀함', emoji: '🍂', colorClass: 'text-teal-500' };
  if (temp < 20) return { label: '선선함', emoji: '🌤️', colorClass: 'text-green-500' };
  if (temp < 25) return { label: '따뜻함', emoji: '☀️', colorClass: 'text-yellow-500' };
  if (temp < 30) return { label: '더움', emoji: '🌞', colorClass: 'text-orange-500' };
  return { label: '폭염', emoji: '🥵', colorClass: 'text-red-500' };
}

// 나이대별 조정
const AGE_ADJUSTMENTS: Record<AgeGroup, { tempOffset: number; tip: string }> = {
  child: {
    tempOffset: 2,
    tip: '아이들은 활동량이 많아요. 한 단계 얇게 입혀도 괜찮아요!'
  },
  adult: {
    tempOffset: 0,
    tip: ''
  },
  senior: {
    tempOffset: -3,
    tip: '어르신은 체온 유지가 중요해요. 한 단계 두껍게 입으세요!'
  }
};

// 날씨별 필수 아이템
interface WeatherEssential {
  item: string;
  icon: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

function getWeatherEssentials(
  condition: string, 
  rainProbability: number,
  temp: number
): WeatherEssential[] {
  const essentials: WeatherEssential[] = [];

  // 비/눈 관련
  if (condition === 'Rain' || condition === 'Thunderstorm' || rainProbability >= 50) {
    essentials.push({
      item: '우산',
      icon: '☔',
      reason: '비 예보',
      priority: 'high'
    });
    if (rainProbability >= 70 || condition === 'Thunderstorm') {
      essentials.push({
        item: '방수 신발/장화',
        icon: '🥾',
        reason: '강한 비 예상',
        priority: 'high'
      });
    }
  } else if (rainProbability >= 30) {
    essentials.push({
      item: '접이식 우산',
      icon: '🌂',
      reason: `강수 확률 ${rainProbability}%`,
      priority: 'medium'
    });
  }

  if (condition === 'Snow') {
    essentials.push({
      item: '방수 부츠',
      icon: '🥾',
      reason: '눈 예보',
      priority: 'high'
    });
    essentials.push({
      item: '장갑',
      icon: '🧤',
      reason: '눈길 대비',
      priority: 'high'
    });
  }

  if (condition === 'Drizzle') {
    essentials.push({
      item: '우산',
      icon: '🌂',
      reason: '이슬비',
      priority: 'medium'
    });
  }

  // 추위 관련
  if (temp < 0) {
    essentials.push({
      item: '핫팩',
      icon: '🔥',
      reason: '영하 날씨',
      priority: 'medium'
    });
    essentials.push({
      item: '귀마개/목도리',
      icon: '🧣',
      reason: '동상 예방',
      priority: 'high'
    });
    essentials.push({
      item: '장갑',
      icon: '🧤',
      reason: '손 보호',
      priority: 'high'
    });
  } else if (temp < 5) {
    essentials.push({
      item: '목도리/장갑',
      icon: '🧣',
      reason: '추위 대비',
      priority: 'medium'
    });
  }

  // 더위 관련
  if (temp >= 28) {
    essentials.push({
      item: '선크림',
      icon: '🧴',
      reason: '자외선 차단',
      priority: 'high'
    });
    essentials.push({
      item: '모자/양산',
      icon: '🧢',
      reason: '햇빛 차단',
      priority: 'high'
    });
    essentials.push({
      item: '물병',
      icon: '💧',
      reason: '수분 섭취',
      priority: 'high'
    });
  } else if (temp >= 25 && (condition === 'Clear' || condition === 'Clouds')) {
    essentials.push({
      item: '선글라스',
      icon: '🕶️',
      reason: '눈 보호',
      priority: 'low'
    });
    essentials.push({
      item: '선크림',
      icon: '🧴',
      reason: '자외선 차단',
      priority: 'medium'
    });
  }

  // 안개
  if (condition === 'Fog') {
    essentials.push({
      item: '밝은 색 옷',
      icon: '👀',
      reason: '시인성 확보',
      priority: 'medium'
    });
  }

  return essentials;
}

// 일교차 경고
function getTempDifferenceWarning(minTemp: number, maxTemp: number): string | null {
  const diff = maxTemp - minTemp;
  if (diff >= 15) return `⚠️ 일교차 ${diff}도! 겉옷을 꼭 챙기세요`;
  if (diff >= 10) return `📝 일교차 ${diff}도, 레이어드 추천`;
  return null;
}

export interface ClothingRecommendation {
  // 온도 정보
  temperature: {
    current: number;
    feelsLike: number;
    adjustedFeelsLike: number;
    min: number;
    max: number;
    label: string;
    emoji: string;
    colorClass: string;
  };
  
  // 보온 레벨 (1-5)
  warmthLevel: WarmthLevel;
  
  // 추천 두께
  outer: typeof OUTER_LEVELS[number];
  top: typeof TOP_LEVELS[number];
  bottom: typeof BOTTOM_LEVELS[number];
  
  // 실내용 (한 단계 얇게)
  indoorOuter: typeof OUTER_LEVELS[number];
  indoorTop: typeof TOP_LEVELS[number];
  
  // 날씨 필수품
  essentials: WeatherEssential[];
  
  // 경고/팁
  warnings: string[];
  ageTip: string;
  
  // 프로필
  profile: {
    ageGroup: AgeGroup;
    ageLabel: string;
  };
}

/**
 * 메인 옷 추천 함수
 */
export function getClothingRecommendation(params: {
  currentTemp: number;
  feelsLike: number;
  minTemp: number;
  maxTemp: number;
  condition: string;
  rainProbability: number;
  morningTemp?: number;
  afternoonTemp?: number;
  ageGroup?: AgeGroup;
}): ClothingRecommendation {
  const { 
    currentTemp, 
    feelsLike, 
    minTemp, 
    maxTemp, 
    condition, 
    rainProbability,
    ageGroup = 'adult'
  } = params;
  
  // 나이대별 체감온도 보정
  const ageAdjust = AGE_ADJUSTMENTS[ageGroup];
  const adjustedFeelsLike = (feelsLike ?? currentTemp) + ageAdjust.tempOffset;
  
  // 보온 레벨 계산
  const warmthLevel = getWarmthLevel(adjustedFeelsLike);
  const tempLabel = getTemperatureLabel(adjustedFeelsLike);
  
  // 레벨에 맞는 옷 두께 찾기
  const outer = OUTER_LEVELS.find(o => o.level === warmthLevel) || OUTER_LEVELS[4];
  const top = TOP_LEVELS.find(t => t.level === warmthLevel) || TOP_LEVELS[4];
  const bottom = BOTTOM_LEVELS.find(b => b.level === warmthLevel) || BOTTOM_LEVELS[4];
  
  // 실내용 (한 단계 얇게, 최소 레벨 1)
  const indoorLevel = Math.max(1, warmthLevel - 1) as WarmthLevel;
  const indoorOuter = OUTER_LEVELS.find(o => o.level === indoorLevel) || OUTER_LEVELS[4];
  const indoorTop = TOP_LEVELS.find(t => t.level === indoorLevel) || TOP_LEVELS[4];
  
  // 날씨 필수품
  const essentials = getWeatherEssentials(condition, rainProbability, adjustedFeelsLike);
  
  // 경고 메시지
  const warnings: string[] = [];
  const tempDiffWarning = getTempDifferenceWarning(minTemp, maxTemp);
  if (tempDiffWarning) warnings.push(tempDiffWarning);
  
  if (condition === 'Thunderstorm') {
    warnings.push('⛈️ 천둥번개 예보! 가급적 외출을 자제하세요');
  }
  
  if (adjustedFeelsLike < -10) {
    warnings.push('🚨 체감온도 -10도 이하! 피부 노출을 최소화하세요');
  }
  
  if (adjustedFeelsLike >= 33) {
    warnings.push('🚨 폭염 경보! 야외 활동을 자제하세요');
  }

  // 나이 라벨
  const ageLabels: Record<AgeGroup, string> = { child: '아동', adult: '성인', senior: '시니어' };

  return {
    temperature: {
      current: currentTemp,
      feelsLike,
      adjustedFeelsLike,
      min: minTemp,
      max: maxTemp,
      ...tempLabel
    },
    warmthLevel,
    outer,
    top,
    bottom,
    indoorOuter,
    indoorTop,
    essentials,
    warnings,
    ageTip: ageAdjust.tip,
    profile: {
      ageGroup,
      ageLabel: ageLabels[ageGroup]
    }
  };
}

/**
 * 아이콘 URL 생성
 */
export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
