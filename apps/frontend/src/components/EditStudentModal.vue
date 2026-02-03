<template>
  <Teleport to="body">
    <!-- Transparent Backdrop to catch clicks outside -->
    <div class="fixed inset-0 z-40" @click="$emit('close')"></div>

    <!-- Popover Content -->
    <div class="fixed bottom-1/2 right-1/2 transform translate-x-1/2 translate-y-1/2 z-50 animate-fade-in">
      <div class="bg-white rounded-2xl p-6 w-80 shadow-2xl border border-gray-100 ring-1 ring-black ring-opacity-5">
        <h3 class="text-lg font-bold text-gray-900 mb-3">학생 정보 수정</h3>
        <input 
          v-model="name" 
          @keyup.enter="submit"
          ref="inputRef"
          type="text" 
          placeholder="이름 입력" 
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
                  :disabled="!name || name === originalName"
              >
                  수정
              </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import api from '../services/api';

const props = defineProps({
    student: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['close', 'updated']);
const name = ref('');
const originalName = ref('');
const inputRef = ref(null);

watch(() => props.student, (newVal) => {
    if (newVal) {
        name.value = newVal.name;
        originalName.value = newVal.name;
    }
}, { immediate: true });

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
    if (!name.value || name.value === originalName.value) return;
    try {
        await api.patch(`/student/${props.student.id}`, { name: name.value });
        emit('updated');
        emit('close');
    } catch (e) {
        alert('수정 실패');
    }
};
</script>
