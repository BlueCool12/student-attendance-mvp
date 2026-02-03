<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl transform transition-all max-h-[80vh] flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-xl font-bold text-gray-900">{{ studentName }}</h3>
          <p class="text-sm text-gray-500">출석 상세 내역</p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
            <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <div class="overflow-y-auto flex-1 pr-2">
        <table class="w-full text-left border-collapse">
            <thead class="sticky top-0 bg-white z-10">
                <tr class="border-b border-gray-100">
                    <th class="py-3 font-semibold text-gray-600 text-sm">날짜</th>
                    <th class="py-3 font-semibold text-gray-600 text-sm text-center">상태</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
                <tr v-for="date in dates" :key="date" class="hover:bg-gray-50 transition-colors">
                    <td class="py-3 text-sm text-gray-600">{{ date }}</td>
                    <td class="py-3 text-center">
                        <div class="flex justify-center gap-2">
                            <button 
                                v-for="status in attendanceStatuses"
                                :key="status.value"
                                @click="$emit('update', studentId, status.value, date)"
                                :class="[
                                    'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                                    getStatus(date) === status.value
                                        ? status.activeClass + ' ring-2 ring-offset-2 ring-' + status.color + '-500'
                                        : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                                ]"
                                :title="status.label"
                            >
                                <component :is="status.icon" class="w-4 h-4" />
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XMarkIcon, CheckIcon, ClockIcon } from '@heroicons/vue/24/solid';

const props = defineProps({
    studentId: Number,
    studentName: String,
    dates: Array, // Array of date strings
    attendanceRecords: Array // All records, need to filter by studentId locally or passed pre-filtered
});

const emit = defineEmits(['close', 'update']);

const attendanceStatuses = [
    { value: 1, label: '출석', activeClass: 'bg-green-500 text-white', color: 'green', icon: CheckIcon },
    { value: 2, label: '지각', activeClass: 'bg-yellow-500 text-white', color: 'yellow', icon: ClockIcon },
    { value: 3, label: '결석', activeClass: 'bg-red-500 text-white', color: 'red', icon: XMarkIcon },
];

const getStatus = (date) => {
    const record = props.attendanceRecords.find(r => r.studentId === props.studentId && r.date === date);
    return record ? record.status : 0;
};
</script>
