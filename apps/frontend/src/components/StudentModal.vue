<template>
  <Teleport to="body">    
    <div class="fixed inset-0 z-40" @click="$emit('close')"></div>

    <div class="fixed z-50 bg-white rounded-2xl p-5 w-80 shadow-2xl border border-gray-100 ring-1 ring-black ring-opacity-5"
         :class="isEditMode ? 'bottom-1/2 right-1/2 transform translate-x-1/2 translate-y-1/2 animate-fade-in' : 'bottom-24 right-8 origin-bottom-right animate-slide-up'">
      
      <h3 class="text-lg font-bold text-gray-900 mb-3">{{ isEditMode ? '학생 정보 수정' : '학생 등록' }}</h3>
      
      <input 
        :value="name"
        @input="name = $event.target.value" 
        @keyup.enter="submit"
        ref="inputRef"
        type="text" 
        placeholder="이름 입력"
        :class="[
          'w-full bg-gray-50 border rounded-xl px-4 py-3 mb-4 text-sm outline-none transition-all',
          name.length === 0 
            ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400 bg-red-50' 
            : 'border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
        ]"
        autofocus
        maxlength="6"
      >
      <div class="flex justify-between items-center mb-4 px-1 text-xs">
        <span v-if="name.length === 0" class="text-red-500 font-bold fade-in">
          이름을 입력해주세요
        </span>
        <span v-else class="text-transparent">.</span>
        <span :class="name.length === 6 ? 'text-red-500 font-bold' : 'text-gray-400'">
          {{ name.length }}/6
        </span>
      </div>

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
                :disabled="!isValid"
            >
                {{ isEditMode ? '수정' : '등록' }}
            </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import api from '../services/api';

const props = defineProps({
  student: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'added', 'updated']);

const name = ref('');
const inputRef = ref(null);
const originalName = ref('');

const isEditMode = computed(() => !!props.student);

const isValid = computed(() => {
    if (!name.value) return false;
    return true;
});

watch(() => props.student, (newVal) => {
    if (newVal) {
        name.value = newVal.name;
        originalName.value = newVal.name;
    } else {
        name.value = '';
        originalName.value = '';
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
    if (!isValid.value) return;
    
    if (isEditMode.value && name.value === originalName.value) {
        emit('close');
        return;
    }

    try {
        if (isEditMode.value) {
            await api.patch(`/student/${props.student.id}`, { name: name.value });
            emit('updated');
        } else {
            const res = await api.post('/student', { name: name.value });
            emit('added', res.data);
            name.value = '';
        }

        emit('close');
    } catch (e) {
        alert(isEditMode.value ? '수정 실패' : '등록 실패');
    }
};
</script>
