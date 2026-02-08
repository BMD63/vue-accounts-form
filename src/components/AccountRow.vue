<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import type { Account } from '../types/account';
import { useAccountsStore } from '../stores/accounts';
import { parseLabels, labelsToString } from '../composables/useLabels';

const props = defineProps<{
  account: Account;
  focusId?: string | null;
  validateId?: string | null;
  validateTick?: number;
}>();
const emit = defineEmits<{ (e: 'remove'): void }>();

const store = useAccountsStore();

// Модальное окно подтверждения удаления
const showDeleteModal = ref(false);

function openDeleteModal() {
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
}

function confirmDelete() {
  emit('remove');
  closeDeleteModal();
}

const showPwd = ref(false);
const pwdInputType = computed(() => (showPwd.value ? 'text' : 'password'));
function togglePwd() {
  showPwd.value = !showPwd.value;
}

const loginHelpId = `login-help-${props.account.id}`;
const passwordHelpId = `pwd-help-${props.account.id}`;

const loginEl = ref<HTMLInputElement | null>(null);
function focusLogin() {
  requestAnimationFrame(() => loginEl.value?.focus());
}

onMounted(() => {
  if (props.focusId === props.account.id) focusLogin();
});

watch(() => props.focusId, (v) => {
  if (v === props.account.id) focusLogin();
});

/* --- Метки --- */
const labelsInput = ref(labelsToString(props.account.labels));
watch(() => props.account.labels, (v) => {
  labelsInput.value = labelsToString(v);
});
function onBlurLabels() {
  const parsed = parseLabels(labelsInput.value);
  store.updatePartial(props.account.id, { labels: parsed });
}

/* --- Логин --- */
const login = ref(props.account.login);
const loginError = ref(false);
watch(() => props.account.login, (v) => { login.value = v; });

/* --- Тип --- */
const typeValue = ref<Account['type']>(props.account.type);
watch(() => props.account.type, (v) => { typeValue.value = v; });

/* --- Пароль --- */
const password = ref(props.account.password ?? '');
const passwordError = ref(false);
watch(() => props.account.password, (v) => { password.value = (v ?? ''); });
watch(() => props.account.type, (v) => {
  typeValue.value = v;
  if (v === 'LOCAL' && props.account.password === null) password.value = '';
});

/* --- Handlers --- */
function onBlurLogin() {
  const value = login.value.trim();
  loginError.value = value.length === 0 || value.length > 100;
  if (!loginError.value) store.updatePartial(props.account.id, { login: value });
}
function onBlurPassword() {
  if (typeValue.value !== 'LOCAL') return;
  const value = password.value;
  passwordError.value = value.length === 0 || value.length > 100;
  if (!passwordError.value) store.updatePartial(props.account.id, { password: value });
}
function validateAllRequiredNow() {
  // логин обязателен всегда
  const lv = login.value.trim();
  loginError.value = lv.length === 0 || lv.length > 100;
  // пароль обязателен только при LOCAL
  if (typeValue.value === 'LOCAL') {
    const pv = password.value;
    passwordError.value = pv.length === 0 || pv.length > 100;
  } else {
    passwordError.value = false;
  }
}

watch(
  () => props.validateTick,
  () => {
    if (props.validateId === props.account.id) {
      validateAllRequiredNow();
    }
  }
);
function onChangeType() {
  store.setType(props.account.id, typeValue.value);
}
</script>

