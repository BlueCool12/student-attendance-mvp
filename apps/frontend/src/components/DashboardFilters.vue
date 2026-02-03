<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- Top Tier: Global Filters (Search & Date Range) -->
    <div class="p-4 md:p-6 flex flex-wrap items-center gap-6 justify-between border-b border-gray-100/50">
      <!-- Search Section -->
      <div class="relative w-full lg:flex-1 lg:max-w-md">
        <input 
          type="text" 
          :value="search" 
          @input="$emit('update:search', $event.target.value)"
          placeholder="학생 이름 검색..."
          class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
        >
        <div class="absolute left-3.5 top-2.5 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Date Range Section -->
      <div class="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end shrink-0">
        <button 
          @click="setToday"
          class="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors whitespace-nowrap shadow-sm"
        >
          오늘
        </button>
        <div class="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1 lg:flex-none justify-between lg:justify-start">
          <!-- Start Date -->
          <div class="relative flex-1 sm:flex-none flex items-center justify-center min-w-[70px]">
            <span class="text-sm text-gray-600 font-medium">
              {{ formatDateDisplay(startDate) }}
            </span>
            <input 
              type="date" 
              :value="startDate" 
              @input="handleDateInput($event, 'startDate')"
              @click="$event.target.showPicker()"
              required 
              :max="today"
              class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            >
          </div>

          <span class="text-gray-400 font-light">~</span>

          <!-- End Date -->
          <div class="relative flex-1 sm:flex-none flex items-center justify-center min-w-[70px]">
            <span class="text-sm text-gray-600 font-medium">
              {{ formatDateDisplay(endDate) }}
            </span>
            <input 
              type="date" 
              :value="endDate" 
              @input="handleDateInput($event, 'endDate')"
              @click="$event.target.showPicker()"
              required 
              :max="today"
              class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Tier: Category Filters (Status Chips) -->
    <div class="px-4 md:px-6 py-3 bg-gray-50/50 flex gap-2 items-center overflow-x-auto no-scrollbar">                      
      <button 
        v-for="status in filters" 
        :key="status.value"
        @click="$emit('update:filter', status.value)"
        :class="[
          'px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap border',
          filter === status.value 
            ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
            : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50 hover:border-gray-200'
        ]"
      >
        {{ status.label }}
      </button>
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
  },
  search: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:filter', 'update:startDate', 'update:endDate', 'update:search']);

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

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${year.slice(-2)}.${month}.${day}`;
};
</script>
