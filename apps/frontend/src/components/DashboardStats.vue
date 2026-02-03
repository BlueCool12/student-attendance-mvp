<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 class="text-gray-400 text-sm font-medium uppercase tracking-wider">전체 학생</h3>
      <p class="text-4xl font-extrabold text-gray-900 mt-2">{{ total }}</p>
    </div>
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 class="text-green-500 text-sm font-medium uppercase tracking-wider">출석</h3>
      <p class="text-4xl font-extrabold text-gray-900 mt-2">{{ present }}</p>
    </div>
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 class="text-yellow-500 text-sm font-medium uppercase tracking-wider">지각</h3>
      <p class="text-4xl font-extrabold text-gray-900 mt-2">{{ late }}</p>
    </div>
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 class="text-red-500 text-sm font-medium uppercase tracking-wider">결석</h3>
      <p class="text-4xl font-extrabold text-gray-900 mt-2">{{ absent }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  total: { type: Number, required: true },
  present: { type: Number, required: true },
  late: { type: Number, required: true },
  absent: { type: Number, required: true }
});
</script>
