<script setup>
import SideBar from '../../components/dashboard/SideBar.vue';
import Header from '../../components/dashboard/Header.vue';
import Breadcrumb from '../../components/dashboard/Breadcrumb.vue';
import { onMounted, ref, computed, watch } from 'vue';
import { useSideBar } from '../../stores/sideBar';
import Pagination from '../../components/dashboard/Pagination.vue';
import { useFetchUsers } from '../../stores/fetchUsers'
import { useBackendUrl } from '../../stores/backendUrl';
import dayjs from 'dayjs';
import SearchPagination from '../../components/dashboard/SearchPagination.vue';
import SelectByRolePagination from '../../components/dashboard/SelectByRolePagination.vue';
import axios, { all } from 'axios';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'vue-sonner';
import { useRoute } from 'vue-router';


const route = useRoute()
const backendUrl = useBackendUrl()
const allUsers = useFetchUsers()
const users = computed(() => allUsers.data);
const sideBar = useSideBar()
const countAllUsers = computed(() => allUsers.countAllUsers);
const countAllAdmins = computed(() => allUsers.countAllAdmins);
const countAllDoctors = computed(() => allUsers.countAllDoctors);
const countAllNurses = computed(() => allUsers.countAllNurses);
const countAllPharmacists = computed(() => allUsers.countAllPharmacists);
const countAllLaboratorists = computed(() => allUsers.countAllLaboratorists);
const countAllPatients = computed(() => allUsers.countAllPatients);

onMounted(() => {
  sideBar.isResourcesExpanded = true
})

watch(() => allUsers.currentPage, () => {
  users.value = allUsers.data
})


const searchQuery = ref('')
const selectedRole = ref('');
const sortKey = ref('');
const sortOrder = ref(1);

const searchedUsers = computed(() => {
  let filteredUsers = allUsers.searchedUsers || [];

  if (sortKey.value) {
    filteredUsers.sort((a, b) => {
      const aValue = a[sortKey.value] || ''; // Default to empty string if null or undefined
      const bValue = b[sortKey.value] || ''; // Default to empty string if null or undefined

      const result = aValue.localeCompare(bValue);
      return result * sortOrder.value;
    });
  }

  return filteredUsers;
});

const selectedByRoleUsers = computed(() => {
  let filteredUsers = allUsers.selectedByRoleUsers || [];

  if (sortKey.value) {
    filteredUsers.sort((a, b) => {
      const aValue = a[sortKey.value] || ''; // Default to empty string if null or undefined
      const bValue = b[sortKey.value] || ''; // Default to empty string if null or undefined

      const result = aValue.localeCompare(bValue);
      return result * sortOrder.value;
    });
  }

  return filteredUsers;
});


watch(() => searchQuery.value, async () => {
  if (searchQuery.value < 1) {
    await allUsers.fetchUsers()
  }
})

const captureSearchQuery = async () => {
  // allUsers.searchedUsers = null
  if (selectedRole.value) {
    selectedRole.value = ''
  }
  await allUsers.fetchSearchedUsers(1, searchQuery.value)
  searchedUsers.value = allUsers.searchedUsers
  return searchedUsers.value
}


