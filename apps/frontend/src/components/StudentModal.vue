<template>
  <Teleport to="body">    
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>

        <!-- Modal Content -->
        <div class="relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span class="w-2 h-6 bg-indigo-600 rounded-full"></span>
                {{ isEditMode ? '학생 정보 수정' : '학생 신규 등록' }}
            </h3>
            
            <div class="space-y-6">
                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">학생 이름</label>
                    <input 
                        :value="name"
                        @input="name = $event.target.value" 
                        @keyup.enter="submit"
                        ref="inputRef"
                        type="text" 
                        placeholder="이름을 입력하세요"
                        :class="[
                            'w-full bg-gray-50 border rounded-2xl px-5 py-4 text-sm outline-none transition-all',
                            name.length === 0 
                                ? 'border-red-200 focus:ring-4 focus:ring-red-500/10 focus:border-red-400 bg-red-50' 
                                : 'border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500'
                        ]"
                        autofocus
                        maxlength="6"
                    >
                </div>

                <div class="flex justify-between items-center text-xs">
                    <span v-if="name.length === 0" class="text-red-500 font-bold">
                        이름은 필수 입력 항목입니다.
                    </span>
                    <span v-else class="text-gray-400">최대 6자까지 입력 가능합니다.</span>
                    <span :class="name.length === 6 ? 'text-red-500 font-bold' : 'text-gray-400'" class="ml-auto">
                        {{ name.length }}/6
                    </span>
                </div>

                <div class="flex gap-3 pt-4">
                    <button 
                        @click="$emit('close')" 
                        class="flex-1 px-4 py-3 text-sm text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-colors"
                    >
                        취소
                    </button>
                    <button 
                        @click="submit" 
                        class="flex-1 px-4 py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                        :disabled="!isValid"
                    >
                        {{ isEditMode ? '저장하기' : '등록하기' }}
                    </button>
                </div>
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
        emit('error', isEditMode.value ? '수정 실패' : '등록 실패');
    }
};
</script>
