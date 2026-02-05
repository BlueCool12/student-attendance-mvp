<template>
  <Teleport to="body">    
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>

        <!-- Modal Content -->
        <div class="relative bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span class="w-2 h-6 bg-indigo-600 rounded-full"></span>
                학생 일괄 등록
            </h3>
            
            <div class="space-y-6">
                <div class="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-700 flex justify-between items-center">
                    <span>엑셀 파일을 업로드하여 학생을 일괄 등록합니다.</span>
                    <button @click="downloadTemplate" class="text-indigo-900 font-bold hover:underline flex items-center gap-1">
                        <DocumentArrowDownIcon class="w-4 h-4" />
                        템플릿 다운로드
                    </button>
                </div>

                <div v-if="parsedStudents.length === 0">
                    <label 
                        class="block w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-gray-50 transition-colors"
                        @dragover.prevent
                        @drop.prevent="handleDrop"
                    >
                        <ArrowUpTrayIcon class="w-8 h-8 text-gray-400 mb-2" />
                        <span class="text-gray-500 font-medium">클릭하거나 파일을 이곳에 드래그하세요</span>
                        <input type="file" class="hidden" accept=".xlsx, .xls" @change="handleFileUpload" ref="fileInput" />
                    </label>
                </div>

                <div v-else>
                    <div class="flex justify-between items-center mb-2">
                         <h4 class="font-bold text-gray-700">추출된 학생 목록</h4>
                         <button @click="resetFile" class="text-xs text-red-500 hover:underline">다시 올리기</button>
                    </div>
                    <div class="max-h-60 overflow-y-auto border rounded-xl divide-y bg-gray-50">
                        <div v-for="(student, idx) in parsedStudents" :key="idx" class="p-3 flex justify-between items-center hover:bg-white transition-colors">
                            <span class="font-medium text-gray-900">{{ student.name }}</span>
                            <span :class="student.name.length > 6 ? 'text-red-500' : 'text-gray-400'" class="text-xs">
                                {{ student.name.length }}/6
                            </span>
                        </div>
                    </div>
                    <p class="text-right text-xs text-gray-500 mt-2">총 {{ parsedStudents.length }}명 확인됨</p>
                </div>

                <div class="flex gap-3 pt-4">
                    <button 
                        @click="$emit('close')" 
                        class="flex-1 px-4 py-3 text-sm text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-colors"
                    >
                        취소
                    </button>
                    <button 
                        @click="submit" 
                        class="flex-1 px-4 py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                        :disabled="parsedStudents.length === 0 || isSubmitting"
                    >
                        <span v-if="isSubmitting">등록 중...</span>
                        <span v-else>등록하기</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import * as XLSX from 'xlsx';
import { DocumentArrowDownIcon, ArrowUpTrayIcon } from '@heroicons/vue/24/outline';
import api from '../services/api';

const emit = defineEmits(['close', 'uploaded', 'error']);

const fileInput = ref(null);
const parsedStudents = ref([]);
const isSubmitting = ref(false);

const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{ '이름': '홍길동' }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "템플릿");
    XLSX.writeFile(wb, "학생등록_템플릿.xlsx");
};

const processFile = async (file) => {
    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const students = jsonData
            .map(row => ({ name: String(row['이름'] || row['name'] || '').trim() }))
            .filter(s => s.name.length > 0)
            .slice(0, 100); // Limit processed rows to prevent overload

        if (students.length === 0) {
            throw new Error('유효한 데이터가 없습니다. "이름" 컬럼을 확인해주세요.');
        }

        parsedStudents.value = students;
    } catch (e) {
        console.error(e);
        emit('error', '엑셀 파일을 읽는 중 오류가 발생했습니다.');
    }
};

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) processFile(file);
};

const handleDrop = (event) => {
    const file = event.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
         processFile(file);
    } else {
        emit('error', '엑셀 파일만 업로드 가능합니다.');
    }
};

const resetFile = () => {
    parsedStudents.value = [];
    if (fileInput.value) fileInput.value.value = '';
};

const submit = async () => {
    if (parsedStudents.value.length === 0) return;
    
    // Valiadtion
    const invalidStudents = parsedStudents.value.filter(s => s.name.length > 6);
    if (invalidStudents.length > 0) {
        emit('error', `${invalidStudents.length}명의 이름이 6자를 초과합니다.`);
        return;
    }

    isSubmitting.value = true;
    try {
        await api.post('/student/bulk', { students: parsedStudents.value });
        emit('uploaded');
        emit('close');
    } catch (e) {
        console.error(e);
        emit('error', '학생 일괄 등록에 실패했습니다.');
    } finally {
        isSubmitting.value = false;
    }
};
</script>
