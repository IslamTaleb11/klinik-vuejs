<script setup>
import SideBar from '../../components/dashboard/SideBar.vue';
import Header from '../../components/dashboard/Header.vue';
import Breadcrumb from '../../components/dashboard/Breadcrumb.vue';
import { ref, computed, watch } from 'vue';
import AppointmentsPagination from '../../components/dashboard/AppointmentsPagination.vue';
import { useFetchAppointments } from '../../stores/fetchAppointments';
import dayjs from 'dayjs';
import SearchAppointmentsPagination from '../../components/dashboard/SearchAppointmentsPagination.vue';
import SelectAppointmentsByStatusPagination from '../../components/dashboard/SelectAppointmentsByStatusPagination.vue'; // Adjusted component name
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'vue-sonner';

const allAppointments = useFetchAppointments();
const appointments = computed(() => allAppointments.data);
const countAllAppointments = computed(() => allAppointments.countAllAppointments);
const countAllPending = computed(() => allAppointments.countAllPending);
const countAllCompleted = computed(() => allAppointments.countAllCompleted);
const countAllScheduled = computed(() => allAppointments.countAllScheduled);
const countAllCanceled = computed(() => allAppointments.countAllCanceled);


watch(() => allAppointments.currentPage, () => {
    appointments.value = allAppointments.data;
});


const searchQuery = ref('');
const selectedStatus = ref('');
const sortKey = ref('');
const sortOrder = ref(1);

