<script setup>
import { ref, computed } from 'vue';
import { useFetchVaccines } from '../../stores/fetchVaccines';

const allVaccines = useFetchVaccines();
const totalPages = computed(() => allVaccines.totalPages);
let currentPage = computed(() => allVaccines.currentPage);

let nextPage = ref(1);

const props = defineProps({
  searchQuery: String
});

const getNextPage = () => {
  nextPage.value = currentPage.value += 1;
  allVaccines.page = nextPage.value;
  allVaccines.fetchSearchedVaccines(nextPage.value, props.searchQuery);
};

const getPrevPage = () => {
  nextPage.value = currentPage.value -= 1;
  allVaccines.page = nextPage.value;
  allVaccines.fetchSearchedVaccines(nextPage.value, props.searchQuery);
};
</script>

<template>
  <div class="flex justify-center items-center my-4">
    <button
      class="btn border-none dark:bg-slate-500 dark:text-gray-100"
      @click="getPrevPage"
      :disabled="nextPage === 1"
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
