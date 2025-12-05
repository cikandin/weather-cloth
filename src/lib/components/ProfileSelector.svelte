<script lang="ts">
  import { goto } from '$app/navigation';

  let { 
    ageGroup = 'adult',
    onchange = () => {}
  }: {
    ageGroup?: 'child' | 'adult' | 'senior';
    onchange?: (ageGroup: string) => void;
  } = $props();

  const ageOptions = [
    { value: 'child', label: '아동', icon: '🧒', desc: '~12세' },
    { value: 'adult', label: '성인', icon: '🧑', desc: '13~59세' },
    { value: 'senior', label: '시니어', icon: '🧓', desc: '60세+' },
  ];

  function updateUrl(newAgeGroup: string) {
    const url = new URL(window.location.href);
    
    if (newAgeGroup !== 'adult') {
      url.searchParams.set('age', newAgeGroup);
    } else {
      url.searchParams.delete('age');
    }
    
    goto(url.toString(), { replaceState: true, noScroll: true });
  }

  function handleAgeChange(newAge: string) {
    updateUrl(newAge);
    onchange(newAge);
  }

  function copyShareLink() {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 복사되었습니다! 🔗');
  }
</script>

<div class="cloth-card rounded-3xl p-6 shadow-lg">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
      <span class="text-2xl">👤</span>
      나이대 설정
    </h3>
    <button 
      onclick={copyShareLink}
      class="btn btn-sm btn-ghost text-gray-500 hover:text-gray-700"
      title="링크 공유"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
      </svg>
      공유
    </button>
  </div>

  <div class="flex gap-3">
    {#each ageOptions as option}
      <button
        onclick={() => handleAgeChange(option.value)}
        class="flex-1 py-3 px-4 rounded-2xl text-center transition-all {ageGroup === option.value 
          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
        title={option.desc}
      >
        <span class="text-2xl block mb-1">{option.icon}</span>
        <span class="font-medium">{option.label}</span>
        <span class="text-xs block opacity-70">{option.desc}</span>
      </button>
    {/each}
  </div>

  <p class="text-sm text-gray-500 mt-4 text-center">
    💡 나이대에 따라 체감온도가 보정됩니다
  </p>
</div>
