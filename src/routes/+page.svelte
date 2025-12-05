<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import WeatherCard from '$lib/components/WeatherCard.svelte';
  import HourlyForecast from '$lib/components/HourlyForecast.svelte';
  import ClothingRecommendation from '$lib/components/ClothingRecommendation.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import TimePeriodComparison from '$lib/components/TimePeriodComparison.svelte';
  import ProfileSelector from '$lib/components/ProfileSelector.svelte';
  import { getClothingRecommendation, type ClothingRecommendation as ClothingRec, type AgeGroup } from '$lib/clothingService';
  import type { WeatherData, HourlyWeather } from '$lib/types';

  let { data } = $props();
  
  let weatherData = $state<WeatherData | null>(data.initialWeather);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let recommendation = $state<ClothingRec | null>(null);
  let userLocation = $state<{ lat: number; lon: number } | null>(null);

  // URL 쿼리에서 나이대 설정 읽기
  let ageGroup = $state<AgeGroup>('adult');

  // URL 쿼리 파라미터 동기화
  $effect(() => {
    const ageParam = $page.url.searchParams.get('age');
    
    if (ageParam && ['child', 'adult', 'senior'].includes(ageParam)) {
      ageGroup = ageParam as AgeGroup;
    }
  });

  // 나이대 변경 시 추천 업데이트
  function handleAgeChange(newAgeGroup: string) {
    ageGroup = newAgeGroup as AgeGroup;
    updateRecommendation();
  }

  // 날짜 포맷
  function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    };
    return date.toLocaleDateString('ko-KR', options);
  }

  // 인사말
  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 6) return '좋은 새벽이에요! 🌙';
    if (hour < 12) return '좋은 아침이에요! ☀️';
    if (hour < 18) return '좋은 오후에요! 🌤️';
    return '좋은 저녁이에요! 🌆';
  }

  // 시간대별 온도 계산
  function getTimePeriodTemps(hourly: HourlyWeather[]) {
    const now = new Date();
    
    const todayHourly = hourly.filter(h => {
      const hDate = new Date(h.time);
      return hDate.getDate() === now.getDate();
    });

    const morningHours = todayHourly.filter(h => {
      const hour = new Date(h.time).getHours();
      return hour >= 6 && hour <= 9;
    });

    const afternoonHours = todayHourly.filter(h => {
      const hour = new Date(h.time).getHours();
      return hour >= 12 && hour <= 18;
    });

    const calcStats = (hours: HourlyWeather[]) => {
      if (hours.length === 0) return { avg: 0, min: 0, max: 0 };
      const temps = hours.map(h => h.temp);
      return {
        avg: Math.round(temps.reduce((a, b) => a + b, 0) / temps.length),
        min: Math.min(...temps),
        max: Math.max(...temps)
      };
    };

    return {
      morning: calcStats(morningHours),
      afternoon: calcStats(afternoonHours)
    };
  }

  // 옷 추천 계산
  function updateRecommendation() {
    if (!weatherData) return;

    const todayTemps = weatherData.hourly.slice(0, 24).map(h => h.temp);
    const minTemp = Math.min(...todayTemps);
    const maxTemp = Math.max(...todayTemps);
    const maxPop = Math.max(...weatherData.hourly.slice(0, 24).map(h => h.pop));

    const timePeriod = getTimePeriodTemps(weatherData.hourly);

    recommendation = getClothingRecommendation({
      currentTemp: weatherData.current.temp,
      feelsLike: weatherData.current.feelsLike,
      minTemp,
      maxTemp,
      condition: weatherData.current.main,
      rainProbability: maxPop,
      morningTemp: timePeriod.morning.avg,
      afternoonTemp: timePeriod.afternoon.avg,
      ageGroup
    });
  }

  // 날씨 데이터 가져오기
  async function fetchWeather(lat?: number, lon?: number) {
    isLoading = true;
    error = null;

    try {
      const params = lat && lon ? `?lat=${lat}&lon=${lon}` : '';
      const response = await fetch(`/api/weather${params}`);
      
      if (!response.ok) {
        throw new Error('날씨 정보를 가져올 수 없습니다.');
      }

      weatherData = await response.json();
      updateRecommendation();
    } catch (e) {
      error = e instanceof Error ? e.message : '알 수 없는 오류';
    } finally {
      isLoading = false;
    }
  }

  // 현재 위치로 새로고침
  async function refreshWithLocation() {
    if (!navigator.geolocation) {
      await fetchWeather();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        await fetchWeather(userLocation.lat, userLocation.lon);
      },
      async () => {
        await fetchWeather();
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // 새로고침 버튼 핸들러
  async function handleRefresh() {
    if (userLocation) {
      await fetchWeather(userLocation.lat, userLocation.lon);
    } else {
      await refreshWithLocation();
    }
  }

  // 초기 로드 시 추천 계산
  onMount(() => {
    if (weatherData) {
      updateRecommendation();
    }
    refreshWithLocation();
  });

  // 파생 값들
  const timePeriodTemps = $derived(
    weatherData ? getTimePeriodTemps(weatherData.hourly) : null
  );
</script>

<div class="min-h-screen animated-gradient">
  <!-- 헤더 -->
  <header class="pt-8 pb-4 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between">
        <div class="text-white">
          <h1 class="text-3xl font-bold flex items-center gap-3">
            <span class="text-4xl">👔</span>
            오늘 뭐 입지?
          </h1>
          <p class="text-white/70 mt-1">{formatDate(new Date())}</p>
        </div>
        <button 
          onclick={handleRefresh}
          class="btn btn-circle btn-ghost text-white hover:bg-white/20"
          disabled={isLoading}
          aria-label="새로고침"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-6 w-6 {isLoading ? 'animate-spin' : ''}" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      <p class="text-white/90 text-xl mt-2">{getGreeting()}</p>
    </div>
  </header>

  <!-- 메인 콘텐츠 -->
  <main class="px-4 pb-12">
    <div class="max-w-4xl mx-auto space-y-6">
      {#if isLoading && !weatherData}
        <LoadingSpinner />
      {:else if error && !weatherData}
        <div class="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-2xl">
          <div class="flex items-center gap-3">
            <span class="text-2xl">⚠️</span>
            <div>
              <p class="font-bold">날씨 정보를 가져올 수 없습니다</p>
              <p class="text-sm">{error}</p>
            </div>
          </div>
          <button 
            onclick={handleRefresh}
            class="btn btn-sm btn-error mt-4"
          >
            다시 시도
          </button>
        </div>
      {:else if weatherData}
        <!-- 현재 날씨 카드 -->
        <div class="fade-in-up opacity-0">
          <WeatherCard 
            temp={weatherData.current.temp}
            feelsLike={weatherData.current.feelsLike}
            description={weatherData.current.description}
            icon={weatherData.current.icon}
            humidity={weatherData.current.humidity}
            windSpeed={weatherData.current.windSpeed}
            city={weatherData.location.city}
          />
        </div>

        <!-- 나이대 선택 -->
        <div class="fade-in-up opacity-0 delay-100">
          <ProfileSelector 
            {ageGroup}
            onchange={handleAgeChange}
          />
        </div>

        <!-- 옷 추천 -->
        {#if recommendation}
          <div class="fade-in-up opacity-0 delay-200">
            <ClothingRecommendation {recommendation} />
          </div>
        {/if}

        <!-- 시간별 날씨 -->
        {#if weatherData.hourly.length > 0}
          <div class="fade-in-up opacity-0 delay-300">
            <HourlyForecast forecast={weatherData.hourly} />
          </div>
        {/if}

        <!-- 아침/오후 비교 -->
        {#if timePeriodTemps}
          <div class="fade-in-up opacity-0 delay-400">
            <TimePeriodComparison 
              morningAvg={timePeriodTemps.morning.avg}
              morningMin={timePeriodTemps.morning.min}
              morningMax={timePeriodTemps.morning.max}
              afternoonAvg={timePeriodTemps.afternoon.avg}
              afternoonMin={timePeriodTemps.afternoon.min}
              afternoonMax={timePeriodTemps.afternoon.max}
            />
          </div>
        {/if}

      {/if}
    </div>
  </main>

  <!-- 푸터 -->
  <footer class="text-center pb-8 text-white/60">
    {#if weatherData}
      <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto mb-4">
        <div class="flex items-center justify-center gap-2 text-sm">
          {#if userLocation}
            <span class="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              <span class="text-green-300">내 위치</span>
              <span class="text-white/50">({userLocation.lat.toFixed(2)}, {userLocation.lon.toFixed(2)})</span>
            </span>
          {:else}
            <span class="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              <span class="text-yellow-300">기본 위치 (서울)</span>
            </span>
          {/if}
        </div>
        
        <div class="flex items-center justify-center gap-3 mt-2 text-xs">
          {#if weatherData.isFromCache}
            <span class="flex items-center gap-1 bg-blue-500/30 px-2 py-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
              </svg>
              캐시 데이터
            </span>
          {:else}
            <span class="flex items-center gap-1 bg-green-500/30 px-2 py-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              실시간 데이터
            </span>
          {/if}
          
          <span class="text-white/50">
            {weatherData.dataHour}시 기준 | {new Date(weatherData.cachedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 조회
          </span>
        </div>
        
        <div class="text-white/30 text-xs mt-2">
          지역 코드: {weatherData.cacheKey}
        </div>
      </div>
    {:else}
      <p class="text-xs mb-4">
        💡 더 정확한 정보를 위해 위치 접근을 허용해주세요
      </p>
    {/if}
    
    <p class="text-sm">
      날씨 데이터: Open-Meteo (정시 단위 갱신)
    </p>
    <p class="text-xs mt-3 text-white/40">
      © 2025 Jung Siyoung. All rights reserved.
    </p>
  </footer>
</div>
