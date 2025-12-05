<script lang="ts">
  import { getWeatherIconUrl } from '$lib/clothingService';

  let { 
    temp = 0,
    feelsLike = 0,
    description = '',
    icon = '01d',
    humidity = 0,
    windSpeed = 0,
    city = '서울'
  }: {
    temp?: number;
    feelsLike?: number;
    description?: string;
    icon?: string;
    humidity?: number;
    windSpeed?: number;
    city?: string;
  } = $props();

  function getTemperatureClass(t: number): string {
    if (t < 5) return 'temp-cold';
    if (t < 15) return 'temp-cool';
    if (t < 23) return 'temp-mild';
    if (t < 28) return 'temp-warm';
    return 'temp-hot';
  }
</script>

<div class="weather-card rounded-3xl p-8 text-white shadow-xl">
  <div class="flex items-center justify-between mb-6">
    <div>
      <p class="text-white/70 text-lg font-medium flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
        </svg>
        {city}
      </p>
      <h2 class="text-5xl font-bold mt-2 {getTemperatureClass(temp)}">
        {temp}°
      </h2>
      <p class="text-white/60 mt-1">체감 {feelsLike}°</p>
    </div>
    <div class="text-center">
      <img 
        src={getWeatherIconUrl(icon)} 
        alt={description}
        class="w-24 h-24 bounce-soft"
      />
      <p class="text-white/90 font-medium capitalize">{description}</p>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/20">
    <div class="flex items-center gap-3">
      <div class="bg-white/20 rounded-full p-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4 4 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clip-rule="evenodd" />
        </svg>
      </div>
      <div>
        <p class="text-white/60 text-sm">습도</p>
        <p class="font-semibold">{humidity}%</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <div class="bg-white/20 rounded-full p-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
        </svg>
      </div>
      <div>
        <p class="text-white/60 text-sm">풍속</p>
        <p class="font-semibold">{windSpeed.toFixed(1)} m/s</p>
      </div>
    </div>
  </div>
</div>

