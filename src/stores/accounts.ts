import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';  
import type { Account } from '../types/account';
import LS_KEY from '../constants/constants';

import genId from '../utils/genId';

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([]);
  const inited = ref(false);

  function hydrate() {
    if (inited.value) return;
    inited.value = true;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          accounts.value = parsed.filter((x: any): x is Account =>
            x && typeof x.id === 'string' &&
            Array.isArray(x.labels) &&
            (x.type === 'LDAP' || x.type === 'LOCAL') &&
            typeof x.login === 'string' &&
            (typeof x.password === 'string' || x.password === null)
          );
        }
      }
    } catch { /* ignore */ }

    watch(accounts, (val) => {
      try { localStorage.setItem(LS_KEY, JSON.stringify(val)); } catch { /* ignore */ }
    }, { deep: true, immediate: true });
  }

  function addEmpty() {
    const acc: Account = {
      id: genId(),
      labels: [],
      type: 'LDAP',      
      login: '',
      password: null,   
    };
    accounts.value.push(acc);
    return acc.id; 
  }

  function remove(id: string) {
    accounts.value = accounts.value.filter(a => a.id !== id);
  }

  function updatePartial(id: string, patch: Partial<Omit<Account, 'id'>>) {
    const i = accounts.value.findIndex(a => a.id === id);
    if (i === -1) return;
    const curr = accounts.value[i];
    if (!curr) return;
    accounts.value.splice(i, 1, {
      id: curr.id,
      type: patch.type ?? curr.type,
      login: patch.login ?? curr.login,
      password: (patch.password === undefined ? curr.password : patch.password),
      labels: patch.labels ?? curr.labels,
    });
  }

  function setType(id: string, type: Account['type']) {
    const i = accounts.value.findIndex(a => a.id === id);
    if (i === -1) return;
    const curr = accounts.value[i];
    if (!curr) return;
    const nextPassword = type === 'LDAP' ? null : (curr.password ?? '');
    accounts.value.splice(i, 1, {
      id: curr.id,
      type,
      login: curr.login,
      password: nextPassword,
      labels: curr.labels,
    });
  }

  function isValid(a: Account): boolean {
    const login = (a.login ?? '').trim();
    const loginOk = login.length > 0 && login.length <= 100;
    const pwdOk = a.type === 'LOCAL'
      ? typeof a.password === 'string' && a.password.length > 0 && a.password.length <= 100
      : a.password === null;
    return loginOk && pwdOk;
  }

  const hasInvalid = computed(() => accounts.value.some(a => !isValid(a)));

  return {
    accounts,
    hydrate,
    addEmpty,
    remove,
    updatePartial,
    setType,
    isValid,
    hasInvalid,
  };
});