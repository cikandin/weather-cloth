<script lang="ts">
  import { getWeatherIconUrl } from '$lib/clothingService';
  import type { HourlyWeather } from '$lib/types';

  let { forecast = [] }: { forecast?: HourlyWeather[] } = $props();

  function formatHour(timeStr: string): string {
    const date = new Date(timeStr);
    return date.getHours().toString().padStart(2, '0') + ':00';
  }

  function getTemperatureClass(t: number): string {
    if (t < 5) return 'temp-cold';
    if (t < 15) return 'temp-cool';
    if (t < 23) return 'temp-mild';
    if (t < 28) return 'temp-warm';
    return 'temp-hot';
  }
</script>

<div class="cloth-card rounded-3xl p-6 shadow-lg">
  <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
    </svg>
    시간별 날씨
  </h3>
  
  <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
    {#each forecast.slice(0, 12) as hour, i}
      <div 
        class="flex-shrink-0 text-center bg-gradient-to-b from-blue-50 to-indigo-50 rounded-2xl p-4 min-w-[80px] transition-transform hover:scale-105"
        style="animation-delay: {i * 0.05}s"
      >
        <p class="text-gray-500 text-sm font-medium">{formatHour(hour.time)}</p>
        <img 
          src={getWeatherIconUrl(hour.icon)} 
          alt={hour.description}
          class="w-12 h-12 mx-auto"
        />
        <p class="font-bold text-xl {getTemperatureClass(hour.temp)}">{hour.temp}°</p>
        {#if hour.pop > 0}
          <p class="text-blue-500 text-xs mt-1 flex items-center justify-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4 4 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clip-rule="evenodd" />
            </svg>
            {hour.pop}%
          </p>
        {/if}
      </div>
    {/each}
  </div>
</div>

