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
                    class="space-y-2"
                >
                    <div class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                        <div class="flex flex-col">
                            <span class="font-semibold text-gray-900">{{ date }}</span>
                            <span class="text-xs text-gray-400 capitalize">{{ new Date(date).toLocaleDateString('ko-KR', { weekday: 'long' }) }}</span>
                        </div>
                        
                        <div class="flex items-center gap-3">
                            <button 
                                @click="toggleMemo(date)"
                                :class="[
                                    'p-1.5 rounded-lg transition-colors border',
                                    selectedMemoDate === date 
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                                        : getMemo(date)
                                            ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                                            : 'bg-white border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-100'
                                ]"
                                title="메모 작성"
                            >
                                <ChatIconSolid v-if="getMemo(date)" class="w-5 h-5" />
                                <ChatBubbleBottomCenterTextIcon v-else class="w-5 h-5" />
                            </button>

                            <button 
                                @click="toggleHistory(date)"
                                :class="[
                                    'p-1.5 rounded-lg transition-colors border',
                                    selectedHistoryDate === date 
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                                        : 'bg-white border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-100'
                                ]"
                                title="이력 보기"
                            >
                                <InformationCircleIcon class="w-5 h-5" />
                            </button>

                            <div class="h-8 w-[1px] bg-gray-100"></div>

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

                    <!-- Memo Section -->
                    <div 
                        v-if="selectedMemoDate === date"
                        class="mx-3 p-4 bg-amber-50 rounded-xl border border-amber-100 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                        <h4 class="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <ChatIconSolid class="w-3 h-3" />
                            메모
                        </h4>
                        <textarea 
                            :value="getMemo(date)"
                            @change="e => handleMemoUpdate(date, e.target.value)"
                            placeholder="메모를 입력하세요..."
                            class="w-full h-20 bg-white border border-amber-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none placeholder-amber-300"
                        ></textarea>
                    </div>

                    <!-- History Section -->
                    <div 
                        v-if="selectedHistoryDate === date"
                        class="mx-3 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">상태 변경 이력</h4>
                        <div v-if="isLogsLoading" class="flex justify-center py-4">
                            <div class="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div v-else-if="historyLogs.length === 0" class="text-center py-4 text-sm text-gray-400">
                            이력이 없습니다.
                        </div>
                        <div v-else class="space-y-3 relative">
                            <div class="absolute left-1 top-2 bottom-2 w-[1px] bg-gray-200"></div>
                            <div 
                                v-for="log in historyLogs" 
                                :key="log.id"
                                class="relative pl-6 flex items-center justify-between"
                            >
                                <div class="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-white shadow-sm" :class="'bg-' + getStatusColorRoot(log.status) + '-500'"></div>
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium" :class="'text-' + getStatusColorRoot(log.status) + '-700'">
                                        {{ getStatusLabel(log.status) }}
                                    </span>
                                    <span class="text-[10px] text-gray-400">{{ formatTime(log.createdAt) }}</span>
                                </div>
                            </div>
                        </div>
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
import { XMarkIcon as XMarkSolid, CheckIcon as CheckSolid, ClockIcon as ClockSolid, ChatBubbleBottomCenterTextIcon as ChatIconSolid } from '@heroicons/vue/24/solid';
import { XMarkIcon, CheckIcon, ClockIcon, InformationCircleIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/vue/24/outline';
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
const selectedHistoryDate = ref(null);
const selectedMemoDate = ref(null);
const historyLogs = ref([]);
const isLogsLoading = ref(false);

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
    if (status === getStatus(date)) return;
    try {
        await api.post('/attendance', {
            studentId: props.studentId,
            status,
            date,
            memo: getMemo(date)
        });
        await fetchAttendance();
        if (selectedHistoryDate.value === date) {
            await fetchLogs(date);
        }
        emit('updated');
    } catch (e) {
        emit('error', '출결 기록 실패');
    }
};

const handleMemoUpdate = async (date, memo) => {
    try {
        await api.post('/attendance', {
            studentId: props.studentId,
            status: getStatus(date),
            date,
            memo
        });
        await fetchAttendance();
        emit('updated');
    } catch (e) {
        console.error(e);
    }
};

const fetchLogs = async (date) => {
    isLogsLoading.value = true;
    try {
        const res = await api.get(`/attendance/logs?studentId=${props.studentId}&date=${date}`);
        historyLogs.value = res.data;
    } catch (e) {
        console.error(e);
    } finally {
        isLogsLoading.value = false;
    }
};

const toggleHistory = async (date) => {
    selectedMemoDate.value = null;
    if (selectedHistoryDate.value === date) {
        selectedHistoryDate.value = null;
        historyLogs.value = [];
    } else {
        selectedHistoryDate.value = date;
        await fetchLogs(date);
    }
};

const toggleMemo = (date) => {
    selectedHistoryDate.value = null;
    if (selectedMemoDate.value === date) {
        selectedMemoDate.value = null;
    } else {
        selectedMemoDate.value = date;
    }
};

const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};

const getStatusLabel = (status) => {
    return attendanceStatuses.find(s => s.value === status)?.label || '미기록';
};

const getStatusColorRoot = (status) => {
    return attendanceStatuses.find(s => s.value === status)?.color || 'gray';
};

const attendanceMap = computed(() => {
    const map = new Map();
    attendanceRecords.value.forEach(r => {
        map.set(r.date, { status: r.status, memo: r.memo });
    });
    return map;
});

const attendanceStatuses = [
    { value: AttendanceStatus.PRESENT, label: '출석', activeClass: 'bg-green-500 text-white', color: 'green', icon: CheckSolid },
    { value: AttendanceStatus.LATE, label: '지각', activeClass: 'bg-yellow-500 text-white', color: 'yellow', icon: ClockSolid },
    { value: AttendanceStatus.ABSENT, label: '결석', activeClass: 'bg-red-500 text-white', color: 'red', icon: XMarkSolid },
];

const getStatus = (date) => {
    return attendanceMap.value.get(date)?.status || AttendanceStatus.UNRECORDED;
};

const getMemo = (date) => {
    return attendanceMap.value.get(date)?.memo || '';
};

onMounted(fetchAttendance);

watch([() => props.studentId, () => props.startDate, () => props.endDate], fetchAttendance);
</script>
