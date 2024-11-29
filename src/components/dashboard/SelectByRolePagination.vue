<script setup>
import { useFetchUsers } from '../../stores/fetchUsers'
import { ref, computed } from 'vue';


const allUsers = useFetchUsers()
const totalPages = computed(() => allUsers.totalPages)
let currentPage = computed(() => allUsers.currentPage)



let nextPage = ref(1)

const props = defineProps({
  role: String
});

const getNextPage = () => {
  nextPage.value = currentPage.value += 1
  allUsers.page = nextPage.value
  allUsers.fetchUsersByRole(props.role, nextPage.value)
}

const getPrevPage = () => {
  nextPage.value = currentPage.value -= 1
  allUsers.page = nextPage.value
  allUsers.fetchUsersByRole(props.role, nextPage.value)
}


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
  

  