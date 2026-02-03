<template>
  <Teleport to="body">
    <!-- Transparent Backdrop to catch clicks outside -->
    <div class="fixed inset-0 z-40" @click="$emit('close')"></div>

    <!-- Popover Content -->
    <div class="fixed bottom-24 right-8 z-50 animate-slide-up origin-bottom-right">
      <div class="bg-white rounded-2xl p-5 w-80 shadow-2xl border border-gray-100 ring-1 ring-black ring-opacity-5">
        <h3 class="text-lg font-bold text-gray-900 mb-3">학생 등록</h3>
        <input 
          v-model="name" 
          @keyup.enter="submit"
          ref="inputRef"
          type="text" 
          placeholder="이름 입력 (엔터로 등록)" 
          class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          autofocus
        >
        <div class="flex justify-end items-center">        
          <div class="flex gap-2">
              <button 
                  @click="$emit('close')" 
                  class="px-3 py-2 text-xs text-gray-600 bg-gray-100 font-bold hover:bg-gray-200 rounded-lg transition-colors"
              >
                  취소
              </button>
              <button 
                  @click="submit" 
                  class="px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                  :disabled="!name"
              >
                  등록
              </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import api from '../services/api';

const emit = defineEmits(['close', 'added']);
const name = ref('');
const inputRef = ref(null);

const handleKeydown = (e) => {
    if (e.key === 'Escape') emit('close');
};

onMounted(() => {
    if (inputRef.value) inputRef.value.focus();
    window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});

const submit = async () => {
    if (!name.value) return;
    try {
        await api.post('/student', { name: name.value });
        emit('added');
        emit('close');
        name.value = '';
    } catch (e) {
        alert('등록 실패');
    }
};
</script>
