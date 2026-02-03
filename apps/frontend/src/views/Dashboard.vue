<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-7xl mx-auto">
      <header class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">학생 출결 관리</h1>
          <p class="text-gray-500 mt-2">기간 내 출결 현황을 한눈에 확인하세요.</p>
        </div>
      </header>
      
      <DashboardStats 
          :total="summary.totalStudents"
          :present="summary.present"
          :late="summary.late"
          :absent="summary.absent"
      />
            
      <DashboardFilters 
        v-model:filter="currentFilter"
        v-model:startDate="startDate"
        v-model:endDate="endDate"
      />

      <StudentList 
        :students="students"
        :total="total"
        :limit="limit"
        v-model:page="page"
        @openDetail="openDetailModal"
        @edit="openEditModal"
        @delete="deleteStudent"
      />
    </div>

    <!-- Modals -->
    <StudentModal 
      v-if="showStudentModal" 
      :student="editingStudent"
      @close="closeStudentModal" 
      @added="addStudentToState" 
      @updated="fetchStudents" 
    />

    <StudentDetailModal 
        v-if="showDetailModal" 
        :studentId="selectedStudent.id" 
        :studentName="selectedStudent.name"
        :dates="datesInRange"
        :startDate="startDate"
        :endDate="endDate"
        @close="showDetailModal = false"
        @updated="onAttendanceUpdated"
    />

    <!-- Floating Action Button -->
    <Teleport to="body">
      <button 
        @click="openAddModal"
        class="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-50"
        title="학생 등록"
      >
        <PlusIcon class="w-8 h-8" />
      </button>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { AttendanceStatus } from '@student-attendance/shared';
import api from '../services/api';
import StudentModal from '../components/StudentModal.vue';
import StudentList from '../components/StudentList.vue';
import StudentDetailModal from '../components/StudentDetailModal.vue';
import DashboardStats from '../components/DashboardStats.vue';
import DashboardFilters from '../components/DashboardFilters.vue';
import { PlusIcon } from '@heroicons/vue/24/solid';

const students = ref([]);
const showDetailModal = ref(false);
const showStudentModal = ref(false);
const selectedStudent = ref(null);
const editingStudent = ref(null);
const startDate = ref(new Date().toISOString().split('T')[0]);
const endDate = ref(new Date().toISOString().split('T')[0]);
const currentFilter = ref(AttendanceStatus.ALL);
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const summary = ref({ totalStudents: 0, present: 0, late: 0, absent: 0 });

const fetchStudents = async () => {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append('startDate', startDate.value);
        queryParams.append('endDate', endDate.value);
        queryParams.append('status', currentFilter.value);
        queryParams.append('page', page.value.toString());
        queryParams.append('limit', limit.value.toString());
        
        const res = await api.get(`/student?${queryParams.toString()}`);
        students.value = res.data.data;
        total.value = res.data.total;
    } catch (e) {
        console.error(e);
    }
};

const fetchSummary = async () => {
    try {
        const res = await api.get(`/attendance/summary?startDate=${startDate.value}&endDate=${endDate.value}`);
        summary.value = res.data;
    } catch (e) {
        console.error(e);
    }
};

const addStudentToState = () => {    
    fetchStudents(); 
    fetchSummary();
};

watch([startDate, endDate], () => {
    page.value = 1;
    fetchStudents();
    fetchSummary();
});

watch(currentFilter, () => {
    page.value = 1;
    fetchStudents();
});

watch(page, () => {
    fetchStudents();
});

const datesInRange = computed(() => {
    if (!startDate.value || !endDate.value) return [];
    
    const dates = [];
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toISOString().split('T')[0]);
    }
    return dates;
});

const openDetailModal = (student) => {
    selectedStudent.value = student;
    showDetailModal.value = true;
};

const openAddModal = () => {
    editingStudent.value = null;
    showStudentModal.value = true;
};

const openEditModal = (student) => {
    editingStudent.value = student;
    showStudentModal.value = true;
};

const closeStudentModal = () => {
    showStudentModal.value = false;
    editingStudent.value = null;
};

const onAttendanceUpdated = () => {
    fetchSummary();        
    fetchStudents();
};

const deleteStudent = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
        await api.delete(`/student/${id}`);
        await fetchStudents();
        await fetchSummary();
    } catch (e) {
        alert('삭제 실패');
    }
};

onMounted(() => {
    fetchStudents();
    fetchSummary();
});
</script>
