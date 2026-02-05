<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-7xl mx-auto">
      <header class="mb-8 flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">학생 출결 관리</h1>
          <p class="text-gray-500 mt-2">기간 내 출결 현황을 한눈에 확인하세요.</p>
        </div>
        <div class="flex gap-3">
          <button 
            @click="exportToExcel"
            class="flex items-center gap-2 bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 px-6 py-3 rounded-2xl font-bold shadow-sm transition-all active:scale-95"
          >
            <ArrowDownTrayIcon class="w-5 h-5" />
            <span>엑셀 다운로드</span>
          </button>
          <button 
            @click="openBulkUploadModal"
            class="flex items-center gap-2 bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 px-6 py-3 rounded-2xl font-bold shadow-sm transition-all active:scale-95"
          >
            <ArrowUpTrayIcon class="w-5 h-5" />
            <span>일괄 등록</span>
          </button>
          <button 
            @click="openAddModal"
            class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all hover:scale-105 active:scale-95"
          >
            <PlusIcon class="w-5 h-5" />
            <span>학생 등록</span>
          </button>
        </div>
      </header>
      
      <DashboardStats 
          :total="summary.totalStudents"
          :present="summary.present"
          :late="summary.late"
          :absent="summary.absent"
      />
            
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <DashboardFilters 
          v-model:filter="currentFilter"
          v-model:startDate="startDate"
          v-model:endDate="endDate"
          v-model:search="searchQuery"
          v-model:limit="limit"
        />

        <StudentList 
          :students="students"
          :total="total"
          :limit="limit"
          :loading="isLoading"
          v-model:page="page"
          v-model:selectedIds="selectedIds"
          @openDetail="openDetailModal"
          @edit="openEditModal"
          @delete="deleteStudent"
        />
      </div>
    </div>
    
    <!-- Bulk Action Bar -->
    <BulkActionBar 
        :selectedCount="selectedIds.size" 
        @update="handleBulkUpdate"
        @clear="selectedIds.clear()"
    />

    <!-- Modals -->
      <StudentModal 
        v-if="editingTarget !== undefined" 
        :student="editingTarget"
        @close="closeStudentModal" 
        @added="addStudentToState" 
        @updated="fetchStudents" 
        @error="handleModalError"
      />

      <BulkUploadModal 
        v-if="showBulkUploadModal"
        @close="closeBulkUploadModal"
        @uploaded="onBulkUploaded"
        @error="handleModalError"
      />

    <StudentDetailModal 
        v-if="selectedStudent" 
        :studentId="selectedStudent.id" 
        :studentName="selectedStudent.name"
        :dates="datesInRange"
        :startDate="startDate"
        :endDate="endDate"
        @close="selectedStudent = null"
        @updated="onAttendanceUpdated"
        @error="handleModalError"
      />

    <ConfirmModal 
        :show="confirmModal.show"
        :title="confirmModal.title"
        :message="confirmModal.message"
        :type="confirmModal.type"
        :isAlert="confirmModal.isAlert"
        @confirm="handleConfirmModal"
        @cancel="handleCancelModal"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AttendanceStatus } from '@student-attendance/shared';
import api from '../services/api';
import StudentModal from '../components/StudentModal.vue';
import BulkUploadModal from '../components/BulkUploadModal.vue';
import StudentList from '../components/StudentList.vue';
import StudentDetailModal from '../components/StudentDetailModal.vue';
import DashboardStats from '../components/DashboardStats.vue';
import DashboardFilters from '../components/DashboardFilters.vue';
import BulkActionBar from '../components/BulkActionBar.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import { PlusIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/vue/24/solid';
import * as XLSX from 'xlsx';

const route = useRoute();
const router = useRouter();

const students = ref([]);
const selectedStudent = ref(null);
const editingTarget = ref(undefined);
const showBulkUploadModal = ref(false);
const total = ref(0);

const currentFilter = ref(Number(route.query.status) || AttendanceStatus.ALL);
const page = ref(Number(route.query.page) || 1);
const limit = ref(Number(route.query.limit) || 10);
const startDate = ref(route.query.startDate || new Date().toISOString().split('T')[0]);
const endDate = ref(route.query.endDate || new Date().toISOString().split('T')[0]);

