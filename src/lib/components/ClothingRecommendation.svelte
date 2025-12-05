<script lang="ts">
  import type { ClothingRecommendation } from '$lib/clothingService';
  import { OUTER_LEVELS, TOP_LEVELS, BOTTOM_LEVELS } from '$lib/clothingService';

  let { recommendation }: { recommendation: ClothingRecommendation | null } = $props();

  let activeTab = $state<'outdoor' | 'indoor'>('outdoor');

  // 보온 레벨 색상
  function getLevelColor(level: number): string {
    const colors: Record<number, string> = {
      5: 'from-blue-600 to-blue-800',
      4: 'from-blue-400 to-blue-600',
      3: 'from-cyan-400 to-blue-400',
      2: 'from-green-400 to-cyan-400',
      1: 'from-yellow-400 to-green-400',
    };
    return colors[level] || colors[3];
  }

  // 레벨 바 너비
  function getLevelWidth(level: number): string {
    return `${level * 20}%`;
  }
</script>

{#if recommendation}
<div class="cloth-card rounded-3xl p-6 shadow-lg">
  <!-- 헤더 -->
  <div class="flex items-center justify-between mb-4">
    <div>
      <h3 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
        <span class="text-4xl">{recommendation.temperature.emoji}</span>
        오늘의 옷차림 가이드
      </h3>
      <div class="flex items-center gap-2 mt-1">
        <span class="text-gray-500">체감</span>
        <span class="text-2xl font-bold {recommendation.temperature.colorClass}">
          {recommendation.temperature.adjustedFeelsLike}°
        </span>
        <span class="px-2 py-1 rounded-full text-sm font-medium bg-gray-100 {recommendation.temperature.colorClass}">
          {recommendation.temperature.label}
        </span>
      </div>
      {#if recommendation.profile.ageGroup !== 'adult'}
        <p class="text-sm text-purple-600 mt-1">
          {recommendation.profile.ageLabel} 기준 보정 적용
        </p>
      {/if}
    </div>
    <div class="text-right">
      <p class="text-sm text-gray-500">오늘 기온</p>
      <p class="font-bold text-lg">
        <span class="text-blue-500">{recommendation.temperature.min}°</span>
        <span class="text-gray-400 mx-1">~</span>
        <span class="text-red-500">{recommendation.temperature.max}°</span>
      </p>
    </div>
  </div>

  <!-- 경고 메시지 -->
  {#if recommendation.warnings.length > 0}
    <div class="mb-4 space-y-2">
      {#each recommendation.warnings as warning}
        <div class="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 rounded-r-xl">
          <p class="text-amber-800 font-medium">{warning}</p>
        </div>
      {/each}
    </div>
  {/if}

  <!-- 실외/실내 탭 -->
  <div class="flex gap-2 mb-6">
    <button
      onclick={() => activeTab = 'outdoor'}
      class="flex-1 py-3 px-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 {activeTab === 'outdoor' 
        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
    >
      <span class="text-xl">🚶</span>
      외출할 때
    </button>
    <button
      onclick={() => activeTab = 'indoor'}
      class="flex-1 py-3 px-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 {activeTab === 'indoor' 
        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
    >
      <span class="text-xl">🏢</span>
      실내 생활
    </button>
  </div>

  <!-- 보온 레벨 가이드 -->
  <div class="space-y-4 mb-6">
    <!-- 겉옷 -->
    <div class="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="font-bold text-gray-700 flex items-center gap-2">
          <span class="text-xl">🧥</span> 겉옷
        </span>
        <span class="text-sm text-gray-500">두께 레벨</span>
      </div>
      
      <!-- 레벨 바 -->
      <div class="relative h-8 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div 
          class="absolute inset-y-0 left-0 bg-gradient-to-r {getLevelColor(activeTab === 'outdoor' ? recommendation.outer.level : recommendation.indoorOuter.level)} rounded-full transition-all duration-500"
          style="width: {getLevelWidth(activeTab === 'outdoor' ? recommendation.outer.level : recommendation.indoorOuter.level)}"
        ></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="font-bold text-white drop-shadow-md">
            {activeTab === 'outdoor' ? recommendation.outer.name : recommendation.indoorOuter.name}
          </span>
        </div>
      </div>
      
      <p class="text-sm text-gray-500 text-center">
        {activeTab === 'outdoor' ? recommendation.outer.desc : recommendation.indoorOuter.desc}
      </p>
      
      <!-- 레벨 범례 -->
      <div class="flex justify-between text-xs text-gray-400 mt-2 px-1">
        <span>얇게</span>
        <span>두껍게</span>
      </div>
    </div>

    <!-- 상의 -->
    <div class="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="font-bold text-gray-700 flex items-center gap-2">
          <span class="text-xl">👕</span> 상의
        </span>
      </div>
      
      <div class="relative h-8 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div 
          class="absolute inset-y-0 left-0 bg-gradient-to-r {getLevelColor(activeTab === 'outdoor' ? recommendation.top.level : recommendation.indoorTop.level)} rounded-full transition-all duration-500"
          style="width: {getLevelWidth(activeTab === 'outdoor' ? recommendation.top.level : recommendation.indoorTop.level)}"
        ></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="font-bold text-white drop-shadow-md">
            {activeTab === 'outdoor' ? recommendation.top.name : recommendation.indoorTop.name}
          </span>
        </div>
      </div>
      
      <p class="text-sm text-gray-500 text-center">
        {activeTab === 'outdoor' ? recommendation.top.desc : recommendation.indoorTop.desc}
      </p>
    </div>

    <!-- 하의 (실외만) -->
    {#if activeTab === 'outdoor'}
      <div class="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="font-bold text-gray-700 flex items-center gap-2">
            <span class="text-xl">👖</span> 하의
          </span>
        </div>
        
        <div class="relative h-8 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div 
            class="absolute inset-y-0 left-0 bg-gradient-to-r {getLevelColor(recommendation.bottom.level)} rounded-full transition-all duration-500"
            style="width: {getLevelWidth(recommendation.bottom.level)}"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="font-bold text-white drop-shadow-md">
              {recommendation.bottom.name}
            </span>
          </div>
        </div>
        
        <p class="text-sm text-gray-500 text-center">
          {recommendation.bottom.desc}
        </p>
      </div>
    {/if}
  </div>

  <!-- 실내 안내 -->
  {#if activeTab === 'indoor'}
    <div class="bg-blue-50 border border-blue-200 px-4 py-3 rounded-xl mb-4">
      <p class="text-blue-700 text-sm">
        💡 냉난방이 있는 실내 기준이에요. 이동할 때는 겉옷을 챙기세요!
      </p>
    </div>
  {/if}

  <!-- 필수 준비물 -->
  {#if recommendation.essentials.length > 0}
    <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 mb-4">
      <h4 class="font-bold text-gray-700 mb-3 flex items-center gap-2">
        <span class="text-xl">🎒</span> 오늘의 필수품
      </h4>
      <div class="flex flex-wrap gap-2">
        {#each recommendation.essentials as essential}
          <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border
            {essential.priority === 'high' ? 'border-red-200 bg-red-50' : 
             essential.priority === 'medium' ? 'border-amber-200 bg-amber-50' : 
             'border-gray-200'}">
            <span class="text-xl">{essential.icon}</span>
            <span class="font-medium text-gray-700">{essential.item}</span>
            {#if essential.priority === 'high'}
              <span class="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">필수</span>
            {/if}
          </div>
        {/each}
      </div>
      
      <!-- 필수품 이유 -->
      <div class="mt-3 text-sm text-gray-500 space-y-1">
        {#each recommendation.essentials.filter(e => e.priority === 'high') as essential}
          <p>• {essential.item}: {essential.reason}</p>
        {/each}
      </div>
    </div>
  {/if}

  <!-- 나이대별 팁 -->
  {#if recommendation.ageTip}
    <div class="bg-purple-50 border border-purple-200 px-4 py-3 rounded-xl">
      <p class="text-purple-700 text-sm flex items-center gap-2">
        <span>👤</span>
        <span class="font-medium">{recommendation.profile.ageLabel} 팁:</span>
        {recommendation.ageTip}
      </p>
    </div>
  {/if}
</div>
{/if}

