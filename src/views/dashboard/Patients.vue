<script setup>
import SideBar from '../../components/dashboard/SideBar.vue';
import Header from '../../components/dashboard/Header.vue';
import Breadcrumb from '../../components/dashboard/Breadcrumb.vue';
import { onMounted, ref, computed, watch } from 'vue';
import { useSideBar } from '../../stores/sideBar';
import { useBackendUrl } from '../../stores/backendUrl';
import dayjs from 'dayjs';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'vue-sonner';
import { useFetchPatients } from '../../stores/fetchPatients';
import PatientsPagination from '../../components/dashboard/PatientsPagination.vue';
import SearchPatientsPagination from '../../components/dashboard/SearchPatientsPagination.vue';

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

async function exportToExcel() {
    const patients = ref([]);
    try {
        await axios.get('/fetch-all-patients').then((res) => {
            patients.value = res.data.patients;
        }).catch((err) => {
            console.log(err);
        });
    } catch (error) {
        console.log(error);
    }
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the array of objects to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(patients.value);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'patients.xlsx');
}

const showAddPatientModalFun = () => {
    const modal = document.getElementById('my_modal_2');
    modal.showModal();
};

const showAddPatientModal = ref(true);

const updateDeletedPatientLocally = (patientId) => {
    const patientIndexInDefaultArray = filteredAndSortedPatients.value.findIndex(patient => patient.id === patientId);
    const patientIndexInSearchedPatients = searchedPatients.value.findIndex(patient => patient.id === patientId);

    if (patientIndexInDefaultArray !== -1) {
        filteredAndSortedPatients.value.splice(patientIndexInDefaultArray, 1);
    }
    if (patientIndexInSearchedPatients !== -1) {
        searchedPatients.value.splice(patientIndexInSearchedPatients, 1);
    }
};

