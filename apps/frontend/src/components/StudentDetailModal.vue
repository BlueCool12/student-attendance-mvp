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
        <div class="p-6">
            <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
                <div class="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-sm text-gray-500 mt-4">데이터를 불러오는 중입니다...</p>
            </div>
            <div v-else class="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div 
                    v-for="date in dates" 
                    :key="date"
                    class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                >
                    <div class="flex flex-col">
                        <span class="font-semibold text-gray-900">{{ date }}</span>
                        <span class="text-xs text-gray-400 capitalize">{{ new Date(date).toLocaleDateString('ko-KR', { weekday: 'long' }) }}</span>
                    </div>
                    
                    <div class="flex gap-2">
                        <button 
                            v-for="status in attendanceStatuses"
                            :key="status.value"
                            @click="handleUpdate(status.value, date)"
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
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { XMarkIcon, CheckIcon, ClockIcon } from '@heroicons/vue/24/solid';
import { AttendanceStatus } from '@student-attendance/shared';
import api from '../services/api';

const props = defineProps({
    studentId: Number,
    studentName: String,
    dates: Array, 
    startDate: String,
    endDate: String
});

const emit = defineEmits(['close', 'updated']);

const attendanceRecords = ref([]);
const isLoading = ref(false);

const fetchAttendance = async () => {
    isLoading.value = true;
    try {
        const res = await api.get(`/attendance?studentId=${props.studentId}&startDate=${props.startDate}&endDate=${props.endDate}`);
        attendanceRecords.value = res.data;
    } catch (e) {
        console.error(e);
    } finally {
        isLoading.value = false;
    }
};

const handleUpdate = async (status, date) => {
    try {
        await api.post('/attendance', {
            studentId: props.studentId,
            status,
            date
        });
        await fetchAttendance();
        emit('updated');
    } catch (e) {
        alert('출결 기록 실패');
    }
};

const attendanceMap = computed(() => {
    const map = new Map();
    attendanceRecords.value.forEach(r => {
        map.set(r.date, r.status);
    });
    return map;
});

const attendanceStatuses = [
    { value: AttendanceStatus.PRESENT, label: '출석', activeClass: 'bg-green-500 text-white', color: 'green', icon: CheckIcon },
    { value: AttendanceStatus.LATE, label: '지각', activeClass: 'bg-yellow-500 text-white', color: 'yellow', icon: ClockIcon },
    { value: AttendanceStatus.ABSENT, label: '결석', activeClass: 'bg-red-500 text-white', color: 'red', icon: XMarkIcon },
];

const getStatus = (date) => {
    return attendanceMap.value.get(date) || AttendanceStatus.ALL;
};

onMounted(fetchAttendance);

watch([() => props.studentId, () => props.startDate, () => props.endDate], fetchAttendance);
</script>
