<script setup>
import SideBar from '../../components/dashboard/SideBar.vue';
import Header from '../../components/dashboard/Header.vue';
import Breadcrumb from '../../components/dashboard/Breadcrumb.vue';
import { onMounted, ref, computed, watch } from 'vue';
import { useSideBar } from '../../stores/sideBar';
import { useBackendUrl } from '../../stores/backendUrl';
import dayjs from 'dayjs';
import axios, { all } from 'axios';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'vue-sonner';
import { useFetchLaboratorists } from '../../stores/fetchLaboratorists';
import LaboratoristsPagination from '../../components/dashboard/LaboratoristsPagination.vue';
import SearchLaboratoristsPagination from '../../components/dashboard/SearchLaboratoristsPagination.vue';

const backendUrl = useBackendUrl()
const allLaboratorists = useFetchLaboratorists()
const sideBar = useSideBar()
const laboratorists = computed(() => allLaboratorists.data)

onMounted(() => {
  sideBar.isResourcesExpanded = true
})


const searchQuery = ref('')
const sortKey = ref('');
const sortOrder = ref(1);

const searchedLaboratorists = computed(() => {
  let filteredLaboratorists = allLaboratorists.searchedLaboratorists || [];
  if (sortKey.value) {
    filteredLaboratorists.sort((a, b) => {
      const aValue = a[sortKey.value] || '';
      const bValue = b[sortKey.value] || '';
      const result = aValue.localeCompare(bValue);
      return result * sortOrder.value;
    });
  }

  return filteredLaboratorists;
});


watch(() => searchQuery.value, async () => {
  if (searchQuery.value < 1) {
    await allLaboratorists.fetchLaboratorists()
  }
})

const captureSearchQuery = async () => {
  await allLaboratorists.fetchSearchedLaboratorists(1, searchQuery.value)
  searchedLaboratorists.value = allLaboratorists.searchedLaboratorists
  return searchedLaboratorists.value
}


const filteredAndSortedLaboratorists = computed(() => {
  const filteredLaboratorists = laboratorists.value || [];
  if (sortKey.value) {
    filteredLaboratorists.sort((a, b) => {
      const aValue = a[sortKey.value] || '';
      const bValue = b[sortKey.value] || '';

      const result = aValue.localeCompare(bValue);
      return result * sortOrder.value;
    });
  }
  return filteredLaboratorists;
});


const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = -sortOrder.value;
  } else {
    sortKey.value = key;
    sortOrder.value = 1;
  }
};

const getSortIcon = (key) => {
  if (sortKey.value !== key) return '';
  return sortOrder.value === 1 ? '▲' : '▼';
};

const formatDate = (date) => {
  return dayjs(date).format('MMMM D, YYYY h:mm A');
};


async function exportToExcel() {
  const laboratorists = ref([])
  try {
    await axios.get('/fetch-all-laboratorists').then((res) => {
      laboratorists.value = res.data.laboratorists
    }).catch((err) => {
      console.log(err)
    })
  }
  catch (error) {
    console.log(error)
  }
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert the array of objects to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(laboratorists.value);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laboratorists');

  // Write the workbook to an Excel file
  XLSX.writeFile(workbook, 'laboratorists.xlsx');
}


const showAddLaboratoristModalFun = () => {
  const modal = document.getElementById('my_modal_2')
  modal.showModal()
}

const showAddLaboratoristModal = ref(true)

const updateDeletedLaboratoristLocally = (laboratoristId) => {
  const laboratoristIndexInDefaultArray = filteredAndSortedLaboratorists.value.findIndex(laboratorist => laboratorist.id === laboratoristId)
  const laboratoristIndexInSearchedLaboratorists = searchedLaboratorists.value.findIndex(laboratorist => laboratorist.id === laboratoristId)

  if (laboratoristIndexInDefaultArray !== -1) {
    filteredAndSortedLaboratorists.value.splice(laboratoristIndexInDefaultArray, 1)
  }
  if (laboratoristIndexInSearchedLaboratorists !== -1) {
    searchedLaboratorists.value.splice(laboratoristIndexInSearchedLaboratorists, 1)
  }
}


