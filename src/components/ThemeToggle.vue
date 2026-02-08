<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Работа с темами
const isDark = ref(false);

function toggleTheme() {
  isDark.value = !isDark.value;
  updateTheme();
}

function updateTheme() {
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}
    
onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    // Если тема сохранена, используем её
    isDark.value = savedTheme === 'dark';
  } else {
    // Если темы нет, проверяем системные настройки
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDark.value = prefersDark;
  }
  
  updateTheme();
});
</script>

<template>
  <button
    class="theme-toggle w-9 h-9 inline-flex items-center justify-center bg-transparent border border-gray-300 rounded-lg p-0 cursor-pointer hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400/50 transition-colors"
    type="button"
    :title="isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'"
    :aria-label="isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'"
    @click="toggleTheme"
  >
    <!-- Иконка солнца (светлая тема) -->
    <svg v-if="!isDark" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    
    <!-- Иконка луны (темная тема) -->
    <svg v-else viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  color: #555;
}

.theme-toggle:hover {
  color: #000;
}

:global(.dark) .theme-toggle {
  border-color: #404040;
  color: #a0a0a0;
}

:global(.dark) .theme-toggle:hover {
  background-color: #333;
  color: #fff;
}
</style>