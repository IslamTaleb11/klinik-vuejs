<script setup>
import SideBar from '../../../components/dashboard/SideBar.vue';
import Header from '../../../components/dashboard/Header.vue';
import Breadcrumb from '../../../components/dashboard/Breadcrumb.vue';
import { onMounted, ref, computed, watch } from 'vue';
import { useSideBar } from '../../../stores/sideBar';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'vue-sonner';
import { useFetchDeathReports } from '../../../stores/fetchDeathReports.js';
import SearchDeathReportsPagination from '../../../components/dashboard/SearchDeathReportsPagination.vue';
import DeathReportsPagination from '../../../components/dashboard/DeathReportsPagination.vue';

const allDeathReports = useFetchDeathReports();
const sideBar = useSideBar();
const deathReports = computed(() => allDeathReports.data);

onMounted(() => {
    sideBar.isMonitorExpanded = true;
});

const searchQuery = ref('');
const sortKey = ref('');
const sortOrder = ref(1);

const searchedDeathReports = computed(() => {
    let filteredDeathReports = allDeathReports.searchedDeathReports || [];
    if (sortKey.value) {
        filteredDeathReports.sort((a, b) => {
            const aValue = a[sortKey.value] || '';
            const bValue = b[sortKey.value] || '';
            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }

    return filteredDeathReports;
});

watch(() => searchQuery.value, async () => {
    if (searchQuery.value < 1) {
        await allDeathReports.fetchDeathReports();
    }
});

const captureSearchQuery = async () => {
    await allDeathReports.fetchSearchedDeathReports(1, searchQuery.value);
    searchedDeathReports.value = allDeathReports.searchedDeathReports;
    return searchedDeathReports.value;
};

const filteredAndSortedDeathReports = computed(() => {
    const filteredDeathReports = deathReports.value || [];
    if (sortKey.value) {
        filteredDeathReports.sort((a, b) => {
            const aValue = a[sortKey.value] || '';
            const bValue = b[sortKey.value] || '';

            let result;
            // Check if values are numbers, then compare as numbers
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                result = aValue - bValue;
            } else {
                // Compare as strings if values are not numbers
                result = String(aValue).localeCompare(String(bValue));
            }

            return result * sortOrder.value;
        });
    }
    return filteredDeathReports;
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

async function exportToExcel() {
    const deathReports = ref([]);
    try {
        await axios.get('/fetch-all-death-reports').then((res) => {
            deathReports.value = res.data.deathReports;
        }).catch((err) => {
            console.log(err);
        });
    } catch (error) {
        console.log(error);
    }
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the array of objects to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(deathReports.value);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DeathReports');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'deathReports.xlsx');
}

const showAddDeathReportModalFun = () => {
    const modal = document.getElementById('my_modal_2');
    modal.showModal();
};

const showAddDeathReportModal = ref(true);

const updateDeletedDeathReportLocally = (deathReportId) => {
    const deathReportIndexInDefaultArray = filteredAndSortedDeathReports.value.findIndex(deathReport => deathReport.id === deathReportId);
    const deathReportIndexInSearchedDeathReports = searchedDeathReports.value.findIndex(deathReport => deathReport.id === deathReportId);

    if (deathReportIndexInDefaultArray !== -1) {
        filteredAndSortedDeathReports.value.splice(deathReportIndexInDefaultArray, 1);
    }
    if (deathReportIndexInSearchedDeathReports !== -1) {
        searchedDeathReports.value.splice(deathReportIndexInSearchedDeathReports, 1);
    }
};

const deathReportToDelete = ref(null);
const deleteDeathReportConfirmation = (deathReport) => {
    deathReportToDelete.value = deathReport;
    const modal = document.getElementById('modal_delete_deathReport_confirmation');
    modal.showModal();
};
const showDeleteConfirmationModal = ref(true);
const deleteDeathReport = async () => {
    try {
        const res = await axios.post('/delete-death-report', {
            deathReportId: deathReportToDelete.value.id
        });
        showDeleteConfirmationModal.value = false;
        toast.success('Success', {
            description: res.data.message,
            duration: 5000,
        });
        updateDeletedDeathReportLocally(deathReportToDelete.value.id);
        await new Promise(resolve => setTimeout(resolve, 500));
        showDeleteConfirmationModal.value = true;
    } catch (error) {
        showDeleteConfirmationModal.value = false;
        toast.error(error.response.data.message)
        await new Promise(resolve => setTimeout(resolve, 500));
        showDeleteConfirmationModal.value = true;
        console.log(error);
    }
};

const deathDetails = ref('');
const deathDate = ref('');
const patientEmail = ref('');
const doctorEmail = ref('');
const departmentId = ref('');

const addDeathReport = async () => {
    const button = document.getElementById('addDepartment-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/add-death-report', {
            deathDetails: deathDetails.value,
            deathDate: deathDate.value,
            patientEmail: patientEmail.value,
            doctorEmail: doctorEmail.value,
            departmentId: departmentId.value,
        }).then(async (res) => {
            toast.success(res.data.message);
            showAddDeathReportModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddDeathReportModal.value = true;
            const objectToAdd = {
                id: res.data.newDeathReport.id,
                doctor_email: res.data.newDeathReport.doctor_email,
                doctor_name: res.data.newDeathReport.doctor_name,
                patient_name: res.data.newDeathReport.patient_name,
                patient_email: res.data.newDeathReport.patient_email,
                date: res.data.newDeathReport.date,
                details: res.data.newDeathReport.details,
            };
            deathReports.value.push(objectToAdd);
            if (searchedDeathReports.value) {
                searchedDeathReports.value.push(objectToAdd);
            }
        }).catch(async (error) => {
            toast.error(error.response.data.error);
            showAddDeathReportModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddDeathReportModal.value = true;
        });
    } catch (error) {
        console.log(error);
        toast.error(error);
        showAddDeathReportModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showAddDeathReportModal.value = true;
    }
    button.innerHTML = 'Add Death Report';
};


const showEditDeathReportModal = ref(true);
const editableDeathReportId = ref(null);
const deathReportForEdit = ref(null);
const editDeathDate = ref('');
const editPatientEmail = ref('');
const editDoctorEmail = ref('');
const editDeathDetails = ref('');

const showEditDeathReportModalFunc = (deathReport) => {
    const modal = document.getElementById('my_edit_modal');
    editableDeathReportId.value = deathReport.id;
    deathReportForEdit.value = deathReport;
    editDeathDate.value = deathReport.date;
    editPatientEmail.value = deathReport.patient_email;
    editDoctorEmail.value = deathReport.doctor_email;
    editDeathDetails.value = deathReport.details;
    modal.showModal();
};


const editDeathReport = async () => {
    const button = document.getElementById('editDepartment-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/update-death-report', {
            deathReportId: editableDeathReportId.value,
            date: editDeathDate.value,
            patientEmail: editPatientEmail.value,
            doctorEmail: editDoctorEmail.value,
            deathDetails: editDeathDetails.value,
        }).then(async (res) => {
            toast.success(res.data.message);
            showEditDeathReportModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showEditDeathReportModal.value = true;
            updateDeathReportDetailsLocally(editableDeathReportId.value, editDeathDate.value,
                editPatientEmail.value, editDoctorEmail.value, editDeathDetails.value)

        }).catch(async (error) => {
            toast.error(error.response.data.message);
            showEditDeathReportModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showEditDeathReportModal.value = true;
        });
    } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
        showEditDeathReportModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showEditDeathReportModal.value = true;
    }
    button.innerHTML = 'Edit Death Report';
};

