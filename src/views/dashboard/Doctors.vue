<script setup>
import SideBar from '../../components/dashboard/SideBar.vue';
import Header from '../../components/dashboard/Header.vue';
import Breadcrumb from '../../components/dashboard/Breadcrumb.vue';
import { onMounted, ref, computed, watch } from 'vue';
import { useSideBar } from '../../stores/sideBar';
import { useFetchDoctors } from '../../stores/fetchDoctors'
import { useBackendUrl } from '../../stores/backendUrl';
import dayjs from 'dayjs';
import axios, { all } from 'axios';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'vue-sonner';
import { useRoute } from 'vue-router';
import { useFetchUsers } from '../../stores/fetchUsers';
import DoctorsPagination from '../../components/dashboard/DoctorsPagination.vue';
import SearchDoctorsPagination from '../../components/dashboard/SearchDoctorsPagination.vue';

const route = useRoute()
const backendUrl = useBackendUrl()
const allDoctors = useFetchDoctors()
const allUsers = useFetchUsers()
const users = computed(() => allUsers.data);
const sideBar = useSideBar()
const departments = computed(() => allDoctors.allDepartments)
const doctors = computed(() => allDoctors.data)

onMounted(() => {
  sideBar.isResourcesExpanded = true
})

watch(() => allUsers.currentPage, () => {
  users.value = allUsers.data
})


const searchQuery = ref('')
const sortKey = ref('');
const sortOrder = ref(1);

const searchedDoctors = computed(() => {
  let filteredDoctors = allDoctors.searchedDoctors || [];
  console.log(filteredDoctors)
  if (sortKey.value) {
    filteredDoctors.sort((a, b) => {
      const aValue = a[sortKey.value] || '';
      const bValue = b[sortKey.value] || '';
      const result = aValue.localeCompare(bValue);
      return result * sortOrder.value;
    });
  }

  return filteredDoctors;
});


watch(() => searchQuery.value, async () => {
  if (searchQuery.value < 1) {
    await allDoctors.fetchDoctors()
  }
})

const captureSearchQuery = async () => {
  await allDoctors.fetchSearchedDoctors(1, searchQuery.value)
  searchedDoctors.value = allDoctors.searchedDoctors
  return searchedDoctors.value
}


