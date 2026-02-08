<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useAccountsStore } from '../stores/accounts';
import AccountRow from './AccountRow.vue';
import ThemeToggle from './ThemeToggle.vue'

const store = useAccountsStore();

onMounted(() => {
  store.hydrate();
});

const showPasswordCol = computed(() =>
  store.accounts.some(a => a.type === 'LOCAL')
);

const focusId = ref<string | null>(null);

const warnText = ref('');
const warnVisible = ref(false);
let warnTimer: number | undefined;

function showWarn(text: string, ms = 2500) {
  warnText.value = text;
  warnVisible.value = true;
  if (warnTimer) window.clearTimeout(warnTimer);
  warnTimer = window.setTimeout(() => (warnVisible.value = false), ms);
}

const validateId = ref<string | null>(null);
const validateTick = ref(0);

function onAdd() {
  if (store.hasInvalid) {
    const bad = store.accounts.find(a => !store.isValid(a));
    validateId.value = bad?.id ?? null;
    validateTick.value++;
    showWarn('Заполните текущую запись перед добавлением новой');
    return;
  }
  const id = store.addEmpty();
  focusId.value = id;
}
</script>

<template>
  
  <section class="accounts-form">
    <header class="glass-header flex items-center justify-between gap-2.5 mb-6 p-4 rounded-2xl" >
      <div class="flex items-center gap-3">
        <h2 class="text-2xl font-semibold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Учётные записи
        </h2>
        <button
          class="glass-button inline-flex items-center justify-center w-10 h-10 p-0 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105"
          @click="onAdd"
          type="button"
          title="Добавить учётную запись"
          aria-label="Добавить учётную запись"
        >
          <span class="text-[24px] leading-none gradient-text" aria-hidden="true">+</span>
        </button>
      </div>
      <ThemeToggle />
    </header>

    <p class="glass-note flex items-center gap-2.5 my-0 mb-4 p-3 rounded-xl" role="note">
      <span 
        class="icon-bubble inline-flex w-6 h-6 items-center justify-center rounded-full"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
          <path d="M9.8 9a2.2 2.2 0 1 1 3.7 1.6c-.6.5-1 .8-1 .8-.5.4-.7.8-.7 1.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="12" cy="16.5" r="1" fill="currentColor"/>
        </svg>
      </span>
      <span class="text-sm">
        Для указания нескольких меток одной пары логин/пароль используйте разделитель ;
      </span>
    </p>

    <div
      class="glass-warning relative my-2 mt-2 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out"
      :class="[
        warnVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
      ]"
      role="status"
      aria-live="polite"
    >
      {{ warnText }}
    </div>

    <div v-if="store.accounts.length === 0" class="glass-empty opacity-70 my-4 mb-6 p-6 rounded-xl text-center">
      Список пуст. Нажмите «+», чтобы добавить запись.
    </div>

    <!-- Единая таблица -->
    <div v-else class="glass-table rounded-2xl overflow-hidden">
      <!-- Заголовки таблицы -->
      <div class="glass-table-header px-4 pt-4 pb-3 text-xs font-medium">
        <div class="grid grid-cols-[auto_1fr] gap-3 items-center">
          <div class="grid gap-3" style="grid-template-columns: var(--col-label) var(--col-type)">
            <span class="min-w-0">Метки</span>
            <span class="min-w-0">Тип записи</span>
          </div>
          <div 
            class="grid gap-3"
            :class="showPasswordCol 
              ? 'grid-cols-[1fr_1fr_var(--col-action)]' 
              : 'grid-cols-[1fr_var(--col-action)]'"
          >
            <span class="min-w-0">Логин</span>
            <span v-if="showPasswordCol" class="min-w-0">Пароль</span>
            <span class="w-(--col-action)"></span>
          </div>
        </div>
      </div>

      <!-- Строки таблицы -->
      <ul class="list-none p-0 m-0">
        <AccountRow
          v-for="a in store.accounts"
          :key="a.id"
          :account="a"
          :focus-id="focusId"
          :validate-id="validateId"
          :validate-tick="validateTick"
          @remove="store.remove(a.id)"
        />
      </ul>
    </div>
  </section>
</template>

<style scoped >
.glass-header {
  background: rgba(249, 250, 251, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}

.glass-button {
  background: rgba(249, 250, 251, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(229, 231, 235, 0.9);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.glass-note {
  background: rgba(59, 130, 246, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #1e40af;
}

.icon-bubble {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #2563eb;
}

.glass-warning {
  background: rgba(239, 68, 68, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #dc2626;
}

.glass-empty {
  background: rgba(249, 250, 251, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(229, 231, 235, 0.6);
}

.glass-table {
  background: rgba(249, 250, 251, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}

.glass-table-header {
  background: rgba(243, 244, 246, 0.8);
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  color: #374151;
}

/* Темная тема */
:global(.dark) :deep(.glass-header) {
  background: rgba(55, 55, 55, 0.4) !important;
  border: 1px solid rgba(80, 80, 80, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

:global(.dark) .glass-button {
  background: rgba(50, 50, 50, 0.6);
  border: 1px solid rgba(80, 80, 80, 0.8);
}

:global(.dark) .glass-button:hover {
  background: rgba(60, 60, 60, 0.8);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

:global(.dark) .glass-note {
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.25);
  color: #93c5fd;
}

:global(.dark) .icon-bubble {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.35);
  color: #60a5fa;
}

:global(.dark) .glass-warning {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fca5a5;
}

:global(.dark) .glass-empty {
  background: rgba(38, 38, 38, 0.6);
  border: 1px solid rgba(64, 64, 64, 0.6);
}

:global(.dark) .glass-table {
  background: rgba(38, 38, 38, 0.7);
  border: 1px solid rgba(64, 64, 64, 0.8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

:global(.dark) .glass-table-header {
  background: rgba(38, 38, 38, 0.8);
  border-bottom: 1px solid rgba(64, 64, 64, 0.5);
  color: #d1d5db;
}
html.dark .glass-header {
  background: rgba(55, 55, 55, 0.4) !important;
  border-color: rgba(80, 80, 80, 0.6) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
}
</style>