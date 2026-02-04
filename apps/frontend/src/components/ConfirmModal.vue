<template>
  <Teleport to="body">
    <Transition
      enter-active-class="ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="handleCancel"></div>

        <!-- Modal Content -->
        <div class="relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
          <div class="flex flex-col items-center text-center">
            <div 
              :class="[
                'w-16 h-16 rounded-full flex items-center justify-center mb-6',
                type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
              ]"
            >
              <ExclamationTriangleIcon v-if="type === 'danger'" class="w-8 h-8" />
              <QuestionMarkCircleIcon v-else class="w-8 h-8" />
            </div>

            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ title }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed mb-8 whitespace-pre-line">
              {{ message }}
            </p>

            <div class="flex gap-3 w-full">
              <button 
                v-if="!isAlert"
                @click="handleCancel" 
                class="flex-1 px-4 py-3 text-sm text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-colors"
                id="confirm-modal-cancel"
              >
                {{ cancelText }}
              </button>
              <button 
                @click="handleConfirm" 
                :class="[
                  'flex-1 px-4 py-3 text-sm text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95',
                  type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                ]"
                id="confirm-modal-ok"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ExclamationTriangleIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/outline';
import { onMounted, onUnmounted } from 'vue';

const props = defineProps({
  show: Boolean,
  title: {
    type: String,
    default: '알림'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info' // info, danger
  },
  isAlert: {
    type: Boolean,
    default: false
  },
  cancelText: {
    type: String,
    default: '취소'
  },
  confirmText: {
    type: String,
    default: '확인'
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const handleConfirm = () => emit('confirm');
const handleCancel = () => emit('cancel');

const handleKeydown = (e) => {
  if (!props.show) return;
  if (e.key === 'Escape') handleCancel();
  if (e.key === 'Enter') handleConfirm();
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>
