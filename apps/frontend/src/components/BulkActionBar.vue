<template>
    <Transition
        enter-active-class="transform transition ease-out duration-300"
        enter-from-class="translate-y-full opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transform transition ease-in duration-200"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-full opacity-0"
    >
        <div 
            v-if="selectedCount > 0"
            class="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
        >
            <div class="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-gray-800">
                <div class="flex items-center gap-2 border-r border-gray-700 pr-6">
                    <span class="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold">
                        {{ selectedCount }}
                    </span>
                    <span class="text-sm font-medium">선택됨</span>
                </div>
                
                <div class="flex items-center gap-3">
                    <button 
                        @click="$emit('update', AttendanceStatus.PRESENT)"
                        class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                    >
                        출석
                    </button>
                    <button 
                        @click="$emit('update', AttendanceStatus.LATE)"
                        class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                    >
                        지각
                    </button>
                    <button 
                        @click="$emit('update', AttendanceStatus.ABSENT)"
                        class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                    >
                        결석
                    </button>
                </div>

                <button 
                    @click="$emit('clear')"
                    class="text-gray-400 hover:text-white transition-colors p-2"
                >
                    취소
                </button>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { AttendanceStatus } from '@student-attendance/shared';

defineProps({
    selectedCount: {
        type: Number,
        required: true
    }
});

defineEmits(['update', 'clear']);
</script>
