<script setup>
import SideBar from '../../../components/dashboard/SideBar.vue';
import Header from '../../../components/dashboard/Header.vue';
import Breadcrumb from '../../../components/dashboard/Breadcrumb.vue';
import { onMounted, ref, computed, watch } from 'vue';
import { useSideBar } from '../../../stores/sideBar';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'vue-sonner';
import { useFetchOperationReports } from '../../../stores/fetchOperationReports.js';
import SearchOperationReportsPagination from '../../../components/dashboard/SearchOperationReportsPagination.vue';
import OperationReportsPagination from '../../../components/dashboard/OperationReportsPagination.vue';


const allOperationReports = useFetchOperationReports();
const sideBar = useSideBar();
const operationReports = computed(() => allOperationReports.data);
const departments = computed(() => allOperationReports.allDepartments)

onMounted(() => {
    sideBar.isMonitorExpanded = true;
});

const searchQuery = ref('');
const sortKey = ref('');
const sortOrder = ref(1);

const searchedOperationReports = computed(() => {
    let filteredOperationReports = allOperationReports.searchedOperationReports || [];
    if (sortKey.value) {
        filteredOperationReports.sort((a, b) => {
            const aValue = a[sortKey.value] || '';
            const bValue = b[sortKey.value] || '';
            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }

    return filteredOperationReports;
});

watch(() => searchQuery.value, async () => {
    if (searchQuery.value < 1) {
        await allOperationReports.fetchOperationReports();
    }
});

const captureSearchQuery = async () => {
    await allOperationReports.fetchSearchedOperationReports(1, searchQuery.value);
    searchedOperationReports.value = allOperationReports.searchedOperationReports;
    return searchedOperationReports.value;
};

const filteredAndSortedOperationReports = computed(() => {
    const filteredOperationReports = operationReports.value || [];
    if (sortKey.value) {
        filteredOperationReports.sort((a, b) => {
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
    return filteredOperationReports;
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
    const operationReports = ref([]);
    try {
        await axios.get('/fetch-all-operation-reports').then((res) => {
            operationReports.value = res.data.operationReports;
        }).catch((err) => {
            console.log(err);
        });
    } catch (error) {
        console.log(error);
    }
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the array of objects to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(operationReports.value);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OperationReports');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'operationReports.xlsx');
}

const showAddOperationReportModalFun = () => {
    const modal = document.getElementById('my_modal_2');
    modal.showModal();
};

const showAddOperationReportModal = ref(true);

const updateDeletedOperationReportLocally = (operationReportId) => {
    const operationReportIndexInDefaultArray = filteredAndSortedOperationReports.value.findIndex(operationReport => operationReport.id === operationReportId);
    const operationReportIndexInSearchedOperationReports = searchedOperationReports.value.findIndex(operationReport => operationReport.id === operationReportId);

    if (operationReportIndexInDefaultArray !== -1) {
        filteredAndSortedOperationReports.value.splice(operationReportIndexInDefaultArray, 1);
    }
    if (operationReportIndexInSearchedOperationReports !== -1) {
        searchedOperationReports.value.splice(operationReportIndexInSearchedOperationReports, 1);
    }
};

const operationReportToDelete = ref(null);
const deleteOperationReportConfirmation = (operationReport) => {
    operationReportToDelete.value = operationReport;
    const modal = document.getElementById('modal_delete_operationReport_confirmation');
    modal.showModal();
};
const showDeleteConfirmationModal = ref(true);
const deleteOperationReport = async () => {
    try {
        const res = await axios.post('/delete-operation-report', {
            operationReportId: operationReportToDelete.value.id
        });
        showDeleteConfirmationModal.value = false;
        toast.success('Success', {
            description: res.data.message,
            duration: 5000,
        });
        updateDeletedOperationReportLocally(operationReportToDelete.value.id);
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

const operationDetails = ref('')
const operationDate = ref('')
const patientEmail = ref('')
const doctorEmail = ref('')
const departmentId = ref('')

const addOperationReport = async () => {
    const button = document.getElementById('addDepartment-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/add-operation-report', {
            operationDetails: operationDetails.value,
            operationDate: operationDate.value,
            patientEmail: patientEmail.value,
            doctorEmail: doctorEmail.value,
            departmentId: departmentId.value,
        }).then(async (res) => {
            toast.success(res.data.message);
            showAddOperationReportModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddOperationReportModal.value = true;
            const objectToAdd = {
                id: res.data.newOperationReport.id,
                doctor_email: res.data.newOperationReport.doctor_email,
                doctor_name: res.data.newOperationReport.doctor_name,
                patient_name: res.data.newOperationReport.patient_name,
                patient_email: res.data.newOperationReport.patient_email,
                date: res.data.newOperationReport.date,
                operation_details: res.data.newOperationReport.operation_details,
                department_name: res.data.newOperationReport.department_name,
            };
            operationReports.value.push(objectToAdd);
            if (searchedOperationReports.value) {
                searchedOperationReports.value.push(objectToAdd);
            }
        }).catch(async (error) => {
            toast.error(error.response.data.error);
            showAddOperationReportModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddOperationReportModal.value = true;
        });
    } catch (error) {
        console.log(error);
        toast.error(error);
        showAddOperationReportModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showAddOperationReportModal.value = true;
    }
    button.innerHTML = 'Add Operation Report';
};


const showEditOperationReportModal = ref(true)
const editableOperationReportId = ref(null)
const operationReportForEdit = ref(null)
const editOperationDate = ref('')
const editPatientEmail = ref('')
const editDoctorEmail = ref('')
const editDepartmentName = ref('')
const editOperationDetails = ref('')
const editDepartmentId = ref('')

const showEditOperationReportModalFunc = (operationReport) => {
    const modal = document.getElementById('my_edit_modal');
    editableOperationReportId.value = operationReport.id
    operationReportForEdit.value = operationReport
    editOperationDate.value = operationReport.date
    editPatientEmail.value = operationReport.patient_email
    editDoctorEmail.value = operationReport.doctor_email
    editDepartmentName.value = operationReport.department_name
    editOperationDetails.value = operationReport.operation_details
    editDepartmentId.value = operationReport.department_id
    modal.showModal();
};


const editOperationReport = async () => {
    const button = document.getElementById('editDepartment-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/update-operation-report', {
            operationReportId: editableOperationReportId.value,
            date: editOperationDate.value,
            patient_email: editPatientEmail.value,
            doctor_email: editDoctorEmail.value,
            department_name: editDepartmentName.value,
            operation_details: editOperationDetails.value,
            department_id: editDepartmentId.value
        }).then(async (res) => {
            toast.success(res.data.message);
            showEditOperationReportModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showEditOperationReportModal.value = true;
            editDepartmentName.value = res.data.updatedOperationReport.department_name
            updateOperationReportsDetailsLocally(
                editableOperationReportId.value,
                editOperationDate.value,
                editPatientEmail.value,
                editDoctorEmail.value,
                editDepartmentName.value,
                editOperationDetails.value,
                editDepartmentId.value
            );
        }).catch(async (error) => {
            toast.error(error.response.data.error);
            showEditOperationReportModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showEditOperationReportModal.value = true;
        });
    } catch (error) {
        console.log(error);
        toast.error(error);
        showEditOperationReportModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showEditOperationReportModal.value = true;
    }
    button.innerHTML = 'Update Operation Report';
};


const updateOperationReportsDetailsLocally = (operationReportId, date, patientEmail, doctorEmail, departmentName, operationDetails) => {
    const operationReportIndexInDefaultArray = filteredAndSortedOperationReports.value.find(report => report.id === operationReportId);
    const operationReportIndexInSearchedReports = searchedOperationReports.value.find(report => report.id === operationReportId);
    if (operationReportIndexInDefaultArray) {
        operationReportIndexInDefaultArray.date = date;
        operationReportIndexInDefaultArray.patient_email = patientEmail;
        operationReportIndexInDefaultArray.doctor_email = doctorEmail;
        operationReportIndexInDefaultArray.department_name = departmentName;
        operationReportIndexInDefaultArray.operation_details = operationDetails;
    }

    if (operationReportIndexInSearchedReports) {
        operationReportIndexInSearchedReports.date = date;
        operationReportIndexInSearchedReports.patient_email = patientEmail;
        operationReportIndexInSearchedReports.doctor_email = doctorEmail;
        operationReportIndexInSearchedReports.department_name = departmentName;
        operationReportIndexInSearchedReports.operation_details = operationDetails;
    }
};

</script>






<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen">
        <Toaster richColors position="top-right" />
        <SideBar />
        <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
            <Header />

            <Breadcrumb first="Dashboard" second="Monitor Hospital" third="Operation Report"
                firstIcon='<i class="fa-solid fa-gauge"></i>' secondIcon='<i class="fa-solid fa-square-h"></i>'
                thirdIcon='<i class="fa-solid fa-prescription-bottle"></i>' link="/admin-dashboard" />

            <!-- Table -->
            <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
                <!-- Search and Role Filter -->
                <div class="flex justify-between mb-4 gap-3 flex-col sm:flex-row">
                    <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
                        class="input input-bordered w-full dark:bg-slate-800 dark:text-gray-300" />
                    <button @click="showAddOperationReportModalFun()"
                        class="bg-primarycolor text-white rounded-lg p-4 text-sm hover:bg-blue-500 font-semibold w-full">Add
                        Operation Report</button>
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
                                    Operation Details
                                </th>
                                <th @click="sortBy('date')" class="cursor-pointer dark:text-gray-300">
                                    Operation Date
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
                                <th @click="sortBy('department_name')" class="cursor-pointer dark:text-gray-300">
                                    Department
                                    <span>{{ getSortIcon('department_name') }}</span>
                                </th>
                                <th class="dark:text-gray-300">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr v-if="searchQuery" v-for="operationReport in searchedOperationReports"
                                :key="operationReport.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ operationReport.operation_details }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ operationReport.date }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ operationReport.patient_name }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ operationReport.patient_email }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ operationReport.doctor_name }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ operationReport.doctor_email }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ operationReport.department_name }}
                                </td>

                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditOperationReportModalFunc(operationReport)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteOperationReportConfirmation(operationReport)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <tr v-else v-for="op in filteredAndSortedOperationReports" :key="op.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ op.operation_details }}</div>
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
                                <td class="dark:text-gray-300">
                                    {{ op.department_name }}
                                </td>

                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditOperationReportModalFunc(op)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteOperationReportConfirmation(op)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <!-- Add Operation Report Modal -->
                            <dialog v-if="showAddOperationReportModal" id="my_modal_2" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Operation Report Details</h3>

                                        <!-- Operation Details Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Operation Details</span>
                                            <textarea placeholder="Enter Operation Details" v-model="operationDetails"
                                                class="textarea textarea-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300"></textarea>
                                        </label>

                                        <!-- Date Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Date</span>
                                            <input type="date" v-model="operationDate"
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

                                        <!-- Department Select -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Department</span>
                                            <select v-model="departmentId"
                                                class="select select-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300">
                                                <option value="" disabled>Select Department</option>
                                                <!-- Assuming departments is an array of department objects -->
                                                <option v-for="department in departments" :key="department.id"
                                                    :value="department.id">
                                                    {{ department.name }}
                                                </option>
                                            </select>
                                        </label>


                                        <div class="modal-action">
                                            <button @click="addOperationReport" id="addDepartment-button"
                                                class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-14">
                                                Add Operation Report
                                            </button>
                                        </div>

                                    </div>
                                </div>

                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeModal">Close</button>
                                </form>
                            </dialog>


                            <!-- Edit Operation Report Modal -->
                            <dialog v-if="showEditOperationReportModal" id="my_edit_modal" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Edit Operation Report</h3>
                                        <!-- Operation Report Date Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Operation Report Date</span>
                                            <input type="date" placeholder="Enter Operation Report Date"
                                                v-model="editOperationDate"
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

                                        <!-- Department Name Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Department</span>
                                            <select v-model="editDepartmentId"
                                                class="select select-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300">
                                                <!-- Assuming departments is an array of department objects -->
                                                <option v-for="department in departments" :key="department.id"
                                                    :value="department.id">
                                                    {{ department.name }}
                                                </option>
                                            </select>
                                        </label>

                                        <!-- Operation Details Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Operation Details</span>
                                            <textarea placeholder="Enter Operation Details"
                                                v-model="editOperationDetails"
                                                class="textarea textarea-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300"></textarea>
                                        </label>

                                        <div class="modal-action">
                                            <button @click="editOperationReport" id="editDepartment-button" class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-14">
                                                Update Operation Report
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeModal">close</button>
                                </form>
                            </dialog>


                            <!-- Delete Operation Report Modal -->
                            <dialog v-if="showDeleteConfirmationModal" id="modal_delete_operationReport_confirmation"
                                class="modal modal-bottom sm:modal-middle">
                                <div class="modal-box dark:bg-slate-700">
                                    <h3 class="text-lg font-bold dark:text-gray-300">Confirm Delete Operation Report</h3>
                                    <p class="py-4 text-red-600 font-semibold">Are you sure you want to delete the
                                        selected operation report?</p>
                                    <div class="modal-action">
                                        <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                            @click="deleteOperationReport">Yes</button>

                                        <form method="dialog">
                                            <button
                                                class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-100">Close</button>
                                        </form>
                                    </div>
                                </div>
                            </dialog>

                        </tbody>
                    </table>
                    <div v-if="!operationReports" class="animate-pulse w-full">
                        <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                    </div>
                </div>
                <!-- Pagination -->
                <SearchOperationReportsPagination :searchQuery="searchQuery" v-if="searchQuery" />
                <OperationReportsPagination v-else />
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