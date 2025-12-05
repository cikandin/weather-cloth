<script lang="ts">
  let { message = '날씨 정보를 불러오는 중...' }: { message?: string } = $props();
</script>

<div class="flex flex-col items-center justify-center min-h-[400px]">
  <div class="relative">
    <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-200 to-purple-200 animate-pulse"></div>
    <div class="absolute inset-0 animate-spin-slow">
      <span class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl">☀️</span>
    </div>
    <div class="absolute inset-0 animate-spin-reverse">
      <span class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-2xl">🌧️</span>
    </div>
    <div class="absolute inset-0 flex items-center justify-center">
      <span class="text-4xl animate-bounce">👕</span>
    </div>
  </div>
  
  <p class="mt-8 text-lg text-gray-600 font-medium animate-pulse">{message}</p>
  
  <div class="mt-4 flex gap-1">
    <span class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0s"></span>
    <span class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
    <span class="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
  </div>
</div>

