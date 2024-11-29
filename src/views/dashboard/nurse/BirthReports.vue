<script setup>
import SideBar from '../../../components/dashboard/SideBar.vue';
import Header from '../../../components/dashboard/Header.vue';
import Breadcrumb from '../../../components/dashboard/Breadcrumb.vue';
import { onMounted, ref, computed, watch } from 'vue';
import { useSideBar } from '../../../stores/sideBar';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'vue-sonner';
import { useFetchBirthReports } from '../../../stores/fetchBirthReports.js';
import SearchBirthReportsPagination from '../../../components/dashboard/SearchBirthReportsPagination.vue';
import BirthReportsPagination from '../../../components/dashboard/BirthReportsPagination.vue';


const allBirthReports = useFetchBirthReports();
const sideBar = useSideBar();
const birthReports = computed(() => allBirthReports.data);

onMounted(() => {
    sideBar.isMonitorExpanded = true;
});

const searchQuery = ref('');
const sortKey = ref('');
const sortOrder = ref(1);

const searchedBirthReports = computed(() => {
    let filteredBirthReports = allBirthReports.searchedBirthReports || [];
    if (sortKey.value) {
        filteredBirthReports.sort((a, b) => {
            const aValue = a[sortKey.value] || '';
            const bValue = b[sortKey.value] || '';
            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }

    return filteredBirthReports;
});

watch(() => searchQuery.value, async () => {
    if (searchQuery.value < 1) {
        await allBirthReports.fetchBirthReports();
    }
});

const captureSearchQuery = async () => {
    await allBirthReports.fetchSearchedBirthReports(1, searchQuery.value);
    searchedBirthReports.value = allBirthReports.searchedBirthReports;
    return searchedBirthReports.value;
};

const filteredAndSortedBirthReports = computed(() => {
    const filteredBirthReports = birthReports.value || [];
    if (sortKey.value) {
        filteredBirthReports.sort((a, b) => {
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
    return filteredBirthReports;
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
    const birthReports = ref([]);
    try {
        await axios.get('/fetch-all-birth-reports').then((res) => {
            birthReports.value = res.data.birthReports;
        }).catch((err) => {
            console.log(err);
        });
    } catch (error) {
        console.log(error);
    }
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the array of objects to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(birthReports.value);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BirthReports');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'birthReports.xlsx');
}

const showAddBirthReportModalFun = () => {
    const modal = document.getElementById('my_modal_2');
    modal.showModal();
};

const showAddBirthReportModal = ref(true);

const updateDeletedBirthReportLocally = (birthReportId) => {
    const birthReportIndexInDefaultArray = filteredAndSortedBirthReports.value.findIndex(birthReport => birthReport.id === birthReportId);
    const birthReportIndexInSearchedBirthReports = searchedBirthReports.value.findIndex(birthReport => birthReport.id === birthReportId);

    if (birthReportIndexInDefaultArray !== -1) {
        filteredAndSortedBirthReports.value.splice(birthReportIndexInDefaultArray, 1);
    }
    if (birthReportIndexInSearchedBirthReports !== -1) {
        searchedBirthReports.value.splice(birthReportIndexInSearchedBirthReports, 1);
    }
};

const birthReportToDelete = ref(null);
const deleteBirthReportConfirmation = (birthReport) => {
    birthReportToDelete.value = birthReport;
    const modal = document.getElementById('modal_delete_birthReport_confirmation');
    modal.showModal();
};
const showDeleteConfirmationModal = ref(true);
const deleteBirthReport = async () => {
    try {
        const res = await axios.post('/delete-birth-report', {
            birthReportId: birthReportToDelete.value.id
        });
        showDeleteConfirmationModal.value = false;
        toast.success('Success', {
            description: res.data.message,
            duration: 5000,
        });
        updateDeletedBirthReportLocally(birthReportToDelete.value.id);
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

const birthDetails = ref('');
const birthDate = ref('');
const patientEmail = ref('');
const doctorEmail = ref('');
const departmentId = ref('');

const addBirthReport = async () => {
    const button = document.getElementById('addDepartment-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/add-birth-report', {
            birthDetails: birthDetails.value,
            birthDate: birthDate.value,
            patientEmail: patientEmail.value,
            doctorEmail: doctorEmail.value,
            departmentId: departmentId.value,
        }).then(async (res) => {
            toast.success(res.data.message);
            showAddBirthReportModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddBirthReportModal.value = true;
            const objectToAdd = {
                id: res.data.newBirthReport.id,
                doctor_email: res.data.newBirthReport.doctor_email,
                doctor_name: res.data.newBirthReport.doctor_name,
                patient_name: res.data.newBirthReport.patient_name,
                patient_email: res.data.newBirthReport.patient_email,
                date: res.data.newBirthReport.date,
                details: res.data.newBirthReport.details,
            };
            birthReports.value.push(objectToAdd);
            if (searchedBirthReports.value) {
                searchedBirthReports.value.push(objectToAdd);
            }
        }).catch(async (error) => {
            toast.error(error.response.data.error);
            showAddBirthReportModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddBirthReportModal.value = true;
        });
    } catch (error) {
        console.log(error);
        toast.error(error);
        showAddBirthReportModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showAddBirthReportModal.value = true;
    }
    button.innerHTML = 'Add Birth Report';
};


const showEditBirthReportModal = ref(true);
const editableBirthReportId = ref(null);
const birthReportForEdit = ref(null);
const editBirthDate = ref('');
const editPatientEmail = ref('');
const editDoctorEmail = ref('');
const editBirthDetails = ref('');

const showEditBirthReportModalFunc = (birthReport) => {
    const modal = document.getElementById('my_edit_modal');
    editableBirthReportId.value = birthReport.id;
    birthReportForEdit.value = birthReport;
    editBirthDate.value = birthReport.date;
    editPatientEmail.value = birthReport.patient_email;
    editDoctorEmail.value = birthReport.doctor_email;
    editBirthDetails.value = birthReport.details;
    modal.showModal();
};


const editBirthReport = async () => {
    const button = document.getElementById('editDepartment-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/update-birth-report', {
            birthReportId: editableBirthReportId.value,
            date: editBirthDate.value,
            patientEmail: editPatientEmail.value,
            doctorEmail: editDoctorEmail.value,
            birthDetails: editBirthDetails.value,
        }).then(async (res) => {
            toast.success(res.data.message);
            showEditBirthReportModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showEditBirthReportModal.value = true;
            updateBirthReportDetailsLocally(editableBirthReportId.value, editBirthDate.value,
            editPatientEmail.value, editDoctorEmail.value, editBirthDetails.value)
            
        }).catch(async (error) => {
            toast.error(error.response.data.message);
            showEditBirthReportModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showEditBirthReportModal.value = true;
        });
    } catch (error) {
        toast.error(error);
        console.log(error);
    }
    button.innerHTML = 'Edit Birth Report';
};


const updateBirthReportDetailsLocally = (birthReportId, date, patientEmail, doctorEmail, birthDetails) => {
    const birthReportIndexInDefaultArray = filteredAndSortedBirthReports.value.find(birthReport => birthReport.id === birthReportId);
    const birthReportIndexInSearchedBirthReports = searchedBirthReports.value.find(birthReport => birthReport.id === birthReportId);

    if (birthReportIndexInDefaultArray !== -1) {
        birthReportIndexInDefaultArray.date = date;
        birthReportIndexInDefaultArray.patient_email = patientEmail;
        birthReportIndexInDefaultArray.doctor_email = doctorEmail;
        birthReportIndexInDefaultArray.details = birthDetails;
    }
    if (birthReportIndexInSearchedBirthReports !== -1) {
        birthReportIndexInSearchedBirthReports.date = date;
        birthReportIndexInSearchedBirthReports.patient_email = patientEmail;
        birthReportIndexInSearchedBirthReports.doctor_email = doctorEmail;
        birthReportIndexInSearchedBirthReports.details = birthDetails;
    }
};

</script>







<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen">
        <Toaster richColors position="top-right" />
        <SideBar />
        <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
            <Header />

            <Breadcrumb first="Dashboard" second="Monitor Hospital" third="Birth Report"
                firstIcon='<i class="fa-solid fa-gauge"></i>' secondIcon='<i class="fa-solid fa-square-h"></i>'
                thirdIcon='<i class="fa-solid fa-person-pregnant"></i>' link="/admin-dashboard" />

            <!-- Table -->
            <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
                <!-- Search and Role Filter -->
                <div class="flex justify-between mb-4 gap-3 flex-col sm:flex-row">
                    <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
                        class="input input-bordered w-full dark:bg-slate-800 dark:text-gray-300" />
                    <button @click="showAddBirthReportModalFun()"
                        class="bg-primarycolor text-white rounded-lg p-4 text-sm hover:bg-blue-500 font-semibold w-full">Add
                        Birth Report</button>
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
                                    Birth Details
                                </th>
                                <th @click="sortBy('date')" class="cursor-pointer dark:text-gray-300">
                                    Birth Date
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

                            <tr v-if="searchQuery" v-for="birthReport in searchedBirthReports" :key="birthReport.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ birthReport.details }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ birthReport.date }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ birthReport.patient_name }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ birthReport.patient_email }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ birthReport.doctor_name }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ birthReport.doctor_email }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ birthReport.department_name }}
                                </td>

                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditBirthReportModalFunc(birthReport)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteBirthReportConfirmation(birthReport)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <tr v-else v-for="op in filteredAndSortedBirthReports" :key="op.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ op.details }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ op.date }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ op.patient_name }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ op.patient_email }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ op.doctor_name }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ op.doctor_email }}
                                </td>
                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditBirthReportModalFunc(op)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteBirthReportConfirmation(op)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <!-- Add Birth Report Modal -->
                            <dialog v-if="showAddBirthReportModal" id="my_modal_2" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Birth Report Details</h3>

                                        <!-- Birth Details Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Birth Details</span>
                                            <textarea placeholder="Enter Birth Details" v-model="birthDetails"
                                                class="textarea textarea-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300"></textarea>
                                        </label>

                                        <!-- Date Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Date</span>
                                            <input type="date" v-model="birthDate"
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
                                            <button @click="addBirthReport" id="addDepartment-button"
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


                            <!-- Edit Birth Report Modal -->
                            <dialog v-if="showEditBirthReportModal" id="my_edit_modal" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Edit Birth Report</h3>
                                        <!-- Birth Details Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Birth Details</span>
                                            <textarea placeholder="Enter Birth Details" v-model="editBirthDetails"
                                                class="textarea textarea-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300"></textarea>
                                        </label>
                                        <!-- Birth Report Date Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Birth Report Date</span>
                                            <input type="date" placeholder="Enter Birth Report Date"
                                                v-model="editBirthDate"
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
                                            <button @click="editBirthReport"
                                                id="editDepartment-button"
                                                class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-14">
                                                Update Birth Report
                                            </button>
                                        </div>

                                    </div>
                                </div>

                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeEditModal">Close</button>
                                </form>
                            </dialog>



                            <!-- Modal Delete Birth Report Confirmation -->
                            <dialog v-if="showDeleteConfirmationModal" id="modal_delete_birthReport_confirmation"
                                class="modal modal-bottom sm:modal-middle">
                                <div class="modal-box dark:bg-slate-700">
                                    <h3 class="text-lg font-bold dark:text-gray-300">Confirm Delete Birth Report</h3>
                                    <p class="py-4 text-red-600 font-semibold">Are you sure you want to delete the
                                        selected birth report?</p>
                                    <div class="modal-action">
                                        <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                            @click="deleteBirthReport">Yes</button>

                                        <form method="dialog">
                                            <button
                                                class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-100">Close</button>
                                        </form>
                                    </div>
                                </div>
                            </dialog>
                        </tbody>
                    </table>
                    <div v-if="!birthReports" class="animate-pulse w-full">
                        <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                    </div>
                </div>
                <!-- Pagination -->
                <SearchBirthReportsPagination :searchQuery="searchQuery" v-if="searchQuery" />
                <BirthReportsPagination v-else />
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