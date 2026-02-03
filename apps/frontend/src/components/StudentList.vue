<template>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">        
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b border-gray-100 bg-gray-50/50">
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
                        <td colspan="6" class="p-12 text-center text-gray-500">
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
    </div>
    
    <!-- Pagination -->
    <div v-if="localTotal > 0" class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 sm:px-6">
       <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
           <div>
               <p class="text-sm text-gray-700">
                   <span class="font-medium">{{ total }}</span>명 중
                   <span class="font-medium">{{ (page - 1) * limit + 1 }}</span>
                   -
                   <span class="font-medium">{{ Math.min(page * limit, total) }}</span>
                   명 표시
               </p>
           </div>
           <div>
               <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                   <button
                       @click="$emit('update:page', page - 1)"
                       :disabled="page === 1"
                       class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                       <span class="sr-only">Previous</span>
                       <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
                   </button>
                   
                    <button
                        v-for="p in totalPages"
                        :key="p"
                        @click="$emit('update:page', p)"
                        :class="[
                            p === page ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                            'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                        ]"
                    >
                        {{ p }}
                    </button>

                   <button
                       @click="$emit('update:page', page + 1)"
                       :disabled="page === totalPages"
                       class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                       <span class="sr-only">Next</span>
                       <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
                   </button>
               </nav>
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
    }
});

const emit = defineEmits(['openDetail', 'edit', 'delete', 'update:page']);

const localTotal = computed(() => props.total);
const totalPages = computed(() => Math.ceil(props.total / props.limit));
</script>
