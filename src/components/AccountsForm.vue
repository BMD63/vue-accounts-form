<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useAccountsStore } from '../stores/accounts';
import AccountRow from './AccountRow.vue';

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
    <header class="flex items-center gap-2.5 mb-2">
      <h2 class="text-xl font-semibold">Учётные записи</h2>
      <button
        class="inline-flex items-center justify-center w-9 h-9 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors cursor-pointer p-0"
        @click="onAdd"
        type="button"
        title="Добавить учётную запись"
        aria-label="Добавить учётную запись"
      >
        <span class="text-[22px] leading-none text-gray-900" aria-hidden="true">+</span>
      </button>
    </header>

    <p class="flex items-center gap-2 text-gray-600 my-0 mb-2" role="note">
      <span 
        class="inline-flex w-5.5 h-5.5 items-center justify-center border border-gray-200 rounded-full bg-white shadow-sm text-gray-700"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
          <path d="M9.8 9a2.2 2.2 0 1 1 3.7 1.6c-.6.5-1 .8-1 .8-.5.4-.7.8-.7 1.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="12" cy="16.5" r="1" fill="currentColor"/>
        </svg>
      </span>
      Для указания нескольких меток одной пары логин/пароль используйте разделитель ;
    </p>

    <div
      class="relative my-2 mt-2 px-2.5 py-2 rounded-lg bg-red-50/80 border border-red-200 text-red-700 transition-all duration-150 ease-in-out"
      :class="[
        warnVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 -translate-y-1 pointer-events-none'
      ]"
      role="status"
      aria-live="polite"
    >
      {{ warnText }}
    </div>

    <div v-if="store.accounts.length === 0" class="opacity-70 my-2 mb-4">
      Список пуст. Нажмите «+», чтобы добавить запись.
    </div>

    <div v-else class="grid grid-cols-[auto_1fr] gap-3 items-center px-2.5 pt-1.5 pb-2 text-gray-600 text-xs">
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

    <ul v-if="store.accounts.length" class="list-none p-0 m-0 grid gap-2">
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
  </section>
</template>