const updateDeathReportDetailsLocally = (deathReportId, date, patientEmail, doctorEmail, details) => {
    const deathReportIndexInDefaultArray = filteredAndSortedDeathReports.value.findIndex(deathReport => deathReport.id === deathReportId);
    const deathReportIndexInSearchedDeathReports = searchedDeathReports.value.findIndex(deathReport => deathReport.id === deathReportId);

    if (deathReportIndexInDefaultArray !== -1) {
        filteredAndSortedDeathReports.value[deathReportIndexInDefaultArray].date = date;
        filteredAndSortedDeathReports.value[deathReportIndexInDefaultArray].patient_email = patientEmail;
        filteredAndSortedDeathReports.value[deathReportIndexInDefaultArray].doctor_email = doctorEmail;
        filteredAndSortedDeathReports.value[deathReportIndexInDefaultArray].details = details;
    }
    if (deathReportIndexInSearchedDeathReports !== -1) {
        searchedDeathReports.value[deathReportIndexInSearchedDeathReports].date = date;
        searchedDeathReports.value[deathReportIndexInSearchedDeathReports].patient_email = patientEmail;
        searchedDeathReports.value[deathReportIndexInSearchedDeathReports].doctor_email = doctorEmail;
        searchedDeathReports.value[deathReportIndexInSearchedDeathReports].details = details;
    }
};
</script>