const laboratoristToDelete = ref(null)
const deleteLaboratoristConfirmation = (laboratorist) => {
  laboratoristToDelete.value = laboratorist
  const modal = document.getElementById('modal_delete_laboratorist_confirmation')
  modal.showModal()
}
const showDeleteConfirmationModal = ref(true)
const deleteLaboratorist = async () => {
  try {
    const res = await axios.post('/delete-laboratorist', {
      laboratorist_id: laboratoristToDelete.value.id
    });
    showDeleteConfirmationModal.value = false
    toast.success('Success', {
      description: res.data.message,
      duration: 5000,
    });
    updateDeletedLaboratoristLocally(laboratoristToDelete.value.id)
    await new Promise(resolve => setTimeout(resolve, 500));
    showDeleteConfirmationModal.value = true
  } catch (error) {
    showDeleteConfirmationModal.value = false;
    toast.error('Error', {
      description: 'error',
      duration: 5000,
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    showDeleteConfirmationModal.value = true
    console.log(error);
  }
}


const email = ref('')


const addLaboratorist = async () => {
  const button = document.getElementById('addDepartment-button')
  button.innerHTML = '<span class="loading loading-spinner loading-md"></span>'
  await new Promise(resolve => setTimeout(resolve, 2000))
  try {
    await axios.post('/add-laboratorist', {
      email: email.value,
    }).then(async (res) => {
      toast.success(res.data.message)
      showAddLaboratoristModal.value = false
      await new Promise(resolve => setTimeout(resolve, 500));
      showAddLaboratoristModal.value = true
      const objectToAdd = {
        id: res.data.newLaboratorist.id,
        name: res.data.newLaboratorist.name,
        email: res.data.newLaboratorist.email,
        avatar: res.data.newLaboratorist.avatar,
        created_at: res.data.newLaboratorist.created_at,
      }
      laboratorists.value.push(objectToAdd)
      if (searchedLaboratorists.value) {
        searchedLaboratorists.value.push(objectToAdd)
      }
    }).catch(async (error) => {
      toast.error(error.response.data.error)
      showAddLaboratoristModal.value = false
      await new Promise(resolve => setTimeout(resolve, 500));
      showAddLaboratoristModal.value = true

    })
  }
  catch (error) {
    console.log(error)
    toast.error(error)
    showAddLaboratoristModal.value = false
    await new Promise(resolve => setTimeout(resolve, 500));
    showAddLaboratoristModal.value = true

  }
  button.innerHTML = 'Add Laboratorist'
}
</script>


<template>
  <div class=" bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen">
    <Toaster richColors position="top-right" />
    <SideBar />
    <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
      <Header />

      <Breadcrumb first="Dashboard" second="Resources" third="Laboratorists"
        firstIcon='<i class="fa-solid fa-gauge"></i>' secondIcon='<i class="fa-solid fa-people-group"></i>'
        thirdIcon='<i class="fa-solid fa-vial-virus"></i>' link="/admin-dashboard" />


      <!-- Table -->
      <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
        <!-- Search and Role Filter -->
        <div class="flex justify-between mb-4 gap-3 flex-col sm:flex-row">
          <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
            class="input input-bordered w-full dark:bg-slate-800 dark:text-gray-300" />
          <button @click="showAddLaboratoristModalFun()"
            class="bg-primarycolor text-white rounded-lg p-4 text-sm hover:bg-blue-500 font-semibold w-full">Add
            Laboratorist</button>
          <button @click="exportToExcel()" class="btn btn-primary flex items-center">
            <i class="fas fa-file-excel mr-2"></i>
            Download Excel
          </button>
        </div>
        <!-- Table -->
        <div class="overflow-x-auto custom-scrollbar">
          <table class="table w-full">
            <!-- head -->
            <thead>
              <tr>
                <th @click="sortBy('name')" class="cursor-pointer dark:text-gray-300">
                  Name
                  <span>{{ getSortIcon('name') }}</span>
                </th>
                <th @click="sortBy('email')" class="cursor-pointer dark:text-gray-300">
                  Email
                  <span>{{ getSortIcon('email') }}</span>
                </th>
                <th @click="sortBy('created_at')" class="cursor-pointer dark:text-gray-300">
                  Created_at
                  <span>{{ getSortIcon('created_at') }}</span>
                </th>
                <th class="dark:text-gray-300">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>

              <tr v-if="searchQuery" v-for="laboratorist in searchedLaboratorists" :key="laboratorist.id">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="mask mask-squircle h-12 w-12">
                        <img v-if="laboratorist.avatar" :src="backendUrl.backendUrl + '/storage/' + laboratorist.avatar"
                          alt="" />
                        <img v-else src="/src/assets/images/unkown-profile-pic.png" alt="" />
                      </div>
                    </div>
                    <div>
                      <div class="font-bold dark:text-gray-300">{{ laboratorist.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="dark:text-gray-300">
                  {{ laboratorist.email }}
                  <br />
                </td>
                <td class="dark:text-gray-300">
                  {{ formatDate(laboratorist.created_at) }}
                </td>
                <td>
                  <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                    @click="deleteLaboratoristConfirmation(laboratorist)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>



              <tr v-else v-for="lab in filteredAndSortedLaboratorists" :key="lab.id">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="mask mask-squircle h-12 w-12">
                        <img v-if="lab.avatar" :src="backendUrl.backendUrl + '/storage/' + lab.avatar" alt="" />
                        <img v-else src="/src/assets/images/unkown-profile-pic.png" alt="" />
                      </div>
                    </div>
                    <div>
                      <div class="font-bold dark:text-gray-300">{{ lab.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="dark:text-gray-300">
                  {{ lab.email }}
                  <br />
                </td>
                <td class="dark:text-gray-300">
                  {{ formatDate(lab.created_at) }}
                </td>
                <td>
                  <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                    @click="deleteLaboratoristConfirmation(lab)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>


              <!-- Add doctor Modal -->
              <dialog v-if="showAddLaboratoristModal" id="my_modal_2" class="modal">
                <div class="modal-box dark:bg-slate-700">
                  <div class="py-4 flex flex-col gap-3">
                    <h3 class="text-lg font-bold dark:text-gray-300">Laboratorist Details</h3>
                    <label class="form-control w-full max-w-xs">
                      <span class="label-text dark:text-gray-300">Email</span>
                      <input type="text" placeholder="Enter Email" v-model="email"
                        class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                    </label>
                  </div>
                  <div class="modal-action">
                    <button @click="addLaboratorist" id="addDepartment-button"
                      class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-12">Add
                      Laboratorist</button>
                  </div>
                </div>
                <form method="dialog" class="modal-backdrop">
                  <button @click="closeModal">close</button>
                </form>
              </dialog>





              <!-- Modal Delete User Confirmation -->
              <dialog v-if="showDeleteConfirmationModal" id="modal_delete_laboratorist_confirmation"
                class="modal modal-bottom sm:modal-middle">
                <div class="modal-box dark:bg-slate-700">
                  <h3 class="text-lg font-bold dark:text-gray-300">Confirm Delete Laboratorist</h3>
                  <p class="py-4 text-red-600 font-semibold">Are you sure you want to delete the selected laboratorist?
                  </p>
                  <div class="modal-action">
                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500" @click="deleteLaboratorist">Yes</button>

                    <form method="dialog">
                      <button class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-100">Close</button>
                    </form>
                  </div>
                </div>
              </dialog>
            </tbody>
          </table>
          <div v-if="!laboratorists" class="animate-pulse w-full">
            <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
            <div class="h-4 bg-gray-300 mb-6 rounded"></div>
            <div class="h-4 bg-gray-200 mb-6 rounded"></div>
            <div class="h-4 bg-gray-300 mb-6 rounded"></div>
            <div class="h-4 bg-gray-200 mb-6 rounded"></div>
          </div>
        </div>
        <!-- Pagination -->
        <SearchLaboratoristsPagination :searchQuery="searchQuery" v-if="searchQuery" />
        <LaboratoristsPagination v-else />
      </div>



    </div>
  </div>



</template>

<style>
.custom-scrollbar {
  scrollbar-width: thin;
  /* For Firefox */
  scrollbar-color: #c5c2c2 #f1f1f1;
  /* For Firefox */
}

/* For Webkit browsers (Chrome, Safari) */
.custom-scrollbar::-webkit-scrollbar {
  width: 12px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 10px;
  border: 3px solid #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>