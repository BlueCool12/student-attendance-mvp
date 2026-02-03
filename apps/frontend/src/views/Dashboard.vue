<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-7xl mx-auto">
      <header class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">학생 출결 관리</h1>
          <p class="text-gray-500 mt-2">기간 내 출결 현황을 한눈에 확인하세요.</p>
        </div>
      </header>

      <!-- Status Cards -->
      <DashboardStats 
          :total="students.length"
          :present="countStatus(1)"
          :late="countStatus(2)"
          :absent="countStatus(3)"
      />

      <!-- Filters -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
            <div class="flex gap-2 items-center overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">                
                <button 
                    v-for="status in filters" 
                    :key="status.value"
                    @click="currentFilter = status.value"
                    :class="[
                        'px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                        currentFilter === status.value 
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
                  <input type="date" v-model="startDate" required class="bg-transparent border-none text-sm text-gray-600 focus:ring-0 outline-none w-32">
                  <span class="text-gray-400">~</span>
                  <input type="date" v-model="endDate" required class="bg-transparent border-none text-sm text-gray-600 focus:ring-0 outline-none w-32">
              </div>
            </div>
        </div>

        <!-- Student List -->
        <!-- Student List as Table -->
        <!-- Summary Table (Always shown) -->
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b border-gray-100 bg-gray-50/50">
                        <th class="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap sticky left-0 bg-gray-50/50 w-48">학생 이름</th>
                        <th class="p-4 font-semibold text-gray-600 text-sm text-center">출석률</th>
                        <th class="p-4 font-semibold text-gray-600 text-sm text-center text-green-600">출석</th>
                        <th class="p-4 font-semibold text-gray-600 text-sm text-center text-yellow-600">지각</th>
                        <th class="p-4 font-semibold text-gray-600 text-sm text-center text-red-600">결석</th>
                        <th class="p-4 font-semibold text-gray-600 text-sm text-center">관리</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    <tr 
                        v-for="student in filteredStudents" 
                        :key="student.id" 
                        @click="openDetailModal(student)"
                        class="hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                        <td class="p-4 font-medium text-gray-900 sticky left-0 bg-white group-hover:bg-gray-50 transition-colors border-r border-gray-50">
                             <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                    {{ student.name.charAt(0) }}
                                </div>
                                <span>{{ student.name }}</span>
                            </div>
                        </td>
                        <td class="p-4 text-center">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {{ getAttendanceStats(student.id).rate }}%
                            </span>
                        </td>
                        <td class="p-4 text-center font-medium text-green-600">{{ getAttendanceStats(student.id).present }}</td>
                        <td class="p-4 text-center font-medium text-yellow-600">{{ getAttendanceStats(student.id).late }}</td>
                        <td class="p-4 text-center font-medium text-red-600">{{ getAttendanceStats(student.id).absent }}</td>
                        <td class="p-4 text-center" @click.stop>
                             <div class="flex items-center justify-center gap-2">
                                <button @click="openEditModal(student)" class="text-gray-300 hover:text-indigo-500 transition-colors p-1">
                                    <PencilIcon class="w-4 h-4" />
                                </button>
                                <button @click="deleteStudent(student.id)" class="text-gray-300 hover:text-red-500 transition-colors p-1">
                                    <TrashIcon class="w-4 h-4" />
                                </button>
                             </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddStudentModal v-if="showAddModal" @close="showAddModal = false" @added="fetchStudents" />
    <EditStudentModal v-if="showEditModal" :student="editingStudent" @close="showEditModal = false" @updated="fetchStudents" />
    <StudentDetailModal 
        v-if="showDetailModal" 
        :studentId="selectedStudent.id" 
        :studentName="selectedStudent.name"
        :dates="datesInRange"
        :attendanceRecords="attendanceRecords"
        @close="showDetailModal = false"
        @update="updateAttendance"
    />

    <!-- Floating Action Button -->
    <Teleport to="body">
      <button 
        @click="showAddModal = true"
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
import api from '../services/api';
import AddStudentModal from '../components/AddStudentModal.vue';
import StudentDetailModal from '../components/StudentDetailModal.vue';
import EditStudentModal from '../components/EditStudentModal.vue';
import DashboardStats from '../components/DashboardStats.vue';
import { TrashIcon, CheckIcon, XMarkIcon, ClockIcon, PlusIcon, PencilIcon } from '@heroicons/vue/24/solid';

const students = ref([]);
const attendanceRecords = ref([]);
const showAddModal = ref(false);
const showDetailModal = ref(false);
const showEditModal = ref(false);
const selectedStudent = ref(null);
const editingStudent = ref(null);
const startDate = ref(new Date().toISOString().split('T')[0]);
const endDate = ref(new Date().toISOString().split('T')[0]);
const currentFilter = ref('all');

const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    startDate.value = today;
    endDate.value = today;
};

const filters = [
    { label: '전체', value: 'all' },
    { label: '출석', value: 1 },
    { label: '지각', value: 2 },
    { label: '결석', value: 3 },
    { label: '미기록', value: 0 },
];