const searchedAppointments = computed(() => {
    let filteredAppointments = allAppointments.searchedAppointments || [];

    if (sortKey.value) {
        filteredAppointments.sort((a, b) => {
            const aValue = a[sortKey.value] || ''; // Default to empty string if null or undefined
            const bValue = b[sortKey.value] || ''; // Default to empty string if null or undefined

            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }

    return filteredAppointments;
});

const selectedByStatusAppointments = computed(() => {
    let filteredAppointments = allAppointments.selectedAppointmentsByStatus || [];

    if (sortKey.value) {
        filteredAppointments.sort((a, b) => {
            const aValue = a[sortKey.value] || ''; // Default to empty string if null or undefined
            const bValue = b[sortKey.value] || ''; // Default to empty string if null or undefined

            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }

    return filteredAppointments;
});

watch(() => searchQuery.value, async () => {
    if (searchQuery.value < 1) {
        await allAppointments.fetchAppointments();
    }
});

const captureSearchQuery = async () => {
    if (selectedStatus.value) {
        selectedStatus.value = '';
    }
    await allAppointments.fetchSearchedAppointments(1, searchQuery.value);
    searchedAppointments.value = allAppointments.searchedAppointments;
    return searchedAppointments.value;
};

const filteredAndSortedAppointments = computed(() => {
    const filteredAppointments = appointments.value || [];

    if (sortKey.value) {
        filteredAppointments.sort((a, b) => {
            const aValue = a[sortKey.value] || ''; // Default to empty string if null or undefined
            const bValue = b[sortKey.value] || ''; // Default to empty string if null or undefined

            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }

    return filteredAppointments;
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


const uniqueStatuses = ['Paid', 'Unpaid'];

const appointmentsByStatus = () => {
    if (searchQuery.value) {
        searchQuery.value = '';
    }
    switch (selectedStatus.value) {
        case 'Paid':
            allAppointments.fetchAppointmentsByStatus('paid');
            break;
        case 'Unpaid':
            allAppointments.fetchAppointmentsByStatus('unpaid');
            break;
        case 'Completed':
            allAppointments.fetchAppointmentsByStatus('Completed');
            break;
        case 'Scheduled':
            allAppointments.fetchAppointmentsByStatus('Scheduled');
            break;
        case 'Canceled':
            allAppointments.fetchAppointmentsByStatus('Canceled');
            break;

        default:
            break;
    }
};

async function exportToExcel() {
    const appointments = ref([]);
    try {
        await axios.get('/fetch-all-appointments').then((res) => {
            appointments.value = res.data.appointments;
        }).catch((err) => {
            console.log(err);
        });
    } catch (error) {
        console.log(error);
    }
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the array of objects to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(appointments.value);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'appointments.xlsx');
}

const updateDeletedAppointmentLocally = (appointmentId) => {
    const appointmentIndexInDefaultArray = filteredAndSortedAppointments.value.findIndex(appointment => appointment.id === appointmentId);
    const appointmentIndexInSelectedByStatusAppointments = selectedByStatusAppointments.value.findIndex(appointment => appointment.id === appointmentId);
    const appointmentIndexInSearchedAppointments = searchedAppointments.value.findIndex(appointment => appointment.id === appointmentId);

    if (appointmentIndexInDefaultArray !== -1) {
        filteredAndSortedAppointments.value.splice(appointmentIndexInDefaultArray, 1);
    }
    if (appointmentIndexInSelectedByStatusAppointments !== -1) {
        selectedByStatusAppointments.value.splice(appointmentIndexInSelectedByStatusAppointments, 1);
    }
    if (appointmentIndexInSearchedAppointments !== -1) {
        searchedAppointments.value.splice(appointmentIndexInSearchedAppointments, 1);
    }
};

const appointmentToDelete = ref(null);
const deleteAppointmentConfirmation = (appointment) => {
    appointmentToDelete.value = appointment;
    const modal = document.getElementById('modal_delete_appointment_confirmation');
    modal.showModal();
};

const showDeleteConfirmationModal = ref(true);
const deleteAppointment = async () => {
    try {
        const res = await axios.post('/delete-appointment', {
            appointmentId: appointmentToDelete.value.id
        });

        showDeleteConfirmationModal.value = false;
        toast.success('Success', {
            description: res.data.message,
            duration: 5000,
        });
        updateDeletedAppointmentLocally(appointmentToDelete.value.id);
        await new Promise(resolve => setTimeout(resolve, 500));
        showDeleteConfirmationModal.value = true;
        allAppointments.fetchAppointmentsCount();
        allAppointments.fetchAppointmentsCount()
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

const showEditAppointmentModal = ref(true);
const editableAppointmentId = ref(null);
const appointmentForEdit = ref(null);
const editAppointmentPaymentStatus = ref('');
const editAppointmentGeneralStatus = ref('')
const showEditAppointmentModalFun = (appointment) => {
    const modal = document.getElementById('my_edit_modal');
    editableAppointmentId.value = appointment.id;
    appointmentForEdit.value = appointment;
    editAppointmentPaymentStatus.value = appointment.payment_status;
    editAppointmentGeneralStatus.value = appointment.general_status
    modal.showModal();
};

const editAppointment = async () => {
    const button = document.getElementById('editAppointment-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/update-appointment', {
            appointmentId: editableAppointmentId.value,
            paymentStatus: editAppointmentPaymentStatus.value,
            generalStatus: editAppointmentGeneralStatus.value
        }).then(async (res) => {
            toast.success(res.data.message);
            showEditAppointmentModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showEditAppointmentModal.value = true;
            updateAppointmentDetailsLocally(
                editableAppointmentId.value,
                editAppointmentPaymentStatus.value,
                editAppointmentGeneralStatus.value
            );
            allAppointments.fetchAppointmentsCount();
        }).catch(async (error) => {
            console.log(error);
            toast.error(error.response.data.error);
            showEditAppointmentModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showEditAppointmentModal.value = true;
        });
    } catch (error) {
        console.log(error);
        toast.error(error.response.data.error);
        showEditAppointmentModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showEditAppointmentModal.value = true;
    }
    button.innerHTML = 'Update Appointment';
};

const updateAppointmentDetailsLocally = (appointmentId, paymentStatus, generalStatus) => {
    const appointmentIndexInDefaultArray = filteredAndSortedAppointments.value.find(appointment => appointment.id === appointmentId);
    const appointmentIndexInSearchedAppointments = searchedAppointments.value.find(appointment => appointment.id === appointmentId);
    const appointmentIndexInSelectedByStatus = selectedByStatusAppointments.value.find(appointment => appointment.id === appointmentId);

    if (appointmentIndexInDefaultArray) {
        appointmentIndexInDefaultArray.payment_status = paymentStatus;
        appointmentIndexInDefaultArray.general_status = generalStatus;
    }

    if (appointmentIndexInSearchedAppointments) {
        appointmentIndexInSearchedAppointments.payment_status = paymentStatus;
        appointmentIndexInSearchedAppointments.payment_status = generalStatus;
    }

    if (appointmentIndexInSelectedByStatus) {
        appointmentIndexInSelectedByStatus.payment_status = paymentStatus;
        appointmentIndexInSelectedByStatus.payment_status = generalStatus;
    }
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
</script>




<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen overflow-x-auto">
        <Toaster richColors position="top-right" />
        <SideBar />
        <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
            <Header />

            <Breadcrumb first="Dashboard" second="Appointments" firstIcon='<i class="fa-solid fa-gauge"></i>'
                secondIcon='<i class="fa-solid fa-list"></i>' link="/admin-dashboard" />

            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-[80%] mt-5 max-[1025px]:w-[90%]">
                <!-- All Appointments Card -->
                <div class="bg-blue-500 text-white p-5 rounded-lg flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-calendar-check text-4xl"></i>
                        <div>
                            <p class="text-lg font-bold">Total Appointments</p>
                            <p class="text-2xl">{{ countAllAppointments }}</p>
                        </div>
                    </div>
                </div>
                <!-- Total Completed Appointments Card -->
                <div class="bg-green-500 text-white p-5 rounded-lg flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-check-circle text-4xl"></i>
                        <div>
                            <p class="text-lg font-bold">Completed Appointments</p>
                            <p class="text-2xl">{{ countAllCompleted }}</p>
                        </div>
                    </div>
                </div>
                <!-- Total Pending Appointments Card -->
                <div class="bg-yellow-500 text-white p-5 rounded-lg flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-hourglass-half text-4xl"></i>
                        <div>
                            <p class="text-lg font-bold">Pending Appointments</p>
                            <p class="text-2xl">{{ countAllPending }}</p>
                        </div>
                    </div>
                </div>
                <!-- Total Scheduled Appointments Card -->
                <div class="bg-cyan-500 text-white p-5 rounded-lg flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-calendar-day text-4xl"></i>
                        <div>
                            <p class="text-lg font-bold">Scheduled Appointments</p>
                            <p class="text-2xl">{{ countAllScheduled }}</p>
                        </div>
                    </div>
                </div>
                <!-- Total Canceled Appointments Card -->
                <div class="bg-red-500 text-white p-5 rounded-lg flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-calendar-times text-4xl"></i>
                        <div>
                            <p class="text-lg font-bold">Canceled Appointments</p>
                            <p class="text-2xl">{{ countAllCanceled }}</p>
                        </div>
                    </div>
                </div>
            </div>


            <!-- Table -->
            <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
                <!-- Search and Status Filter -->
                <div class="flex justify-between mb-4 gap-3 flex-col sm:flex-row">
                    <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
                        class="input input-bordered w-full dark:bg-slate-800 dark:text-gray-300" />
                    <select v-model="selectedStatus" @change="appointmentsByStatus"
                        class="select select-bordered w-full dark:bg-slate-800 dark:text-gray-300">
                        <option value="">All Statuses</option>
                        <option v-for="status in uniqueStatuses" :key="status" :value="status">
                            {{ capitalizeFirstLetter(status) }}
                        </option>
                        <option v-for="generalStatus in ['Canceled', 'Scheduled', 'Completed']" :key="generalStatus"
                            :value="generalStatus">
                            {{ capitalizeFirstLetter(generalStatus) }}
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
                                <th @click="sortBy('patient_name')" class="cursor-pointer dark:text-gray-300">
                                    Patient Name
                                    <span>{{ getSortIcon('patient_name') }}</span>
                                </th>
                                <th @click="sortBy('patient_email')" class="cursor-pointer dark:text-gray-300">
                                    Patient Email
                                    <span>{{ getSortIcon('patient_email') }}</span>
                                </th>
                                <th @click="sortBy('doctor_name')" class="cursor-pointer dark:text-gray-300">
                                    Doctor Name
                                    <span>{{ getSortIcon('doctor_name') }}</span>
                                </th>
                                <th @click="sortBy('doctor_email')" class="cursor-pointer dark:text-gray-300">
                                    Doctor Email
                                    <span>{{ getSortIcon('doctor_email') }}</span>
                                </th>
                                <th @click="sortBy('date')" class="cursor-pointer dark:text-gray-300">
                                    Appointment Date
                                    <span>{{ getSortIcon('date') }}</span>
                                </th>
                                <th @click="sortBy('day')" class="cursor-pointer dark:text-gray-300">
                                    Appointment Day
                                    <span>{{ getSortIcon('day') }}</span>
                                </th>
                                <th @click="sortBy('start_time')" class="cursor-pointer dark:text-gray-300">
                                    Start Time
                                    <span>{{ getSortIcon('start_time') }}</span>
                                </th>
                                <th @click="sortBy('end_time')" class="cursor-pointer dark:text-gray-300">
                                    End Time
                                    <span>{{ getSortIcon('end_time') }}</span>
                                </th>
                                <th @click="sortBy('payment_status')" class="cursor-pointer dark:text-gray-300">
                                    Payment Status
                                    <span>{{ getSortIcon('payment_status') }}</span>
                                </th>
                                <th @click="sortBy('general_status')" class="cursor-pointer dark:text-gray-300">
                                    General Status
                                    <span>{{ getSortIcon('general_status') }}</span>
                                </th>
                                <th class="dark:text-gray-300">
                                    Order ID
                                </th>
                                <th class="dark:text-gray-300">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="searchQuery" v-for="appointment in searchedAppointments" :key="appointment.id">
                                <td class="dark:text-gray-300">{{ appointment.patient_name }}</td>
                                <td class="dark:text-gray-300">{{ appointment.patient_email }}</td>
                                <td class="dark:text-gray-300">{{ appointment.doctor_name }}</td>
                                <td class="dark:text-gray-300">{{ appointment.doctor_email }}</td>
                                <td class="dark:text-gray-300">{{ appointment.date }}</td>
                                <td class="dark:text-gray-300">{{ appointment.day }}</td>
                                <td class="dark:text-gray-300">{{ appointment.start_time }}</td>
                                <td class="dark:text-gray-300">{{ appointment.end_time }}</td>
                                <td :class="{
                                    'text-green-500': appointment.payment_status === 'paid',
                                    'text-red-600': appointment.payment_status !== 'paid'
                                }">
                                    {{ appointment.payment_status }}
                                </td>
                                <td :class="{
                                    'text-green-500': appointment.general_status === 'completed' || appointment.general_status === 'scheduled',
                                    'text-yellow-500': appointment.general_status === 'pending',
                                    'text-red-600': appointment.general_status === 'canceled'
                                }">

                                    {{ appointment.general_status }}
                                </td>
                                <td class="dark:text-gray-300">{{ appointment.order_id }}</td>

                                <td class="flex gap-1">
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditAppointmentModalFun(appointment)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteAppointmentConfirmation(appointment)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <tr v-else-if="selectedStatus" v-for="appointmentByStatus in selectedByStatusAppointments"
                                :key="appointmentByStatus.id">
                                <td class="dark:text-gray-300">{{ appointmentByStatus.patient_name }}</td>
                                <td class="dark:text-gray-300">{{ appointmentByStatus.patient_email }}</td>
                                <td class="dark:text-gray-300">{{ appointmentByStatus.doctor_name }}</td>
                                <td class="dark:text-gray-300">{{ appointmentByStatus.doctor_email }}</td>
                                <td class="dark:text-gray-300">{{ appointmentByStatus.date }}</td>
                                <td class="dark:text-gray-300">{{ appointmentByStatus.day }}</td>
                                <td class="dark:text-gray-300">{{ appointmentByStatus.start_time }}</td>
                                <td class="dark:text-gray-300">{{ appointmentByStatus.end_time }}</td>
                                <td :class="{
                                    'text-green-500': appointmentByStatus.payment_status === 'paid',
                                    'text-red-600': appointmentByStatus.payment_status !== 'paid'
                                }">
                                    {{ appointmentByStatus.payment_status }}
                                </td>
                                <td :class="{
                                    'text-green-500': appointmentByStatus.general_status === 'completed' || appointmentByStatus.general_status === 'scheduled',
                                    'text-yellow-500': appointmentByStatus.general_status === 'pending',
                                    'text-red-600': appointmentByStatus.general_status === 'canceled'
                                }">
                                    {{ appointmentByStatus.general_status }}
                                </td>
                                <td class="dark:text-gray-300">{{ appointmentByStatus.order_id }}</td>

                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditAppointmentModalFun(appointmentByStatus)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteAppointmentConfirmation(appointmentByStatus)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <tr v-else v-for="app in filteredAndSortedAppointments" :key="app.id">
                                <td class="dark:text-gray-300">{{ app.patient_name }}</td>
                                <td class="dark:text-gray-300">{{ app.patient_email }}</td>
                                <td class="dark:text-gray-300">{{ app.doctor_name }}</td>
                                <td class="dark:text-gray-300">{{ app.doctor_email }}</td>
                                <td class="dark:text-gray-300">{{ app.date }}</td>
                                <td class="dark:text-gray-300">{{ app.day }}</td>
                                <td class="dark:text-gray-300">{{ app.start_time }}</td>
                                <td class="dark:text-gray-300">{{ app.end_time }}</td>
                                <td :class="{
                                    'text-green-500': app.payment_status === 'paid',
                                    'text-red-600': app.payment_status !== 'paid'
                                }">
                                    {{ app.payment_status }}
                                </td>
                                <td :class="{
                                    'text-green-500': app.general_status === 'completed' || app.general_status === 'scheduled',
                                    'text-yellow-500': app.general_status === 'pending',
                                    'text-red-600': app.general_status === 'canceled'
                                }">
                                    {{ app.general_status }}
                                </td>
                                <td class="dark:text-gray-300">{{ app.order_id }}</td>

                                <td class="flex gap-1">
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditAppointmentModalFun(app)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteAppointmentConfirmation(app)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <!-- Modal -->
                            <dialog v-if="showDeleteConfirmationModal" id="modal_delete_appointment_confirmation"
                                class="modal modal-bottom sm:modal-middle">
                                <div class="modal-box dark:bg-slate-700">
                                    <h3 class="text-lg font-bold dark:text-gray-300">Confirm Delete Appointment</h3>
                                    <p class="py-4 text-red-600 font-semibold">Are you sure you want to delete the
                                        selected appointment?</p>
                                    <div class="modal-action">
                                        <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                            @click="deleteAppointment">Yes</button>
                                        <form method="dialog">
                                            <button
                                                class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-1000">Close</button>
                                        </form>
                                    </div>
                                </div>
                            </dialog>
                        </tbody>
                    </table>
                    <div v-if="!appointments" class="animate-pulse w-full">
                        <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                    </div>
                </div>



                <!-- Edit Appointment Modal -->
                <dialog v-if="showEditAppointmentModal" id="my_edit_modal" class="modal">
                    <div class="modal-box dark:bg-slate-700">
                        <div class="py-4 flex flex-col gap-3">
                            <h3 class="text-lg font-bold dark:text-gray-300">Appointment Details</h3>
                            <!-- Appointment Payment Status Select -->
                            <label class="form-control w-full max-w-xs">
                                <span class="label-text dark:text-gray-300">Appointment Status</span>
                                <select v-model="editAppointmentPaymentStatus"
                                    class="select select-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300">
                                    <option :value="editAppointmentPaymentStatus" selected>{{
                                        capitalizeFirstLetter(editAppointmentPaymentStatus) }}</option>
                                    <option value="paid" v-if="editAppointmentPaymentStatus === 'unpaid'">Paid</option>
                                    <option value="unpaid" v-else>Unpaid</option>
                                </select>
                            </label>

                            <!-- Appointment General Status Select -->
                            <label class="form-control w-full max-w-xs">
                                <span class="label-text dark:text-gray-300">Appointment General Status</span>
                                <select v-model="editAppointmentGeneralStatus"
                                    class="select select-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300">
                                    <option :value="editAppointmentGeneralStatus" selected>{{
                                        capitalizeFirstLetter(editAppointmentGeneralStatus) }}</option>
                                    <option v-for="status in ['pending', 'completed', 'canceled']" :key="status"
                                        :value="status" :disabled="status === editAppointmentGeneralStatus">
                                        {{ capitalizeFirstLetter(status) }}
                                    </option>


                                </select>


                            </label>
                            <div class="modal-action">
                                <button @click="editAppointment" id="editAppointment-button"
                                    class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-44 h-12">
                                    Edit Appointment
                                </button>
                            </div>
                        </div>
                    </div>

                    <form method="dialog" class="modal-backdrop">
                        <button @click="closeEditModal">Close</button>
                    </form>
                </dialog>

                <!-- Pagination -->
                <SearchAppointmentsPagination :searchQuery="searchQuery" v-if="searchQuery" />
                <SelectAppointmentsByStatusPagination v-else-if="selectedStatus" :status="selectedStatus" />
                <AppointmentsPagination v-else />
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