<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen">
        <Toaster richColors position="top-right" />
        <SideBar />
        <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
            <Header />

            <Breadcrumb first="Dashboard" second="Monitor Hospital" third="Death Report"
                firstIcon='<i class="fa-solid fa-gauge"></i>' secondIcon='<i class="fa-solid fa-square-h"></i>'
                thirdIcon='<i class="fa-solid fa-skull-crossbones"></i>' link="/admin-dashboard" />

            <!-- Table -->
            <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
                <!-- Search and Role Filter -->
                <div class="flex justify-between mb-4 gap-3 flex-col sm:flex-row">
                    <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
                        class="input input-bordered w-full dark:bg-slate-800 dark:text-gray-300" />
                    <button @click="showAddDeathReportModalFun()"
                        class="bg-primarycolor text-white rounded-lg p-4 text-sm hover:bg-blue-500 font-semibold w-full">Add
                        Death Report</button>
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
                                <th class="cursor-pointer dark:text-gray-300">
                                    Death Details
                                </th>
                                <th @click="sortBy('date')" class="cursor-pointer dark:text-gray-300">
                                    Death Date
                                    <span>{{ getSortIcon('date') }}</span>
                                </th>
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
                                <th class="dark:text-gray-300">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr v-if="searchQuery" v-for="deathReport in searchedDeathReports" :key="deathReport.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ deathReport.details }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ deathReport.date }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ deathReport.patient_name }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ deathReport.patient_email }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ deathReport.doctor_name }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ deathReport.doctor_email }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ deathReport.department_name }}
                                </td>

                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditDeathReportModalFunc(deathReport)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteDeathReportConfirmation(deathReport)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <tr v-else v-for="death in filteredAndSortedDeathReports" :key="death.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ death.details }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ death.date }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ death.patient_name }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ death.patient_email }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ death.doctor_name }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ death.doctor_email }}
                                </td>
                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditDeathReportModalFunc(death)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteDeathReportConfirmation(death)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <!-- Add Birth Report Modal -->
                            <dialog v-if="showAddDeathReportModal" id="my_modal_2" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Death Report Details</h3>

                                        <!-- Death Details Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Death Details</span>
                                            <textarea placeholder="Enter Death Details" v-model="deathDetails"
                                                class="textarea textarea-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300"></textarea>
                                        </label>

                                        <!-- Date Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Date</span>
                                            <input type="date" v-model="deathDate"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Patient Email Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Patient Email</span>
                                            <input type="email" placeholder="Enter Patient Email" v-model="patientEmail"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Doctor Email Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Doctor Email</span>
                                            <input type="email" placeholder="Enter Doctor Email" v-model="doctorEmail"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <div class="modal-action">
                                            <button @click="addDeathReport" id="addDepartment-button"
                                                class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-14">
                                                Add Birth Report
                                            </button>
                                        </div>

                                    </div>
                                </div>

                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeModal">Close</button>
                                </form>
                            </dialog>


                            <!-- Edit Death Report Modal -->
                            <dialog v-if="showEditDeathReportModal" id="my_edit_modal" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Edit Death Report</h3>
                                        <!-- Death Details Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Death Details</span>
                                            <textarea placeholder="Enter Death Details" v-model="editDeathDetails"
                                                class="textarea textarea-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300"></textarea>
                                        </label>
                                        <!-- Death Report Date Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Death Report Date</span>
                                            <input type="date" placeholder="Enter Death Report Date"
                                                v-model="editDeathDate"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Patient Email Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Patient Email</span>
                                            <input type="email" placeholder="Enter Patient Email"
                                                v-model="editPatientEmail"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Doctor Email Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Doctor Email</span>
                                            <input type="email" placeholder="Enter Doctor Email"
                                                v-model="editDoctorEmail"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <div class="modal-action">
                                            <button @click="editDeathReport"
                                                id="editDepartment-button"
                                                class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-14">
                                                Update Death Report
                                            </button>
                                        </div>

                                    </div>
                                </div>

                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeEditModal">Close</button>
                                </form>
                            </dialog>



                            <!-- Modal Delete Death Report Confirmation -->
                            <dialog v-if="showDeleteConfirmationModal" id="modal_delete_deathReport_confirmation"
                                class="modal modal-bottom sm:modal-middle">
                                <div class="modal-box dark:bg-slate-700">
                                    <h3 class="text-lg font-bold dark:text-gray-300">Confirm Delete Death Report</h3>
                                    <p class="py-4 text-red-600 font-semibold">Are you sure you want to delete the
                                        selected death report?</p>
                                    <div class="modal-action">
                                        <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                            @click="deleteDeathReport">Yes</button>

                                        <form method="dialog">
                                            <button
                                                class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-100">Close</button>
                                        </form>
                                    </div>
                                </div>
                            </dialog>
                        </tbody>
                    </table>
                    <div v-if="!deathReports" class="animate-pulse w-full">
                        <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                    </div>
                </div>
                <!-- Pagination -->
                <SearchDeathReportsPagination :searchQuery="searchQuery" v-if="searchQuery" />
                <DeathReportsPagination v-else />
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