const filteredAndSortedDoctors = computed(() => {
  const filteredDoctors = doctors.value || [];

  if (sortKey.value) {
    filteredDoctors.sort((a, b) => {
      const aValue = a[sortKey.value] || ''; // Default to empty string if null or undefined
      const bValue = b[sortKey.value] || ''; // Default to empty string if null or undefined

      const result = aValue.localeCompare(bValue);
      return result * sortOrder.value;
    });
  }

  return filteredDoctors;
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
  const doctors = ref([])
  try {
    await axios.get('/fetch-all-doctors').then((res) => {
      doctors.value = res.data.doctors
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
  const worksheet = XLSX.utils.json_to_sheet(doctors.value);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Doctors');

  // Write the workbook to an Excel file
  XLSX.writeFile(workbook, 'doctors.xlsx');
}


const showAddDoctorModalFun = () => {
  const modal = document.getElementById('my_modal_2')
  modal.showModal()
}

const showAddDoctorModal = ref(true)

const updateDeletedDoctorLocally = (doctorId) => {
  const doctorIndexInDefaultArray = filteredAndSortedDoctors.value.findIndex(doctor => doctor.id === doctorId)
  const doctorIndexInSearchedDoctors = searchedDoctors.value.findIndex(doctor => doctor.id === doctorId)

  if (doctorIndexInDefaultArray !== -1) {
    filteredAndSortedDoctors.value.splice(doctorIndexInDefaultArray, 1)
  }
  if (doctorIndexInSearchedDoctors !== -1) {
    searchedDoctors.value.splice(doctorIndexInSearchedDoctors, 1)
  }
}


const doctorToDelete = ref(null)
const deleteDoctorConfirmation = (doctor) => {
  doctorToDelete.value = doctor
  const modal = document.getElementById('modal_delete_doctor_confirmation')
  modal.showModal()
}
const showDeleteConfirmationModal = ref(true)
const deleteDoctor = async () => {
  try {
    const res = await axios.post('/delete-doctor', {
      doctor_id: doctorToDelete.value.id
    });
    showDeleteConfirmationModal.value = false
    toast.success('Success', {
      description: res.data.message,
      duration: 5000,
    });
    updateDeletedDoctorLocally(doctorToDelete.value.id)
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
const smallDescription = ref('')
const qualification = ref('')
const appointmentPrice = ref('')
const consultationPrice = ref('')
const department = ref('')

const addDoctor = async () => {
  const button = document.getElementById('addDepartment-button')
  button.innerHTML = '<span class="loading loading-spinner loading-md"></span>'
  await new Promise(resolve => setTimeout(resolve, 2000))
  try {
    await axios.post('/add-doctor', {
      email: email.value,
      smallDescription: smallDescription.value,
      qualification: qualification.value,
      appointmentPrice: appointmentPrice.value,
      consultationPrice: consultationPrice.value,
      department: department.value
    }).then(async (res) => {
      console.log(res)
      toast.success(res.data.message)
      showAddDoctorModal.value = false
      await new Promise(resolve => setTimeout(resolve, 500));
      showAddDoctorModal.value = true
      const objectToAdd = {
        id: res.data.newDoctor.id,
        name: res.data.newDoctor.name,
        email: res.data.newDoctor.email,
        small_Description: res.data.newDoctor.small_description,
        appointment_price: res.data.newDoctor.appointment_price,
        consultation_price: res.data.newDoctor.consultation_price,
        department: res.data.newDoctor.department_name,
      }
      doctors.value.push(objectToAdd)
      if (searchedDoctors.value) {
        searchedDoctors.value.push(objectToAdd)
      }
    }).catch(async (error) => {
      console.log(error.response.data.error)
      toast.error(error.response.data.error)
      showAddDoctorModal.value = false
      await new Promise(resolve => setTimeout(resolve, 500));
      showAddDoctorModal.value = true

    })
  }
  catch (error) {
    console.log(error)
    toast.error(error)
    showAddDoctorModal.value = false
    await new Promise(resolve => setTimeout(resolve, 500));
    showAddDoctorModal.value = true

  }
  button.innerHTML = 'Add Doctor'
}
</script>


<template>
  <div class=" bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen">
    <Toaster richColors position="top-right" />
    <SideBar />
    <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
      <Header />

      <Breadcrumb first="Dashboard" second="Resources" third="Doctors" firstIcon='<i class="fa-solid fa-gauge"></i>'
        secondIcon='<i class="fa-solid fa-people-group"></i>' thirdIcon='<i class="fa-solid fa-user-doctor"></i>'
        link="/admin-dashboard" />


      <!-- Table -->
      <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
        <!-- Search and Role Filter -->
        <div class="flex justify-between mb-4 gap-3 flex-col sm:flex-row">
          <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
            class="input input-bordered w-full dark:bg-slate-800 dark:text-gray-300" />
          <button @click="showAddDoctorModalFun()"
            class="bg-primarycolor text-white rounded-lg p-4 text-sm hover:bg-blue-500 font-semibold w-full">Add
            Doctor</button>
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
                <th @click="sortBy('appointment_price')" class="cursor-pointer dark:text-gray-300">
                  Appointment Price
                  <span>{{ getSortIcon('appointment_price') }}</span>
                </th>
                <th @click="sortBy('consultation_price')" class="cursor-pointer dark:text-gray-300">
                  Consultation Price
                  <span>{{ getSortIcon('consultation_price') }}</span>
                </th>
                <th @click="sortBy('department_name')" class="dark:text-gray-300">
                  Department
                  <span>{{ getSortIcon('department_name') }}</span>
                </th>
                <th class="dark:text-gray-300">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>

              <tr v-if="searchQuery" v-for="doctor in searchedDoctors" :key="doctor.id">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="mask mask-squircle h-12 w-12">
                        <img v-if="doctor.avatar" :src="backendUrl.backendUrl + '/storage/' + doctor.avatar" alt="" />
                        <img v-else src="/src/assets/images/unkown-profile-pic.png" alt="" />
                      </div>
                    </div>
                    <div>
                      <div class="font-bold dark:text-gray-300">{{ doctor.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="dark:text-gray-300">
                  {{ doctor.email }}
                  <br />
                </td>


                <td class="dark:text-gray-300">
                  {{ formatDate(doctor.created_at) }}
                </td>
                <td class="dark:text-gray-300">
                  {{ doctor.appointment_price }}$
                </td>
                <td class="dark:text-gray-300">
                  {{ doctor.consultation_price }}$
                </td>
                <td class="dark:text-gray-300">
                  {{ doctor.department_name }}
                </td>

                <td>
                  <button class="btn border-none bg-red-600 text-white hover:bg-red-500" @click="deleteDoctorConfirmation(doctor)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>



              <tr v-else v-for="doc in filteredAndSortedDoctors" :key="doc.id">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="mask mask-squircle h-12 w-12">
                        <img v-if="doc.avatar" :src="backendUrl.backendUrl + '/storage/' + doc.avatar" alt="" />
                        <img v-else src="/src/assets/images/unkown-profile-pic.png" alt="" />
                      </div>
                    </div>
                    <div>
                      <div class="font-bold dark:text-gray-300">{{ doc.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="dark:text-gray-300">
                  {{ doc.email }}
                  <br />
                </td>


                <td class="dark:text-gray-300">
                  {{ formatDate(doc.created_at) }}
                </td>
                <td class="dark:text-gray-300">
                  {{ doc.appointment_price }}$
                </td>
                <td class="dark:text-gray-300">
                  {{ doc.consultation_price }}$
                </td>
                <td class="dark:text-gray-300">
                  {{ doc.department_name }}
                </td>

                <td>
                  <button class="btn border-none bg-red-600 text-white hover:bg-red-500" @click="deleteDoctorConfirmation(doc)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>


              <!-- Add doctor Modal -->
              <dialog v-if="showAddDoctorModal" id="my_modal_2" class="modal">
                <div class="modal-box dark:bg-slate-700">
                  <div class="py-4 flex flex-col gap-3">
                    <h3 class="text-lg font-bold dark:text-gray-300">Doctor Details</h3>
                    <label class="form-control w-full max-w-xs">
                      <span class="label-text dark:text-gray-300">Email</span>
                      <input type="text" placeholder="The email should be registred before by a user" v-model="email"
                        class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                    </label>
                    <label class="form-control w-full max-w-xs">
                      <span class="label-text dark:text-gray-300">Small Description</span>
                      <textarea placeholder="Enter a simple description about the doctor" v-model="smallDescription"
                        class="textarea textarea-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300"></textarea> </label>
                    <label class="form-control w-full max-w-xs">
                      <span class="label-text dark:text-gray-300">Qualification</span>
                      <input type="text" placeholder="Enter the doctor qualification" v-model="qualification"
                        class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                    </label>
                    <label class="form-control w-full max-w-xs">
                      <span class="label-text dark:text-gray-300">Appointment Price</span>
                      <input type="text" placeholder="Enter doctor appointment price" v-model="appointmentPrice"
                        class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                    </label>
                    <label class="form-control w-full max-w-xs">
                      <span class="label-text dark:text-gray-300">Consultation Price</span>
                      <input placeholder="Enter doctor consultation price" type="text" v-model="consultationPrice"
                        class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                    </label>
                    <label class="form-control w-full max-w-xs">
                      <span class="label-text dark:text-gray-300">Department</span>
                      <select class="select select-bordered mt-2 dark:bg-slate-800 dark:text-gray-300" v-model="department">
                        <option disabled selected>Choose one</option>
                        <option v-for="department in departments" :key="department.id" :value="department.id">
                          {{ department.name }}
                        </option>
                      </select>
                    </label>

                  </div>
                  <div class="modal-action">
                    <button @click="addDoctor" id="addDepartment-button"
                      class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-12">Add
                      Doctor</button>
                  </div>
                </div>
                <form method="dialog" class="modal-backdrop">
                  <button @click="closeModal">close</button>
                </form>
              </dialog>

              <!-- Modal Delete User Confirmation -->
              <dialog v-if="showDeleteConfirmationModal" id="modal_delete_doctor_confirmation"
                class="modal modal-bottom sm:modal-middle">
                <div class="modal-box dark:bg-slate-700">
                  <h3 class="text-lg font-bold dark:text-gray-300">Confirm Delete Doctor</h3>
                  <p class="py-4 text-red-600 font-semibold">Are you sure you want to delete the selected doctor?</p>
                  <div class="modal-action">
                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500" @click="deleteDoctor">Yes</button>

                    <form method="dialog">
                      <button class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-100">Close</button>
                    </form>
                  </div>
                </div>
              </dialog>
            </tbody>
          </table>
          <div v-if="!doctors" class="animate-pulse w-full">
            <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
            <div class="h-4 bg-gray-300 mb-6 rounded"></div>
            <div class="h-4 bg-gray-200 mb-6 rounded"></div>
            <div class="h-4 bg-gray-300 mb-6 rounded"></div>
            <div class="h-4 bg-gray-200 mb-6 rounded"></div>
          </div>
        </div>
        <!-- Pagination -->
        <SearchDoctorsPagination :searchQuery="searchQuery" v-if="searchQuery" />
        <DoctorsPagination v-else />
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