const filteredAndSortedUsers = computed(() => {
  const filteredUsers = users.value || [];

  if (sortKey.value) {
    filteredUsers.sort((a, b) => {
      const aValue = a[sortKey.value] || ''; // Default to empty string if null or undefined
      const bValue = b[sortKey.value] || ''; // Default to empty string if null or undefined

      const result = aValue.localeCompare(bValue);
      return result * sortOrder.value;
    });
  }

  return filteredUsers;
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

const uniqueRoles = ['Admin', 'Doctor', 'Pharmacist', 'Nurse', 'Laboratorist', 'Patient']


const usersByRole = () => {
  if (searchQuery.value) {
    searchQuery.value = ''
  }
  switch (selectedRole.value) {
    case 'Admin':
      allUsers.fetchUsersByRole('admin')
      break;
    case 'Doctor':
      allUsers.fetchUsersByRole('doctor')
      break;
    case 'Nurse':
      allUsers.fetchUsersByRole('nurse')
      break;
    case 'Pharmacist':
      allUsers.fetchUsersByRole('pharmacist')
      break;
    case 'Laboratorist':
      allUsers.fetchUsersByRole('laboratorist')
      break;
    case 'Patient':
      allUsers.fetchUsersByRole('patient')
      break;
    default:
      break;
  }

}


async function exportToExcel() {
  const users = ref([])
  try {
    await axios.get('/fetch-all-users').then((res) => {
      users.value = res.data.users
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
  const worksheet = XLSX.utils.json_to_sheet(users.value);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

  // Write the workbook to an Excel file
  XLSX.writeFile(workbook, 'users.xlsx');
}

// const checkAll = ref(false)
// const checkedUsers = ref([])

// const CheckedUser = (userId) => {
//   if (!checkedUsers.value.includes(userId)) {
//     checkedUsers.value.push(userId);
//   } else {
//     const index = checkedUsers.value.indexOf(userId);
//     if (index > -1) {
//       checkedUsers.value.splice(index, 1);
//     }
//   }
//   console.log(checkedUsers.value); // For debugging purposes
// };

// const checkAllUsers = () => {
//   if (Array.isArray(filteredAndSortedUsers.value)) {
//     filteredAndSortedUsers.value.forEach(user => {
//       CheckedUser(user.id);
//     });
//   } else if (Array.isArray(searchedUsers.value)) {
//     searchedUsers.value.forEach(user => {
//       CheckedUser(user.id);
//     });
//   } else if (Array.isArray(selectedByRoleUsers.value)) {
//     selectedByRoleUsers.value.forEach(user => {
//       CheckedUser(user.id);
//     });
//   }
//   const checkAll = usecheckAllUsers()
//   checkAll.checkedAll = true
// }

const currentUser = ref(null);

const showRoleActionModal = (user) => {
  currentUser.value = user;
  const modal = document.getElementById('my_modal_2')
  modal.showModal()
}
const currentUserRole = computed(() => {
  if (!currentUser.value) return '';
  return currentUser.value.is_admin
    ? 'Admin'
    : currentUser.value.is_nurse
      ? 'Nurse'
      : currentUser.value.is_doctor
        ? 'Doctor'
        : currentUser.value.is_pharmacist
          ? 'Pharmacist'
          : currentUser.value.is_laboratorist
            ? 'Laboratorist'
            : 'Patient';
});

const chosenUserRole = ref(null)
const confirmChangeUserRole = () => {
  const modal = document.getElementById('modal_change_role_confirmation')
  modal.showModal()
}

const showModal = ref(true)
async function updateTheUserRole(role, userId) {
  try {
    const res = await axios.post('/change-user-role', {
      role: role.toLowerCase(),
      user_id: userId
    });

    updateUserRoleLocally(userId, role.toLowerCase());
    showModal.value = false
    toast.success('Success', {
      description: res.data.message,
      duration: 5000,
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    showModal.value = true
    chosenUserRole.value = null
    allUsers.fetchUsersCount()
  } catch (error) {
    showModal.value = false;
    toast.error('Error', {
      description: 'error',
      duration: 5000,
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    showModal.value = true
    chosenUserRole.value = null

    console.log(error);
  }
}

const updateUserRoleLocally = (userId, newRole) => {
  const userIndex = filteredAndSortedUsers.value.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    filteredAndSortedUsers.value[userIndex].is_admin = newRole === 'admin' ? 1 : 0;
    filteredAndSortedUsers.value[userIndex].is_doctor = newRole === 'doctor' ? 1 : 0;
    filteredAndSortedUsers.value[userIndex].is_nurse = newRole === 'nurse' ? 1 : 0;
    filteredAndSortedUsers.value[userIndex].is_pharmacist = newRole === 'pharmacist' ? 1 : 0;
    filteredAndSortedUsers.value[userIndex].is_laboratorist = newRole === 'laboratorist' ? 1 : 0;
    filteredAndSortedUsers.value[userIndex].is_patient = newRole === 'patient' ? 1 : 0;
  }
};

const updateDeletedUserLocally = (userId) => {
  const userIndexInDefaultArray = filteredAndSortedUsers.value.findIndex(user => user.id === userId)
  const userIndexInSelectedByRoleUsers = selectedByRoleUsers.value.findIndex(user => user.id === userId)
  const userIndexInSearchedUsers = searchedUsers.value.findIndex(user => user.id === userId)

  if (userIndexInDefaultArray !== -1) {
    filteredAndSortedUsers.value.splice(userIndexInDefaultArray, 1)
  }
  if (userIndexInSelectedByRoleUsers !== -1) {
    selectedByRoleUsers.value.splice(userIndexInSelectedByRoleUsers, 1)
  }
  if (userIndexInSearchedUsers !== -1) {
    searchedUsers.value.splice(userIndexInSearchedUsers, 1)
  }
}

const changeUserRole = () => {
  updateTheUserRole(chosenUserRole.value, currentUser.value.id)
}

const userRole = computed((user) => {
  if (user.is_admin) {
    return { role: 'Admin', classes: 'text-cyan-500' };
  } else if (user.is_doctor) {
    return { role: 'Doctor', classes: 'text-green-500' };
  } else if (user.is_nurse) {
    return { role: 'Nurse', classes: 'text-yellow-500' };
  } else if (user.is_pharmacist) {
    return { role: 'Pharmacist', classes: 'text-red-500' };
  } else if (user.is_laboratorist) {
    return { role: 'Laboratorist', classes: 'text-gray-500' };
  } else {
    return { role: 'Patient', classes: 'text-blue-500' };
  }
})

const userToDelete = ref(null)
const deleteUserConfirmation = (user) => {
  userToDelete.value = user
  const modal = document.getElementById('modal_delete_user_confirmation')
  modal.showModal()
}
const showDeleteConfirmationModal = ref(true)
const deleteUser = async () => {
  try {
    const res = await axios.post('/delete-user', {
      user_id: userToDelete.value.id
    });

    showDeleteConfirmationModal.value = false
    toast.success('Success', {
      description: res.data.message,
      duration: 5000,
    });
    updateDeletedUserLocally(userToDelete.value.id)
    await new Promise(resolve => setTimeout(resolve, 500));
    showDeleteConfirmationModal.value = true
    allUsers.fetchUsersCount()
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

</script>


<template>
  <div class=" bg-[#F0F5F9] min-h-screen dark:bg-darkmodebg flex">
    <Toaster richColors position="top-right" />
    <SideBar />
    <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
      <Header />

      <Breadcrumb first="Dashboard" second="Resources" third="Users" firstIcon='<i class="fa-solid fa-gauge"></i>'
        secondIcon='<i class="fa-solid fa-people-group"></i>' thirdIcon='<i class="fa-solid fa-users"></i>'
        link="/admin-dashboard" />


      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-[80%] mt-5 max-[1025px]:w-[90%]">
        <!-- All Users Card -->
        <div class="bg-blue-500 text-white p-5 rounded-lg flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-users text-4xl"></i>
            <div>
              <p class="text-lg font-bold">Total Users</p>
              <p class="text-2xl">{{ countAllUsers }}</p>
            </div>
          </div>
        </div>
        <!-- Total Doctors Card -->
        <div class="bg-green-500 text-white p-5 rounded-lg flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-user-doctor text-4xl"></i>
            <div>
              <p class="text-lg font-bold">Total Doctors</p>
              <p class="text-2xl">{{ countAllDoctors }}</p>
            </div>
          </div>
        </div>
        <!-- Total Admins Card -->
        <div class="bg-cyan-500 text-white p-5 rounded-lg flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-user-shield text-4xl"></i>
            <div>
              <p class="text-lg font-bold">Total Admins</p>
              <p class="text-2xl">{{ countAllAdmins }}</p>
            </div>
          </div>
        </div>
        <!-- Total Nurses Card -->
        <div class="bg-yellow-500 text-white p-5 rounded-lg flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-user-nurse text-4xl"></i>
            <div>
              <p class="text-lg font-bold">Total Nurses</p>
              <p class="text-2xl">{{ countAllNurses }}</p>
            </div>
          </div>
        </div>
        <!-- Total Pharmacists Card -->
        <div class="bg-red-500 text-white p-5 rounded-lg flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-prescription-bottle-medical text-4xl"></i>
            <div>
              <p class="text-lg font-bold">Total Pharmacists</p>
              <p class="text-2xl">{{ countAllPharmacists }}</p>
            </div>
          </div>
        </div>
        <!-- Total Laboratorists Card -->
        <div class="bg-gray-500 text-white p-5 rounded-lg flex items-center justify-between">
          <div class="flex items-center gap-2 flex-wrap">
            <i class="fa-solid fa-vial text-4xl"></i>
            <div>
              <p class="text-lg font-bold">Total Laboratorists</p>
              <p class="text-2xl">{{ countAllLaboratorists }}</p>
            </div>
          </div>
        </div>
        <!-- Total Patients Card -->
        <div class="bg-purple-500 text-white p-5 rounded-lg flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-hospital-user text-4xl"></i>
            <div>
              <p class="text-lg font-bold">Total Patients</p>
              <p class="text-2xl">{{ countAllPatients }}</p>
            </div>
          </div>
        </div>
      </div>



      <!-- Table -->
      <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
        <!-- Search and Role Filter -->
        <div class="flex justify-between mb-4 gap-3 flex-col sm:flex-row">
          <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
            class="input input-bordered w-full dark:bg-slate-800 dark:text-gray-300" />
          <select v-model="selectedRole" @change="usersByRole" class="select dark:bg-slate-800 dark:text-gray-300 select-bordered w-full">
            <option value="">All Roles</option>
            <option v-for="role in uniqueRoles" :key="role" :value="role">
              {{ role }}
            </option>
          </select>
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
                <!-- <th>
                  <label>
                    <input type="checkbox" class="checkbox"  @change="checkAllUsers"/>
                  </label>
                </th> -->
                <th @click="sortBy('name')" class="cursor-pointer dark:text-gray-300">
                  Name
                  <span>{{ getSortIcon('name') }}</span>
                </th>
                <th @click="sortBy('email')" class="cursor-pointer dark:text-gray-300">
                  Email
                  <span>{{ getSortIcon('email') }}</span>
                </th>
                <th class="cursor-pointer dark:text-gray-300">
                  Role
                </th>
                <th @click="sortBy('email_verified_at')" class="cursor-pointer dark:text-gray-300">
                  Email Verified
                  <span>{{ getSortIcon('email_verified_at') }}</span>
                </th>
                <th @click="sortBy('created_at')" class="cursor-pointer dark:text-gray-300">
                  Joined
                  <span>{{ getSortIcon('created_at') }}</span>
                </th>
                <th class="dark:text-gray-300">
                  Role Action
                </th>
                <th class="dark:text-gray-300">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>

              <tr v-if="searchQuery" v-for="user in searchedUsers" :key="user.id">
                <!-- <th>
                  <label>

                    <input id="{{ user.id }}" @change="CheckedUser(user.id)" type="checkbox" class="checkbox" :checked="checkedUsers.includes(user.id)" />
                  </label>
                </th> -->
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="mask mask-squircle h-12 w-12">
                        <img v-if="user.avatar" :src="backendUrl.backendUrl + '/storage/' + user.avatar" alt="" />
                        <img v-else src="/src/assets/images/unkown-profile-pic.png" alt="" />
                      </div>
                    </div>
                    <div>
                      <div class="font-bold dark:text-gray-300">{{ user.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="dark:text-gray-300">
                  {{ user.email }}
                  <br />
                </td>

                <!-- <td :class="['rounded-lg text-center font-semibold', userRole(user).classes]">
                  {{ userRole(user).role }}
                </td> -->
                <td v-if="user.is_admin" class="text-cyan-500 rounded-lg text-center font-semibold">Admin</td>
                <td v-else-if="user.is_doctor" class="text-green-500 rounded-lg text-center font-semibold">Doctor</td>
                <td v-else-if="user.is_nurse" class="text-yellow-500 rounded-lg text-center font-semibold">Nurse</td>
                <td v-else-if="user.is_pharmacist" class="text-red-500 rounded-lg text-center font-semibold">Pharmacist
                </td>
                <td v-else-if="user.is_laboratorist" class="text-gray-500 rounded-lg text-center font-semibold">
                  Laboratorist</td>
                <td v-else class="text-blue-500 rounded-lg text-center font-semibold">Patient</td>

                <td v-if="user.email_verified_at" class="dark:text-gray-300">{{ formatDate(user.email_verified_at) }}</td>
                <td v-else class="text-red-600 font-semibold">Email not verified</td>

                <td class="dark:text-gray-300">
                  {{ formatDate(user.created_at) }}
                </td>
                <td>
                  <button class="btn border-none dark:bg-slate-500 dark:text-gray-100" @click="showRoleActionModal(user)">Change Role</button>
                </td>
                <td>
                  <button class="btn border-none bg-red-600 text-white hover:bg-red-500" @click="deleteUserConfirmation(user)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>

              <tr v-else-if="selectedRole" v-for="userByRole in selectedByRoleUsers" :key="userByRole.id">
                <!-- <th>
                  <label>
                    <input v-if="checkAll" checked  id="{{ userByRole.id }}" @change="CheckedUser(userByRole.id)" type="checkbox" class="checkbox" />

                    <input v-else  id="{{ userByRole.id }}" @change="CheckedUser(userByRole.id)" type="checkbox" class="checkbox" />
                  </label>
                </th> -->
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="mask mask-squircle h-12 w-12">
                        <img v-if="userByRole.avatar" :src="backendUrl.backendUrl + '/storage/' + userByRole.avatar"
                          alt="" />
                        <img v-else src="/src/assets/images/unkown-profile-pic.png" alt="" />
                      </div>
                    </div>
                    <div>
                      <div class="font-bold dark:text-gray-300">{{ userByRole.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="dark:text-gray-300">
                  {{ userByRole.email }}
                  <br />
                </td>

                <td v-if="userByRole.is_admin" class="text-cyan-500 rounded-lg text-center font-semibold">Admin</td>
                <td v-else-if="userByRole.is_doctor" class="text-green-500 rounded-lg text-center font-semibold">Doctor
                </td>
                <td v-else-if="userByRole.is_nurse" class="text-yellow-500 rounded-lg text-center font-semibold">Nurse
                </td>
                <td v-else-if="userByRole.is_pharmacist" class="text-red-500 rounded-lg text-center font-semibold">
                  Pharmacist
                </td>
                <td v-else-if="userByRole.is_laboratorist" class="text-gray-500 rounded-lg text-center font-semibold">
                  Laboratorist</td>
                <td v-else class="text-blue-500 rounded-lg text-center font-semibold">Patient</td>

                <td v-if="userByRole.email_verified_at" class="dark:text-gray-300">{{ formatDate(userByRole.email_verified_at) }}</td>
                <td v-else class="text-red-600 font-semibold">Email not verified</td>

                <td class="dark:text-gray-300">
                  {{ formatDate(userByRole.created_at) }}
                </td>
                <td>
                  <button class="btn border-none dark:bg-slate-500 dark:text-gray-100" @click="showRoleActionModal(userByRole)">Change Role</button>
                </td>
                <td>
                  <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                    @click="deleteUserConfirmation(userByRole)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>

              <tr v-else v-for="user in filteredAndSortedUsers">
                <!-- <th>
                  <label>
                    <input v-if="checkAll" checked  id="{{ user.id }}" @change="CheckedUser(user.id)" type="checkbox" class="checkbox" />
                    <input v-else  id="{{ user.id }}" @change="CheckedUser(user.id)" type="checkbox" class="checkbox" />

                  </label>
                </th> -->
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="mask mask-squircle h-12 w-12">
                        <img v-if="user.avatar" :src="backendUrl.backendUrl + '/storage/' + user.avatar" alt="" />
                        <img v-else src="/src/assets/images/unkown-profile-pic.png" alt="" />
                      </div>
                    </div>
                    <div>
                      <div class="font-bold dark:text-gray-300">{{ user.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="dark:text-gray-300">
                  {{ user.email }}
                  <br />
                </td>
                <td v-if="user.is_admin" class="text-cyan-500 rounded-lg text-center font-semibold">Admin</td>
                <td v-else-if="user.is_doctor" class="text-green-500 rounded-lg text-center font-semibold">Doctor</td>
                <td v-else-if="user.is_nurse" class="text-yellow-500 rounded-lg text-center font-semibold">Nurse</td>
                <td v-else-if="user.is_pharmacist" class="text-red-500 rounded-lg text-center font-semibold">Pharmacist
                </td>
                <td v-else-if="user.is_laboratorist" class="text-gray-500 rounded-lg text-center font-semibold">
                  Laboratorist</td>
                <td v-else class="text-blue-500 rounded-lg text-center font-semibold">Patient</td>

                <td v-if="user.email_verified_at" class="dark:text-gray-300">{{ formatDate(user.email_verified_at) }}</td>
                <td v-else class="text-red-600 font-semibold">Email not verified</td>

                <td class="dark:text-gray-300">
                  {{ formatDate(user.created_at) }}
                </td>
                <td>
                  <button class="btn border-none dark:bg-slate-500 dark:text-gray-100" @click="showRoleActionModal(user)">Change Role</button>
                </td>
                <td>
                  <button class="btn border-none bg-red-600 text-white hover:bg-red-500" @click="deleteUserConfirmation(user)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>


              <!-- Modal -->
              <dialog v-if="showModal" id="my_modal_2" class="modal">
                <div class="modal-box dark:bg-slate-700">
                  <h3 class="text-lg font-bold dark:text-gray-300">User current role is {{ currentUserRole }}</h3>
                  <p class="py-4 dark:text-gray-300">Select the new role</p>
                  <label class="form-control w-full max-w-xs">
                    <select class="select select-bordered dark:bg-slate-700 dark:text-gray-300 dark:border-gray-500" v-model="chosenUserRole" @change="confirmChangeUserRole">
                      <option disabled selected>Chose one</option>
                      <option v-if="currentUserRole !== 'Admin'">Admin</option>
                      <option v-if="currentUserRole !== 'Doctor'">Doctor</option>
                      <option v-if="currentUserRole !== 'Nurse'">Nurse</option>
                      <option v-if="currentUserRole !== 'Pharmacist'">Pharmacist</option>
                      <option v-if="currentUserRole !== 'Laboratorist'">Laboratorist</option>
                      <option v-if="currentUserRole !== 'Patient'">Patient</option>
                    </select>
                  </label>
                </div>
                <form method="dialog" class="modal-backdrop">
                  <button @click="closeModal">close</button>
                </form>
              </dialog>



              <!-- Modal Change Role Confirmation -->
              <dialog v-if="showModal" id="modal_change_role_confirmation" class="modal modal-bottom sm:modal-middle">
                <div class="modal-box dark:bg-slate-700">
                  <h3 class="text-lg font-bold dark:text-gray-300">Confirm Role Change</h3>
                  <p class="py-4 text-red-600 font-semibold">Are you sure you want to change the role of the selected
                    user?</p>
                  <div class="modal-action">
                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500" @click="changeUserRole">Yes</button>

                    <form method="dialog">
                      <button class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-100">Close</button>
                    </form>
                  </div>
                </div>
              </dialog>

              <!-- Modal Delete User Confirmation -->
              <dialog v-if="showDeleteConfirmationModal" id="modal_delete_user_confirmation"
                class="modal modal-bottom sm:modal-middle">
                <div class="modal-box dark:bg-slate-700">
                  <h3 class="text-lg font-bold dark:text-gray-300">Confirm Delete User</h3>
                  <p class="py-4 text-red-600 font-semibold">Are you sure you want to delete the selected user?</p>
                  <div class="modal-action">
                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500" @click="deleteUser">Yes</button>

                    <form method="dialog">
                      <button class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-100">Close</button>
                    </form>
                  </div>
                </div>
              </dialog>
            </tbody>
          </table>
          <div v-if="!users" class="animate-pulse w-full">
            <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
            <div class="h-4 bg-gray-300 mb-6 rounded"></div>
            <div class="h-4 bg-gray-200 mb-6 rounded"></div>
            <div class="h-4 bg-gray-300 mb-6 rounded"></div>
            <div class="h-4 bg-gray-200 mb-6 rounded"></div>
          </div>
        </div>
        <!-- Pagination -->
        <SearchPagination :searchQuery="searchQuery" v-if="searchQuery" />
        <SelectByRolePagination v-else-if="selectedRole" :role="selectedRole" />
        <Pagination v-else />
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