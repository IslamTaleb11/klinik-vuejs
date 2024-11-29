<script setup>
import SideBar from '../../../components/dashboard/SideBar.vue';
import Header from '../../../components/dashboard/Header.vue';
import Breadcrumb from '../../../components/dashboard/Breadcrumb.vue';
import { onMounted, ref, computed, watch } from 'vue';
import { useSideBar } from '../../../stores/sideBar';
import { useFetchDoctors } from '../../../stores/fetchDoctors'
import { useBackendUrl } from '../../../stores/backendUrl';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'vue-sonner';
import { useRoute } from 'vue-router';
import { useFetchUsers } from '../../../stores/fetchUsers';
import DoctorsPagination from '../../../components/dashboard/DoctorsPagination.vue';
import SearchDoctorsPagination from '../../../components/dashboard/SearchDoctorsPagination.vue';

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


</script>


<template>
    <div class=" bg-[#F0F5F9] min-h-screen dark:bg-darkmodebg flex">
        <Toaster richColors position="top-right" />
        <SideBar />
        <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
            <Header />

            <Breadcrumb first="Dashboard" second="Doctors"
                firstIcon='<i class="fa-solid fa-gauge"></i>' secondIcon='<i class="fa-solid fa-user-doctor"></i>' link="/doctor-dashboard" />


            <!-- Table -->
            <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
                <!-- Search and Role Filter -->
                <div class="flex justify-between mb-4 gap-3">
                    <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
                        class="input input-bordered w-full max-w-xs dark:bg-slate-800 dark:text-gray-300" />
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
                                <th class="dark:text-gray-300" @click="sortBy('department_name')">
                                    Department
                                    <span>{{ getSortIcon('department_name') }}</span>
                                </th>

                            </tr>
                        </thead>
                        <tbody>

                            <tr v-if="searchQuery" v-for="doctor in searchedDoctors" :key="doctor.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div class="avatar">
                                            <div class="mask mask-squircle h-12 w-12">
                                                <img v-if="doctor.avatar"
                                                    :src="backendUrl.backendUrl + '/storage/' + doctor.avatar" alt="" />
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
                            </tr>



                            <tr v-else v-for="doc in filteredAndSortedDoctors" :key="doc.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div class="avatar">
                                            <div class="mask mask-squircle h-12 w-12">
                                                <img v-if="doc.avatar"
                                                    :src="backendUrl.backendUrl + '/storage/' + doc.avatar" alt="" />
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
                            </tr>

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