const patientToDelete = ref(null);
const deletePatientConfirmation = (patient) => {
    patientToDelete.value = patient;
    const modal = document.getElementById('modal_delete_patient_confirmation');
    modal.showModal();
};
const showDeleteConfirmationModal = ref(true);
const deletePatient = async () => {
    try {
        const res = await axios.post('/delete-patient', {
            patient_id: patientToDelete.value.id
        });
        showDeleteConfirmationModal.value = false;
        toast.success('Success', {
            description: res.data.message,
            duration: 5000,
        });
        updateDeletedPatientLocally(patientToDelete.value.id);
        await new Promise(resolve => setTimeout(resolve, 500));
        showDeleteConfirmationModal.value = true;
    } catch (error) {
        showDeleteConfirmationModal.value = false;
        toast.error('Error', {
            description: 'error',
            duration: 5000,
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        showDeleteConfirmationModal.value = true;
        console.log(error);
    }
};

const email = ref('')
const gender = ref('')
const bloodGroup = ref('')
const birthDate = ref('')
const deathDate = ref('')
const additionalNotes = ref('')



const addPatient = async () => {
    const button = document.getElementById('addDepartment-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/add-patient', {
            email: email.value,
            gender: gender.value,
            bloodGroup: bloodGroup.value,
            birthDate: birthDate.value,
            deathDate: deathDate.value,
            addPatient: addPatient.value,
            additionalNotes: additionalNotes.value
        }).then(async (res) => {
            toast.success(res.data.message);
            showAddPatientModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddPatientModal.value = true;
            const objectToAdd = {
                id: res.data.newPatient.id,
                name: res.data.newPatient.name,
                email: res.data.newPatient.email,
                avatar: res.data.newPatient.avatar,
                created_at: res.data.newPatient.created_at,
            };
            patients.value.push(objectToAdd);
            if (searchedPatients.value) {
                searchedPatients.value.push(objectToAdd);
            }
        }).catch(async (error) => {
            toast.error(error.response.data.error);
            showAddPatientModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddPatientModal.value = true;
        });
    } catch (error) {
        toast.error(error);
        showAddPatientModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showAddPatientModal.value = true;
    }
    button.innerHTML = 'Add Patient';
};

const patientToShowDetails = ref(null)

const appointments = ref([])
const orders = ref([])
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

            <Breadcrumb first="Dashboard" second="Resources" third="Patients"
                firstIcon='<i class="fa-solid fa-gauge"></i>' secondIcon='<i class="fa-solid fa-people-group"></i>'
                thirdIcon='<i class="fa-solid fa-user-injured"></i>' link="/admin-dashboard" />

            <!-- Table -->
            <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
                <!-- Search and Role Filter -->
                <div class="flex justify-between mb-4 gap-3 flex-col sm:flex-row">
                    <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
                        class="input input-bordered w-full dark:bg-slate-800 dark:text-gray-300" />
                    <button @click="showAddPatientModalFun()"
                        class="bg-primarycolor text-white rounded-lg p-4 text-sm hover:bg-blue-500 font-semibold w-full">Add
                        Patient</button>
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
                                <td class="flex gap-2">
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deletePatientConfirmation(patient)">
                                        <i class="fas fa-trash"></i>
                                    </button>
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
                                <td class="flex gap-2">
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deletePatientConfirmation(pat)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500"
                                        @click="showPatientDetailsModalFun(pat)">
                                        <i class="fa-solid fa-file"></i>
                                    </button>
                                </td>
                            </tr>

                            <!-- Add Patient Modal -->
                            <dialog v-if="showAddPatientModal" id="my_modal_2" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Patient Details</h3>

                                        <!-- Email -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Email</span>
                                            <input type="text" placeholder="Enter Email" v-model="email"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Gender -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Gender</span>
                                            <select v-model="gender"
                                                class="select select-bordered w-full max-w-xs mt-2 dark:text-gray-300 dark:bg-slate-800">
                                                <option value="" disabled>Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </label>

                                        <!-- Blood Group -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Blood Group</span>
                                            <select v-model="bloodGroup"
                                                class="select select-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300">
                                                <option value="" disabled>Select Blood Group</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                            </select>
                                        </label>

                                        <!-- Birth Date -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Birth Date</span>
                                            <input type="date" v-model="birthDate"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Death Date -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Death Date</span>
                                            <input type="date" v-model="deathDate"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Additional Notes -->
                                        <label class="form-control w-full">
                                            <span class="label-text dark:text-gray-300">Additional Notes</span>
                                            <textarea v-model="additionalNotes" placeholder="Enter additional notes"
                                                class="textarea textarea-bordered w-full mt-2 dark:bg-slate-800 dark:text-gray-300"></textarea>
                                        </label>

                                    </div>
                                    <div class="modal-action">
                                        <button @click="addPatient" id="addDepartment-button"
                                            class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-12">Add
                                            Patient</button>
                                    </div>
                                </div>
                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeModal">close</button>
                                </form>
                            </dialog>

                            <!-- Patient details modal with tabs -->
                            <dialog id="modal_show_patient_details" class="modal modal-middle">
                                <div class="modal-box dark:bg-slate-700">
                                    <div v-if="patientToShowDetails" role="tablist" class="tabs tabs-lifted">
                                        <!-- General Overview Tab -->
                                        <input type="radio" name="my_tabs_2" role="tab"
                                            class="tab dark:text-gray-400"
                                            aria-label="General Overview" checked="checked" />
                                        <div role="tabpanel"
                                            class="tab-content bg-base-100 dark:bg-slate-700 border-base-300 rounded-box p-6 min-h-[400px]">
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
                                        <input type="radio" name="my_tabs_2" role="tab"
                                            class="tab dark:text-gray-400"
                                            aria-label="Appointments" />
                                        <div role="tabpanel"
                                            class="tab-content bg-base-100 dark:bg-slate-700 border-base-300 rounded-box p-6 min-h-[400px]">
                                            <h3 class="text-lg font-bold dark:text-gray-300">Appointments</h3>
                                            <ul v-if="appointments.length > 0" class="mt-4 space-y-3">
                                                <li v-for="appointment in appointments" :key="appointment.id"
                                                    class="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg shadow">
                                                    <div class="flex justify-between">
                                                        <div>
                                                            <p class="text-lg font-semibold dark:text-gray-300">{{
                                                                appointment.date }} at
                                                                {{ appointment.start_time }} </p>
                                                            <p class="text-sm text-gray-600 dark:text-gray-400">Doctor:
                                                                {{
                                                                appointment.doctor_name }}</p>
                                                            <p class="text-sm text-gray-600 dark:text-gray-400">Status:
                                                                {{
                                                                appointment.general_status }}</p>
                                                            <p class="text-sm text-gray-600 dark:text-gray-400">Payment:
                                                                {{
                                                                appointment.payment_status }}</p>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                            <p v-else class="text-gray-500 dark:text-gray-400">No available appointments
                                            </p>
                                        </div>

                                        <!-- Orders Tab -->
                                        <input type="radio" name="my_tabs_2" role="tab"
                                            class="tab dark:text-gray-400" aria-label="Orders" />
                                        <div role="tabpanel"
                                            class="tab-content bg-base-100 dark:bg-slate-700 border-base-300 rounded-box p-6 min-h-[400px]">
                                            <h3 class="text-lg font-bold dark:text-gray-300">Orders</h3>
                                            <ul v-if="orders.length > 0" class="mt-4 space-y-3">
                                                <li v-for="order in orders" :key="order.id"
                                                    class="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg shadow">
                                                    <div class="flex justify-between">
                                                        <div>
                                                            <p class="text-lg font-semibold dark:text-gray-300">Order
                                                                ID: {{ order.id }}
                                                            </p>
                                                            <p class="text-sm text-gray-600 dark:text-gray-400">Status:
                                                                {{ order.status }}
                                                            </p>
                                                        </div>
                                                        <div class="text-right">
                                                            <p class="text-sm text-gray-500 dark:text-gray-400">Created
                                                                at: {{
                                                                order.created_at }}</p>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                            <p v-else class="text-gray-500 dark:text-gray-400">No available orders</p>
                                        </div>
                                    </div>

                                    <!-- Modal actions -->
                                    <div class="modal-action">
                                        <form method="dialog">
                                            <button class="btn border-none bg-red-600 text-white hover:bg-red-500">Close</button>
                                        </form>
                                    </div>
                                </div>
                            </dialog>





                            <!-- Modal Delete Patient Confirmation -->
                            <dialog v-if="showDeleteConfirmationModal" id="modal_delete_patient_confirmation"
                                class="modal modal-bottom sm:modal-middle">
                                <div class="modal-box dark:bg-slate-700">
                                    <h3 class="text-lg font-bold dark:text-gray-300">Confirm Delete Patient</h3>
                                    <p class="py-4 text-red-600 font-semibold">Are you sure you want to delete the
                                        selected patient?</p>
                                    <div class="modal-action">
                                        <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                            @click="deletePatient">Yes</button>

                                        <form method="dialog">
                                            <button
                                                class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-100">Close</button>
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