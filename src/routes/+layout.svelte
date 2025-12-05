<script lang="ts">
  import '../app.css';
  
  let { children } = $props();
</script>

<svelte:head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="오늘 날씨에 맞는 옷차림을 추천해드립니다" />
  <meta name="theme-color" content="#667eea" />
  
  <!-- Pretendard 폰트 -->
  <link rel="stylesheet" as="style" crossorigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
  
  <title>오늘 뭐 입지? | 날씨 기반 옷 추천</title>
</svelte:head>

{@render children()}
