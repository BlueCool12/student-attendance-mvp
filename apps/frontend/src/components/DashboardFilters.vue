<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
      <div class="flex gap-2 items-center overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">                
        <button 
          v-for="status in filters" 
          :key="status.value"
          @click="$emit('update:filter', status.value)"
          :class="[
            'px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
            filter === status.value 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          {{ status.label }}
        </button>
      </div>
            
      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto mt-2 md:mt-0 justify-end">
        <button 
          @click="setToday"
          class="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors whitespace-nowrap"
        >
          오늘
        </button>
        <div class="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
          <input 
            type="date" 
            :value="startDate" 
            @input="handleDateInput($event, 'startDate')"
            required 
            :max="today"
            class="bg-transparent border-none text-sm text-gray-600 focus:ring-0 outline-none w-32"
          >
          <span class="text-gray-400">~</span>
          <input 
            type="date" 
            :value="endDate" 
            @input="handleDateInput($event, 'endDate')"
            required 
            :max="today"
            class="bg-transparent border-none text-sm text-gray-600 focus:ring-0 outline-none w-32"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { AttendanceStatus } from '@student-attendance/shared';

const props = defineProps({
  filter: {
    type: Number,
    required: false
  },
  startDate: {
    type: String,
    required: false
  },
  endDate: {
    type: String,
    required: false
  }
});

const emit = defineEmits(['update:filter', 'update:startDate', 'update:endDate']);

const filters = [
  { label: '전체', value: AttendanceStatus.ALL },
  { label: '출석', value: AttendanceStatus.PRESENT },
  { label: '지각', value: AttendanceStatus.LATE },
  { label: '결석', value: AttendanceStatus.ABSENT },
  { label: '미기록', value: AttendanceStatus.UNRECORDED }
];

const today = new Date().toISOString().split('T')[0];

const handleDateInput = (e, type) => {
  const val = e.target.value;
  if (!val) {    
    e.target.value = props[type];
    return;
  }
  emit(`update:${type}`, val);
};

const setToday = () => {
  emit('update:startDate', today);
  emit('update:endDate', today);
};
</script>
