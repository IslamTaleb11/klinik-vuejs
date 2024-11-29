<script setup>
import { ref, computed, onMounted } from 'vue';
import { useFetchPatients } from '../../stores/fetchPatients';

const allPatients = useFetchPatients()
onMounted(async()=>{
  await allPatients.fetchPatients()
})
const totalPages = computed(() => allPatients.totalPages)
let currentPage = computed(() => allPatients.currentPage)

let nextPage = ref(1)

const getNextPage = () => {
  nextPage.value = currentPage.value += 1
  allPatients.page = nextPage.value
  allPatients.fetchPatients(nextPage.value)
}

const getPrevPage = () => {
  nextPage.value = currentPage.value -= 1
  allPatients.page = nextPage.value
  allPatients.fetchPatients(nextPage.value) 
}


</script>

<template>
    <div class="flex justify-center items-center my-4">
      <button
        class="btn border-none dark:bg-slate-500 dark:text-gray-100"
        @click="getPrevPage"
        :disabled="nextPage === 1 || totalPages === 1"
      >
        Previous
      </button>
      <span class="mx-2 dark:text-gray-300">Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        class="btn border-none dark:bg-slate-500 dark:text-gray-100"
        @click="getNextPage()"
        :disabled="nextPage === totalPages"
      >
        Next
      </button>
    </div>
  </template>
  

  