const exportToExcel = () => {
    if (students.value.length === 0) {
        showConfirm({
            title: '알림',
            message: '내보낼 데이터가 없습니다.',
            isAlert: true
        });
        return;
    }
    
    const exportData = students.value.map(s => ({
        '이름': s.name,
        '출석률': `${s.stats?.rate || 0}%`,
        '출석': s.stats?.present || 0,
        '지각': s.stats?.late || 0,
        '결석': s.stats?.absent || 0,
        '등록일': s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    const wscols = [
        { wch: 15 }, // 이름
        { wch: 10 }, // 출석률
        { wch: 10 }, // 출석
        { wch: 10 }, // 지각
        { wch: 10 }, // 결석
        { wch: 20 }, // 등록일
    ];
    ws['!cols'] = wscols;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "출석현황");
    
    const dateInfo = startDate.value === endDate.value 
        ? startDate.value 
        : `${startDate.value}_${endDate.value}`;
    XLSX.writeFile(wb, `출석현황_${dateInfo}.xlsx`);
};

const confirmModal = ref({
    show: false,
    title: '',
    message: '',
    type: 'info',
    isAlert: false,
    onConfirm: null,
    onCancel: null
});

const showConfirm = (options) => {
    confirmModal.value = {
        show: true,
        title: options.title || '알림',
        message: options.message,
        type: options.type || 'info',
        isAlert: options.isAlert || false,
        onConfirm: options.onConfirm,
        onCancel: options.onCancel
    };
};

const handleConfirmModal = () => {
    if (confirmModal.value.onConfirm) confirmModal.value.onConfirm();
    confirmModal.value.show = false;
};

const handleCancelModal = () => {
    if (confirmModal.value.onCancel) confirmModal.value.onCancel();
    confirmModal.value.show = false;
};

const handleModalError = (message) => {
    showConfirm({
        title: '오류',
        message: message,
        type: 'danger',
        isAlert: true
    });
};
const summary = ref({ totalStudents: 0, present: 0, late: 0, absent: 0 });
const searchQuery = ref(route.query.search || '');
const selectedIds = ref(new Set());
const isLoading = ref(false);
let searchTimeout = null;

const fetchStudents = async (silent = false) => {
    if (!silent) isLoading.value = true;
    try {
        const queryParams = new URLSearchParams();
        queryParams.append('startDate', startDate.value);
        queryParams.append('endDate', endDate.value);
        queryParams.append('status', currentFilter.value);
        queryParams.append('page', page.value.toString());
        queryParams.append('limit', limit.value.toString());
        if (searchQuery.value) {
            queryParams.append('search', searchQuery.value);
        }
        
        const res = await api.get(`/student?${queryParams.toString()}`);
        students.value = res.data.data;
        total.value = res.data.total;
    } catch (e) {
        console.error(e);
        showConfirm({
            title: '오류',
            message: '데이터를 불러오는데 실패했습니다.',
            type: 'danger',
            isAlert: true
        });
    } finally {
        if (!silent) isLoading.value = false;
    }
};

const fetchSummary = async () => {
    try {
        const res = await api.get(`/attendance/summary?startDate=${startDate.value}&endDate=${endDate.value}`);
        summary.value = res.data;
    } catch (e) {
        console.error(e);        
        showConfirm({
            title: '오류',
            message: '요약 정보를 불러오는데 실패했습니다.',
            type: 'danger',
            isAlert: true
        });
    }
};

const addStudentToState = () => {    
    fetchStudents(); 
    fetchSummary();
};

watch([startDate, endDate, currentFilter, limit], ([newStart, newEnd, newFilter, newLimit]) => {    
    page.value = 1;
        
    router.replace({
        query: {
            ...route.query,
            status: newFilter,
            page: 1,
            limit: newLimit,
            startDate: newStart,
            endDate: newEnd || undefined,
        }
    });

    selectedIds.value.clear();
    fetchStudents();
    fetchSummary();
});

watch(page, (newPage) => {
    router.replace({
        query: {
            ...route.query,
            page: newPage
        }
    });
    
    selectedIds.value.clear();
    fetchStudents();
});

watch(searchQuery, (newSearch) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        page.value = 1;
        
        router.replace({
            query: {
                ...route.query,
                search: newSearch || undefined,
                page: 1
            }
        });

        selectedIds.value.clear();
        fetchStudents();
    }, 300);
});

const handleBulkUpdate = async (status) => {
    if (selectedIds.value.size === 0) return;
    
    const isRange = startDate.value !== endDate.value;
    const dateText = isRange ? `${startDate.value} ~ ${endDate.value}` : `${startDate.value}`;
    
    showConfirm({
        title: '일괄 처리 확인',
        message: `${dateText}\n${selectedIds.value.size}명의 학생을 일괄 처리하시겠습니까?`,
        onConfirm: async () => {
            try {
                await api.post('/attendance/bulk', {
                    studentIds: Array.from(selectedIds.value),
                    startDate: startDate.value,
                    endDate: endDate.value,
                    status: status
                });
                
                selectedIds.value.clear();
                fetchStudents(true);
                fetchSummary();
            } catch (error) {
                console.error('Bulk update failed:', error);
                showConfirm({
                    title: '오류',
                    message: '일괄 처리에 실패했습니다.',
                    type: 'danger',
                    isAlert: true
                });
            }
        }
    });
};

const datesInRange = computed(() => {
    if (!startDate.value) return [];
    
    const dates = [];
    const start = new Date(startDate.value);
    const end = endDate.value ? new Date(endDate.value) : new Date(startDate.value);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toISOString().split('T')[0]);
    }
    return dates;
});

const openDetailModal = (student) => {
    selectedStudent.value = student;
};

const openAddModal = () => {
    editingTarget.value = null;
};

const openEditModal = (student) => {
    editingTarget.value = student;
};

const closeStudentModal = () => {
    editingTarget.value = undefined;
};

const openBulkUploadModal = () => {
    showBulkUploadModal.value = true;
};

const closeBulkUploadModal = () => {
    showBulkUploadModal.value = false;
};

const onBulkUploaded = () => {
    showConfirm({
        title: '완료',
        message: '학생들이 성공적으로 등록되었습니다.',
        isAlert: true
    });
    fetchStudents(true);
    fetchSummary();
};

const onAttendanceUpdated = () => {
    fetchSummary();        
    fetchStudents(true);
};

const deleteStudent = async (id) => {
    showConfirm({
        title: '학생 삭제',
        message: '정말 삭제하시겠습니까?\n삭제된 정보는 복구할 수 없습니다.',
        type: 'danger',
        onConfirm: async () => {
            try {
                await api.delete(`/student/${id}`);
                await fetchStudents();
                await fetchSummary();
            } catch (e) {
                showConfirm({
                    title: '오류',
                    message: '삭제에 실패했습니다.',
                    type: 'danger',
                    isAlert: true
                });
            }
        }
    });
};

onMounted(() => {
    fetchStudents();
    fetchSummary();
});
</script>
