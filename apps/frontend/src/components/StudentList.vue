<template>
    <div class="bg-white overflow-hidden">        
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b border-gray-100 bg-gray-50/50">
                        <th class="p-4 w-12">
                            <input 
                                type="checkbox" 
                                :checked="isAllSelected"
                                @change="toggleSelectAll"
                                class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                            >
                        </th>
                        <th class="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap sticky left-0 bg-gray-50/50 w-48">이름</th>
                        <th class="p-4 font-semibold text-gray-600 text-sm text-center">출석률</th>
                        <th class="p-4 font-semibold text-gray-600 text-sm text-center text-green-600">출석</th>
                        <th class="p-4 font-semibold text-gray-600 text-sm text-center text-yellow-600">지각</th>
                        <th class="p-4 font-semibold text-gray-600 text-sm text-center text-red-600">결석</th>
                        <th class="p-4 font-semibold text-gray-600 text-sm text-center">관리</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    <tr v-if="students.length === 0">
                        <td colspan="7" class="p-12 text-center text-gray-500">
                            <div class="flex flex-col items-center justify-center gap-2">
                                <span class="text-lg">데이터가 없습니다.</span>
                                <span class="text-sm text-gray-400">새로운 학생을 등록하거나 필터를 변경해보세요.</span>
                            </div>
                        </td>
                    </tr>
                    <tr 
                        v-for="student in students" 
                        :key="student.id" 
                        @click="$emit('openDetail', student)"
                        class="hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                        <td class="p-4" @click.stop>
                            <input 
                                type="checkbox" 
                                :checked="selectedIds.has(student.id)"
                                @change="toggleSelect(student.id)"
                                class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                            >
                        </td>
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
                                {{ student.stats?.rate || 0 }}%
                            </span>
                        </td>
                        <td class="p-4 text-center font-medium text-green-600">{{ student.stats?.present || 0 }}</td>
                        <td class="p-4 text-center font-medium text-yellow-600">{{ student.stats?.late || 0 }}</td>
                        <td class="p-4 text-center font-medium text-red-600">{{ student.stats?.absent || 0 }}</td>
                        <td class="p-4 text-center" @click.stop>
                             <div class="flex items-center justify-center gap-2">
                                <button @click="$emit('edit', student)" class="text-gray-300 hover:text-indigo-500 transition-colors p-1">
                                    <PencilIcon class="w-4 h-4" />
                                </button>
                                <button @click="$emit('delete', student.id)" class="text-gray-300 hover:text-red-500 transition-colors p-1">
                                    <TrashIcon class="w-4 h-4" />
                                </button>
                             </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div v-if="localTotal > 0" class="flex items-center justify-between px-4 py-3 bg-gray-50/30 border-t border-gray-100 sm:px-6">
           <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
               <div>
                   <p class="text-xs text-gray-500">
                       <span class="font-bold text-gray-900">{{ total }}</span>명 중
                       <span class="font-medium text-gray-700">{{ (page - 1) * limit + 1 }}-{{ Math.min(page * limit, total) }}</span>
                       표시
                   </p>
               </div>
               <div>
                   <nav class="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px bg-white" aria-label="Pagination">
                       <button
                           @click="$emit('update:page', page - 1)"
                           :disabled="page === 1"
                           class="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-200 bg-white text-sm font-medium text-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                       >
                           <span class="sr-only">Previous</span>
                           <ChevronLeftIcon class="h-4 w-4" aria-hidden="true" />
                       </button>
                       
                        <button
                            v-for="p in totalPages"
                            :key="p"
                            @click="$emit('update:page', p)"
                            :class="[
                                p === page ? 'z-10 bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50',
                                'relative inline-flex items-center px-3 py-1.5 border text-xs font-bold transition-all'
                            ]"
                        >
                            {{ p }}
                        </button>
   
                       <button
                           @click="$emit('update:page', page + 1)"
                           :disabled="page === totalPages"
                           class="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-200 bg-white text-sm font-medium text-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                       >
                           <span class="sr-only">Next</span>
                           <ChevronRightIcon class="h-4 w-4" aria-hidden="true" />
                       </button>
                   </nav>
               </div>
           </div>
        </div>
    </div>
</template>

<script setup>
import { TrashIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid';
import { computed } from 'vue';

const props = defineProps({
    students: {
        type: Array,
        required: true
    },
    total: {
        type: Number,
        required: true,
        default: 0
    },
    page: {
        type: Number,
        required: true,
        default: 1
    },
    limit: {
        type: Number,
        required: true,
        default: 10
    },
    selectedIds: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['openDetail', 'edit', 'delete', 'update:page', 'update:selectedIds']);

const localTotal = computed(() => props.total);
const totalPages = computed(() => Math.ceil(props.total / props.limit));

const isAllSelected = computed(() => {
    if (props.students.length === 0) return false;
    return props.students.every(s => props.selectedIds.has(s.id));
});

const toggleSelectAll = () => {
    const newSelected = new Set(props.selectedIds);
    if (isAllSelected.value) {
        props.students.forEach(s => newSelected.delete(s.id));
    } else {
        props.students.forEach(s => newSelected.add(s.id));
    }
    emit('update:selectedIds', newSelected);
};

const toggleSelect = (id) => {
    const newSelected = new Set(props.selectedIds);
    if (newSelected.has(id)) {
        newSelected.delete(id);
    } else {
        newSelected.add(id);
    }
    emit('update:selectedIds', newSelected);
};
</script>
