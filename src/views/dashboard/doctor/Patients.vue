<script setup>
import SideBar from '../../../components/dashboard/SideBar.vue';
import Header from '../../../components/dashboard/Header.vue';
import Breadcrumb from '../../../components/dashboard/Breadcrumb.vue';
import { onMounted, ref, computed, watch } from 'vue';
import { useSideBar } from '../../../stores/sideBar';
import { useBackendUrl } from '../../../stores/backendUrl';
import dayjs from 'dayjs';
import axios from 'axios';
import { Toaster, toast } from 'vue-sonner';
import { useFetchPatients } from '../../../stores/fetchPatients';
import PatientsPagination from '../../../components/dashboard/PatientsPagination.vue';
import SearchPatientsPagination from '../../../components/dashboard/SearchPatientsPagination.vue';

const backendUrl = useBackendUrl();
const allPatients = useFetchPatients();
const sideBar = useSideBar();
const patients = computed(() => allPatients.data);

onMounted(() => {
    sideBar.isResourcesExpanded = true;
});

const searchQuery = ref('');
const sortKey = ref('');
const sortOrder = ref(1);

const searchedPatients = computed(() => {
    let filteredPatients = allPatients.searchedPatients || [];
    if (sortKey.value) {
        filteredPatients.sort((a, b) => {
            const aValue = a[sortKey.value] || '';
            const bValue = b[sortKey.value] || '';
            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }

    return filteredPatients;
});

watch(() => searchQuery.value, async () => {
    if (searchQuery.value < 1) {
        await allPatients.fetchPatients();
    }
});

const captureSearchQuery = async () => {
    await allPatients.fetchSearchedPatients(1, searchQuery.value);
    searchedPatients.value = allPatients.searchedPatients;
    return searchedPatients.value;
};

const filteredAndSortedPatients = computed(() => {
    const filteredPatients = patients.value || [];
    if (sortKey.value) {
        filteredPatients.sort((a, b) => {
            const aValue = a[sortKey.value] || '';
            const bValue = b[sortKey.value] || '';

            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }
    return filteredPatients;
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

const appointments = ref([])
const orders = ref([])
const patientToShowDetails = ref(null)
const showPatientDetailsModalFun = async (patient) => {
    patientToShowDetails.value = patient
    const modal = document.getElementById('modal_show_patient_details')
    modal.showModal();
    try {
        await axios.post('/fetch-patient-appointments-and-orders',
            {
                patient_id: patient.id
            }
        ).then((res) => {
            appointments.value = res.data.appointments
            orders.value = res.data.orders
        }).catch((err) => {
            console.log(err);
        });
    } catch (error) {
        console.log(error);
    }
}


</script>



<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen">
        <Toaster richColors position="top-right" />
        <SideBar />
        <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
            <Header />

            <Breadcrumb first="Dashboard" second="Patients" firstIcon='<i class="fa-solid fa-gauge"></i>'
                secondIcon='<i class="fa-solid fa-user-injured"></i>' link="/doctor-dashboard" />

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
                                <th class="dark:text-gray-300">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr v-if="searchQuery" v-for="patient in searchedPatients" :key="patient.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div class="avatar">
                                            <div class="mask mask-squircle h-12 w-12">
                                                <img v-if="patient.avatar"
                                                    :src="backendUrl.backendUrl + '/storage/' + patient.avatar"
                                                    alt="" />
                                                <img v-else src="/src/assets/images/unkown-profile-pic.png" alt="" />
                                            </div>
                                        </div>
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ patient.name }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ patient.email }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ formatDate(patient.created_at) }}
                                </td>
                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500"
                                        @click="showPatientDetailsModalFun(patient)">
                                        <i class="fa-solid fa-file"></i>
                                    </button>
                                </td>
                            </tr>

                            <tr v-else v-for="pat in filteredAndSortedPatients" :key="pat.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div class="avatar">
                                            <div class="mask mask-squircle h-12 w-12">
                                                <img v-if="pat.avatar"
                                                    :src="backendUrl.backendUrl + '/storage/' + pat.avatar" alt="" />
                                                <img v-else src="/src/assets/images/unkown-profile-pic.png" alt="" />
                                            </div>
                                        </div>
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ pat.name }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ pat.email }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ formatDate(pat.created_at) }}
                                </td>
                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500"
                                        @click="showPatientDetailsModalFun(pat)">
                                        <i class="fa-solid fa-file"></i>
                                    </button>
                                </td>
                            </tr>

                            <!-- Patient details modal with tabs -->
                            <dialog id="modal_show_patient_details" class="modal modal-middle">
                                <div class="modal-box dark:bg-slate-700">
                                    <div v-if="patientToShowDetails" role="tablist" class="tabs tabs-lifted">
                                        <!-- General Overview Tab -->
                                        <input type="radio" name="my_tabs_2" role="tab" class="tab dark:text-gray-400"
                                            aria-label="General Overview" checked="checked" />
                                        <div role="tabpanel"
                                            class="tab-content bg-base-100 border-base-300 dark:bg-slate-700 rounded-box p-6 min-h-[400px]">
                                            <h3 class="text-lg font-bold dark:text-gray-300">General Overview</h3>

                                            <div class="flex items-center gap-6 mt-4">
                                                <!-- Patient Avatar -->
                                                <div class="avatar">
                                                    <div class="mask mask-squircle w-24 h-24">
                                                        <img v-if="patientToShowDetails"
                                                            :src="backendUrl.backendUrl + '/storage/' + patientToShowDetails.avatar"
                                                            alt="Patient Avatar" />
                                                        <img v-else src="/src/assets/images/unkown-profile-pic.png"
                                                            alt="Default Avatar" />
                                                    </div>
                                                </div>

                                                <!-- General Details -->
                                                <div>
                                                    <!-- Display Gender -->
                                                    <div class="mb-4">
                                                        <span
                                                            class="label-text font-semibold dark:text-gray-300">Gender:</span>
                                                        <span class="ml-2 dark:text-gray-300">{{
                                                            patientToShowDetails.gender }}</span>
                                                    </div>

                                                    <!-- Display Blood Group -->
                                                    <div class="mb-4">
                                                        <span class="label-text font-semibold dark:text-gray-300">Blood
                                                            Group:</span>
                                                        <span class="ml-2 dark:text-gray-300">{{
                                                            patientToShowDetails.bloodGroup }}</span>
                                                    </div>

                                                    <!-- Display Date of Birth -->
                                                    <div class="mb-4">
                                                        <span class="label-text font-semibold dark:text-gray-300">Date
                                                            of Birth:</span>
                                                        <span class="ml-2 dark:text-gray-300">{{
                                                            patientToShowDetails.birthDate }}</span>
                                                    </div>

                                                    <!-- Display Date of Death -->
                                                    <div class="mb-4">
                                                        <span class="label-text font-semibold dark:text-gray-300">Date
                                                            of Death:</span>
                                                        <span class="ml-2 dark:text-gray-300">{{
                                                            patientToShowDetails.deathDate ?
                                                            patientToShowDetails.deathDate : 'No Data' }}</span>
                                                    </div>

                                                    <!-- Display Additional Notes -->
                                                    <div>
                                                        <span
                                                            class="label-text font-semibold dark:text-gray-300">Notes:</span>
                                                        <span class="ml-2 dark:text-gray-300">{{
                                                            patientToShowDetails.additionalNotes ?
                                                            patientToShowDetails.additionalNotes : 'No Data' }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Appointments Tab -->
                                        <input type="radio" name="my_tabs_2" role="tab" class="tab dark:text-gray-400"
                                            aria-label="Appointments" />
                                        <div role="tabpanel"
                                            class="tab-content bg-base-100 border-base-300 dark:bg-slate-700 rounded-box p-6 min-h-[400px]">
                                            <h3 class="text-lg font-bold dark:text-gray-300">Appointments</h3>
                                            <ul v-if="appointments.length > 0" class="mt-4 space-y-3">
                                                <li v-for="appointment in appointments" :key="appointment.id"
                                                    class="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg shadow">
                                                    <div class="flex justify-between">
                                                        <div>
                                                            <p class="text-lg font-semibold dark:text-gray-300">{{
                                                                appointment.date }} at
                                                                {{ appointment.start_time }} </p>
                                                            <p class="text-sm text-gray-600 dark:text-gray-300">Doctor:
                                                                {{
                                                                    appointment.doctor_name }}</p>
                                                            <p class="text-sm text-gray-600 dark:text-gray-300">Status:
                                                                {{
                                                                    appointment.general_status }}</p>
                                                            <p class="text-sm text-gray-600 dark:text-gray-300">Payment:
                                                                {{
                                                                    appointment.payment_status }}</p>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                            <p v-else class="text-gray-500 dark:text-gray-300">No available appointments
                                            </p>
                                        </div>

                                        <!-- Orders Tab -->
                                        <input type="radio" name="my_tabs_2" role="tab" class="tab dark:text-gray-400"
                                            aria-label="Orders" />
                                        <div role="tabpanel"
                                            class="tab-content bg-base-100 dark:bg-slate-700 border-base-300 rounded-box p-6 min-h-[400px]">
                                            <h3 class="text-lg font-bold dark:text-gray-300">Orders</h3>
                                            <ul v-if="orders.length > 0" class="mt-4 space-y-3">
                                                <li v-for="order in orders" :key="order.id"
                                                    class="p-4 bg-gray-100 rounded-lg shadow">
                                                    <div class="flex justify-between">
                                                        <div>
                                                            <p class="text-lg font-semibold dark:text-gray-300">Order
                                                                ID: {{ order.id }}
                                                            </p>
                                                            <p class="text-sm text-gray-600 dark:text-gray-300">Status:
                                                                {{ order.status }}
                                                            </p>
                                                        </div>
                                                        <div class="text-right">
                                                            <p class="text-sm text-gray-500 dark:text-gray-300">Created
                                                                at: {{
                                                                    order.created_at }}</p>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                            <p v-else class="text-gray-500 dark:text-gray-300">No available orders</p>
                                        </div>
                                    </div>

                                    <!-- Modal actions -->
                                    <div class="modal-action">
                                        <form method="dialog">
                                            <button
                                                class="btn border-none bg-red-600 text-white hover:bg-red-500">Close</button>
                                        </form>
                                    </div>
                                </div>
                            </dialog>




                        </tbody>
                    </table>
                    <div v-if="!patients" class="animate-pulse w-full">
                        <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                    </div>
                </div>
                <!-- Pagination -->
                <SearchPatientsPagination :searchQuery="searchQuery" v-if="searchQuery" />
                <PatientsPagination v-else />
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