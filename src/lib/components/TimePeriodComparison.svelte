<script lang="ts">
  let { 
    morningAvg = 0,
    morningMin = 0,
    morningMax = 0,
    afternoonAvg = 0,
    afternoonMin = 0,
    afternoonMax = 0
  }: {
    morningAvg?: number;
    morningMin?: number;
    morningMax?: number;
    afternoonAvg?: number;
    afternoonMin?: number;
    afternoonMax?: number;
  } = $props();
</script>

<div class="cloth-card rounded-3xl p-6 shadow-lg">
  <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
    <span class="text-2xl">📊</span>
    시간대별 온도
  </h3>
  <div class="grid grid-cols-2 gap-4">
    <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 text-center">
      <p class="text-gray-500 flex items-center justify-center gap-2">
        <span class="text-xl">🌅</span> 아침 (6-9시)
      </p>
      <p class="text-3xl font-bold mt-2 text-amber-600">{morningAvg}°</p>
      <p class="text-sm text-gray-400 mt-1">
        {morningMin}° ~ {morningMax}°
      </p>
    </div>
    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 text-center">
      <p class="text-gray-500 flex items-center justify-center gap-2">
        <span class="text-xl">🌇</span> 오후 (12-18시)
      </p>
      <p class="text-3xl font-bold mt-2 text-blue-600">{afternoonAvg}°</p>
      <p class="text-sm text-gray-400 mt-1">
        {afternoonMin}° ~ {afternoonMax}°
      </p>
    </div>
  </div>
</div>