const attendanceStatuses = [
    { value: 1, label: '출석', activeClass: 'bg-green-500 text-white', color: 'green', icon: CheckIcon },
    { value: 2, label: '지각', activeClass: 'bg-yellow-500 text-white', color: 'yellow', icon: ClockIcon },
    { value: 3, label: '결석', activeClass: 'bg-red-500 text-white', color: 'red', icon: XMarkIcon },
];

const fetchStudents = async () => {
    try {
        const res = await api.get('/student');
        students.value = res.data;
    } catch (e) {
        console.error(e);
    }
};

const fetchAttendance = async () => {
    // If somehow empty, don't fetch. Watchers usually fix this immediately.
    if (!startDate.value || !endDate.value) return;

    try {
        const res = await api.get(`/attendance?startDate=${startDate.value}&endDate=${endDate.value}`);
        attendanceRecords.value = res.data;
    } catch (e) {
        console.error(e);
    }
};

// Consolidated watcher for date validation and fetching
watch([startDate, endDate], ([newStart, newEnd]) => {
    // Validation: If cleared, reset to today
    if (!newStart) {
        startDate.value = new Date().toISOString().split('T')[0];
        return;
    }
    if (!newEnd) {
        endDate.value = new Date().toISOString().split('T')[0];
        return;
    }
    
    // Only fetch if both valid
    if (newStart && newEnd) {
        fetchAttendance();
    }
});

// Ensure range always exists.
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

// Optimize: Create a Map for O(1) attendance lookup
// Key: `${studentId}-${date}`, Value: status
const attendanceMap = computed(() => {
    const map = new Map();
    attendanceRecords.value.forEach(r => {
        map.set(`${r.studentId}-${r.date}`, r.status);
    });
    return map;
});

// Helper using Map (O(1))
const getAttendanceStatus = (studentId, date) => {
    return attendanceMap.value.get(`${studentId}-${date}`) || 0;
};

// Optimize: Pre-calculate stats for all students
const studentStatsMap = computed(() => {
    const stats = new Map();
    const isRange = datesInRange.value.length > 0;
    
    students.value.forEach(student => {
        let present = 0;
        let late = 0;
        let absent = 0;
        let total = 0;

        if (isRange) {
             datesInRange.value.forEach(date => {
                const status = getAttendanceStatus(student.id, date);
                if (status === 1) present++;
                if (status === 2) late++;
                if (status === 3) absent++;
                if (new Date(date) <= new Date()) total++; 
            });
            const effectiveTotal = datesInRange.value.length;
            const rate = effectiveTotal === 0 ? 0 : Math.round(((present + late) / effectiveTotal) * 100);
            stats.set(student.id, { present, late, absent, rate });
        } else {
            // All time aggregation (filtered by student from raw records)
             // For O(N) optimization on All Time, ideally we iterate records once.
             // But simpler here: filter records first.
             // Optimization: Iterate all records once and bucket by student.
             // Since we need to calculate this efficiently.
        }
    });

    // Efficient 'All Time' stats calculation
    if (!isRange) {
        // Reset counts
        students.value.forEach(s => stats.set(s.id, { present: 0, late: 0, absent: 0, rate: 0 }));
        
        attendanceRecords.value.forEach(r => {
            const s = stats.get(r.studentId);
            if (s) {
                if (r.status === 1) s.present++;
                else if (r.status === 2) s.late++;
                else if (r.status === 3) s.absent++;
            }
        });
        
        // Calculate rates
        stats.forEach((val, key) => {
            const effectiveTotal = val.present + val.late + val.absent;
            val.rate = effectiveTotal === 0 ? 0 : Math.round(((val.present + val.late) / effectiveTotal) * 100);
        });
    }

    return stats;
});

const getAttendanceStats = (studentId) => {
    return studentStatsMap.value.get(studentId) || { present: 0, late: 0, absent: 0, rate: 0 };
};

const openDetailModal = (student) => {
    selectedStudent.value = student;
    showDetailModal.value = true;
};

const openEditModal = (student) => {
    editingStudent.value = student;
    showEditModal.value = true;
};

const updateAttendance = async (studentId, status, date) => {
    try {
        await api.post('/attendance', {
            studentId,
            status,
            date
        });
        await fetchAttendance();
    } catch (e) {
        alert('출결 기록 실패');
    }
};

const deleteStudent = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
        await api.delete(`/student/${id}`);
        await fetchStudents();
    } catch (e) {
        alert('삭제 실패');
    }
};

const filteredStudents = computed(() => {
    if (currentFilter.value === 'all') return students.value;
    
    return students.value.filter(s => {
        // Optimized filter using the pre-calculated Map or Stats
        // Wait, current logic filtered if *any* day matches status.
        // It's expensive to loop days again.
        // But datesInRange loop is unavoidable for "Any day matches X".
        // Using getAttendanceStatus (O(1)) makes this O(Student * Dates) which is better than O(Student * Dates * Records).
        return datesInRange.value.some(date => {
            return getAttendanceStatus(s.id, date) === currentFilter.value;
        });
    });
});

const countStatus = (status) => {
    const activeStudentIds = new Set(students.value.map(s => s.id));
    return attendanceRecords.value.filter(r => r.status === status && activeStudentIds.has(r.studentId)).length;
};

onMounted(() => {
    fetchStudents();
    fetchAttendance();
});
</script>
