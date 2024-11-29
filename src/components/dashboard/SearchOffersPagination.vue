<script setup>
import { ref, computed } from 'vue';
import { useFetchOffers } from '../../stores/fetchOffers';

const allOffers = useFetchOffers();
const totalPages = computed(() => allOffers.totalPages);
let currentPage = computed(() => allOffers.currentPage);

let nextPage = ref(1);

const props = defineProps({
  searchQuery: String
});

const getNextPage = () => {
  nextPage.value = currentPage.value += 1;
  allOffers.page = nextPage.value;
  allOffers.fetchSearchedOffers(nextPage.value, props.searchQuery);
};

const getPrevPage = () => {
  nextPage.value = currentPage.value -= 1;
  allOffers.page = nextPage.value;
  allOffers.fetchSearchedOffers(nextPage.value, props.searchQuery);
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