<template>
  <li class="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/30">
    <div class="grid grid-cols-[auto_1fr] gap-3 items-start p-2.5">
      <div class="grid gap-3" style="grid-template-columns: var(--col-label) var(--col-type)">
        <div class="flex flex-col gap-1.5 min-w-0">
          <input
            :id="'labels-' + account.id"
            v-model="labelsInput"
            type="text"
            maxlength="300"
            placeholder="Введите метку или несколько"
            aria-label="Метки"
            class="w-full h-9 min-w-0 border border-gray-300 rounded px-2 py-1.5"
            @blur="onBlurLabels"
          />
        </div>

        <div class="flex flex-col gap-1.5 min-w-0">
          <select
            :id="'type-' + account.id"
            v-model="typeValue"
            aria-label="Тип записи"
            class="w-full h-9 min-w-0 border border-gray-300 rounded px-2 py-1.5 bg-white"
            @change="onChangeType"
          >
            <option value="LOCAL">Локальная</option>
            <option value="LDAP">LDAP</option>
          </select>
        </div>
      </div>

      <div 
        class="grid gap-3 min-w-0"
        :class="typeValue !== 'LOCAL' 
          ? 'grid-cols-[1fr_var(--col-action)]' 
          : 'grid-cols-[1fr_1fr_var(--col-action)]'"
      >
        <div class="flex flex-col gap-1.5 min-w-0">
          <input
            ref="loginEl"
            :id="'login-' + account.id"
            v-model="login"
            type="text"
            maxlength="100"
            placeholder="Введите логин"
            aria-label="Логин"
            class="w-full h-9 min-w-0 border border-gray-300 rounded px-2 py-1.5"
            :class="{ 'is-error border-red-500': loginError }"
            @blur="onBlurLogin"
          />
          <small 
            v-if="loginError" 
            class="mt-0.5 leading-tight text-red-700 text-xs" 
            :id="loginHelpId"
          >
            Обязательное поле (1–100 символов)
          </small>
        </div>

        <div v-if="typeValue === 'LOCAL'" class="flex flex-col gap-1.5 min-w-0">
          <div class="relative min-w-0">
            <input
              :id="'pwd-' + account.id"
              v-model="password"
              :type="pwdInputType"
              maxlength="100"
              placeholder="Введите пароль"
              aria-label="Пароль"
              class="w-full h-9 pr-9 border border-gray-300 rounded px-2 py-1.5"
              :class="{ 'is-error border-red-500': passwordError }"
              :aria-invalid="passwordError ? 'true' : 'false'"
              :aria-describedby="passwordError ? passwordHelpId : undefined"
              @blur="onBlurPassword"
            />
            <button
                class="eye-btn absolute top-1/2 right-2 -translate-y-1/2 w-7 h-7 inline-flex items-center justify-center border-0 bg-transparent p-0 cursor-pointer opacity-85 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-400/50 focus-visible:rounded-md"
                type="button"
                :title="showPwd ? 'Скрыть пароль' : 'Показать пароль'"
                :aria-label="showPwd ? 'Скрыть пароль' : 'Показать пароль'"
                :aria-pressed="showPwd ? 'true' : 'false'"
                @click="togglePwd"
                >
                <svg v-if="!showPwd" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M12 5c5.5 0 9.5 4.1 10.7 6-.9 1.3-4.7 6-10.7 6S2.5 12.3 1.3 11C2.5 9.1 6.5 5 12 5Z" fill="none" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="12" cy="11" r="3.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M3 3l18 18" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M12 5c5.5 0 9.5 4.1 10.7 6-.6.9-2.6 3.3-5.7 4.9M6.9 7.1C4.1 8.6 2.5 10.6 1.3 11 2.5 12.9 6.5 17 12 17c1 0 2-.1 2.9-.3" fill="none" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="12" cy="11" r="3.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
                </svg>
            </button>
          </div>
          <small 
            v-if="passwordError" 
            class="mt-0.5 leading-tight text-red-700 text-xs" 
            :id="passwordHelpId"
          >
            Обязательное поле (1–100 символов)
          </small>
        </div>

        <div class="flex items-start justify-end">
          <button
            class="trash-btn w-7 h-7 inline-flex items-center justify-center bg-transparent border border-transparent p-0 cursor-pointer opacity-85 leading-none hover:opacity-100 hover:border-gray-300 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-400/50 focus-visible:rounded-md transition-colors"
            type="button"
            title="Удалить запись"
            aria-label="Удалить запись"
            @click="openDeleteModal"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M3 6h18" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 6V4.8c0-.44.36-.8.8-.8h6.4c.44 0 .8.36.8.8V6" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <rect x="5" y="6" width="14" height="14" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M10 10v6M14 10v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteModal" class="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="modal-content bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Подтверждение удаления</h3>
          <p class="text-gray-700 mb-6">
            Вы действительно хотите удалить запись?
            <span v-if="account.labels.length > 0" class="font-medium">(метки: {{ account.labels.join(', ') }})</span>
          </p>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              @click="closeDeleteModal"
            >
              Отмена
            </button>
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              @click="confirmDelete"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<style scoped>
.modal-overlay {
  animation: fadeIn 0.15s ease-out;
}

.modal-content {
  animation: slideUp 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Glass эффект для строк */
li {
  background: rgba(249, 250, 251, 0.5);
  backdrop-filter: blur(8px);
}

li:hover {
  background: rgba(243, 244, 246, 0.6);
}

:global(.dark) li {
  background: rgba(38, 38, 38, 0.5);
}

:global(.dark) li:hover {
  background: rgba(45, 45, 45, 0.6);
}
</style>