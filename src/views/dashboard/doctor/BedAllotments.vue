<script setup>
import SideBar from '../../../components/dashboard/SideBar.vue';
import Header from '../../../components/dashboard/Header.vue';
import Breadcrumb from '../../../components/dashboard/Breadcrumb.vue';
import { onMounted, ref, computed, watch } from 'vue';
import { useSideBar } from '../../../stores/sideBar.js';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'vue-sonner';
import { useFetchBedAllotments } from '../../../stores/fetchBedAllotments.js';
import SearchBedAllotmentsPagination from '../../../components/dashboard/SearchBedAllotmentsPagination.vue';
import BedAllotmentsPagination from '../../../components/dashboard/BedAllotmentsPagination.vue';

const allBedAllotments = useFetchBedAllotments();
const sideBar = useSideBar();
const bedAllotments = computed(() => allBedAllotments.data);

onMounted(() => {
    sideBar.isMonitorExpanded = true;
});

const searchQuery = ref('');
const sortKey = ref('');
const sortOrder = ref(1);

const searchedBedAllotments = computed(() => {
    let filteredBedAllotments = allBedAllotments.searchedBedAllotments || [];
    if (sortKey.value) {
        filteredBedAllotments.sort((a, b) => {
            const aValue = a[sortKey.value] || '';
            const bValue = b[sortKey.value] || '';
            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }

    return filteredBedAllotments;
});

watch(() => searchQuery.value, async () => {
    if (searchQuery.value < 1) {
        await allBedAllotments.fetchBedAllotments();
    }
});

const captureSearchQuery = async () => {
    await allBedAllotments.fetchSearchedBedAllotments(1, searchQuery.value);
    searchedBedAllotments.value = allBedAllotments.searchedBedAllotments;
    return searchedBedAllotments.value;
};

const filteredAndSortedBedAllotments = computed(() => {
    const filteredBedAllotments = bedAllotments.value || [];
    if (sortKey.value) {
        filteredBedAllotments.sort((a, b) => {
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
    return filteredBedAllotments;
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
    const bedAllotments = ref([]);
    try {
        await axios.get('/fetch-all-bed-allotments').then((res) => {
            bedAllotments.value = res.data.bedAllotments;
        }).catch((err) => {
            console.log(err);
        });
    } catch (error) {
        console.log(error);
    }
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the array of objects to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(bedAllotments.value);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BedAllotments');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'bedAllotments.xlsx');
}

const showAddBedAllotmentModalFun = () => {
    const modal = document.getElementById('my_modal_2');
    modal.showModal();
};

const showAddBedAllotmentModal = ref(true);

const updateDeletedBedAllotmentLocally = (bedAllotmentId) => {
    const bedAllotmentIndexInDefaultArray = filteredAndSortedBedAllotments.value.findIndex(bedAllotment => bedAllotment.id === bedAllotmentId);
    const bedAllotmentIndexInSearchedBedAllotments = searchedBedAllotments.value.findIndex(bedAllotment => bedAllotment.id === bedAllotmentId);

    if (bedAllotmentIndexInDefaultArray !== -1) {
        filteredAndSortedBedAllotments.value.splice(bedAllotmentIndexInDefaultArray, 1);
    }
    if (bedAllotmentIndexInSearchedBedAllotments !== -1) {
        searchedBedAllotments.value.splice(bedAllotmentIndexInSearchedBedAllotments, 1);
    }
};

const bedAllotmentToDelete = ref(null);
const deleteBedAllotmentConfirmation = (bedAllotment) => {
    bedAllotmentToDelete.value = bedAllotment;
    const modal = document.getElementById('modal_delete_bedAllotment_confirmation');
    modal.showModal();
};
const showDeleteConfirmationModal = ref(true);
const deleteBedAllotment = async () => {
    try {
        const res = await axios.post('/delete-bed-allotment', {
            bedAllotmentId: bedAllotmentToDelete.value.id
        });
        showDeleteConfirmationModal.value = false;
        toast.success('Success', {
            description: res.data.message,
            duration: 5000,
        });
        updateDeletedBedAllotmentLocally(bedAllotmentToDelete.value.id);
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
const bedNumber = ref('')
const bedType = ref('')
const allotmentDate = ref('')
const dischargeDate = ref('');
const patientEmail = ref('')

const addBedAllotment = async () => {
    const button = document.getElementById('addDepartment-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/add-bed-allotment', {
            bedNumber: bedNumber.value,
            bedType: bedType.value,
            allotmentDate: allotmentDate.value,
            dischargeDate: dischargeDate.value,
            patientEmail: patientEmail.value,
        }).then(async (res) => {
            toast.success(res.data.message);
            showAddBedAllotmentModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddBedAllotmentModal.value = true;
            const objectToAdd = {
                id: res.data.newBedAllotment.id,
                bed_number: res.data.newBedAllotment.bed_number,
                bed_type: res.data.newBedAllotment.bed_type,
                allotment_time: res.data.newBedAllotment.allotment_time,
                discharge_time: res.data.newBedAllotment.discharge_time,
                patient_email: res.data.newBedAllotment.patient_email,
                patient_name: res.data.newBedAllotment.patient_name,

            };
            bedAllotments.value.push(objectToAdd);
            if (searchedBedAllotments.value) {
                searchedBedAllotments.value.push(objectToAdd);
            }
        }).catch(async (error) => {
            toast.error(error.response.data.error);
            showAddBedAllotmentModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddBedAllotmentModal.value = true;
        });
    } catch (error) {
        console.log(error);
        toast.error(error);
        showAddBedAllotmentModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showAddBedAllotmentModal.value = true;
    }
    button.innerHTML = 'Add Bed Allotment';
};


const showEditBedAllotmentModal = ref(true);
const editableBedAllotmentId = ref(null);
const bedAllotmentForEdit = ref(null);
const editAllotmentDate = ref('');
const editDischargeDate = ref('');
const editBedNumber = ref('');
const editBedType = ref('');
const editPatientEmail = ref('');


const showEditBedAllotmentModalFunc = (bedAllotment) => {
    const modal = document.getElementById('my_edit_modal');
    editableBedAllotmentId.value = bedAllotment.id;
    bedAllotmentForEdit.value = bedAllotment;
    editAllotmentDate.value = bedAllotment.allotment_time
    editDischargeDate.value = bedAllotment.discharge_time
    editBedNumber.value = bedAllotment.bed_number
    editBedType.value = bedAllotment.bed_type
    editPatientEmail.value = bedAllotment.patient_email

    modal.showModal();
};



const editBedAllotment = async () => {
    const button = document.getElementById('editDepartment-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        const response = await axios.post('/update-bed-allotment', {
            bedAllotmentId: editableBedAllotmentId.value,
            bedNumber: editBedNumber.value,
            bedType: editBedType.value,
            allotmentDate: editAllotmentDate.value,
            dischargeDate: editDischargeDate.value,
            patientEmail: editPatientEmail.value
        });
        toast.success(response.data.message);
        showEditBedAllotmentModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showEditBedAllotmentModal.value = true;
        updateBedAllotmentDetailsLocally(editableBedAllotmentId.value, editBedNumber.value, editBedType.value,
            response.data.updatedBedAllotment.patient_name, editPatientEmail.value, editAllotmentDate.value, editDischargeDate.value)

    } catch (error) {
        toast.error(error.response.data.error);
        showEditBedAllotmentModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showEditBedAllotmentModal.value = true;
        console.log(error);
    }
    button.innerHTML = 'Save changes';
};


const updateBedAllotmentDetailsLocally = (bedAllotmentId, bedNumber, bedType, patientName, patientEmail, allotmentDate, dischargeDate) => {
    const bedAllotmentIndexInDefaultArray = filteredAndSortedBedAllotments.value.find(bedAllotment => bedAllotment.id === bedAllotmentId);
    const bedAllotmentIndexInSearchedBedAllotments = searchedBedAllotments.value.find(bedAllotment => bedAllotment.id === bedAllotmentId);

    if (bedAllotmentIndexInDefaultArray) {
        bedAllotmentIndexInDefaultArray.bed_number = bedNumber;
        bedAllotmentIndexInDefaultArray.bed_type = bedType;
        bedAllotmentIndexInDefaultArray.patient_name = patientName;
        bedAllotmentIndexInDefaultArray.patient_email = patientEmail;
        bedAllotmentIndexInDefaultArray.allotment_time = allotmentDate;
        bedAllotmentIndexInDefaultArray.discharge_time = dischargeDate;
    }
    if (bedAllotmentIndexInSearchedBedAllotments) {
        bedAllotmentIndexInSearchedBedAllotments.bed_number = bedNumber;
        bedAllotmentIndexInSearchedBedAllotments.bed_type = bedType;
        bedAllotmentIndexInSearchedBedAllotments.patient_name = patientName;
        bedAllotmentIndexInSearchedBedAllotments.patient_email = patientEmail;
        bedAllotmentIndexInSearchedBedAllotments.allotment_time = allotmentDate;
        bedAllotmentIndexInSearchedBedAllotments.discharge_time = dischargeDate;
    }
};

</script>


<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen">
        <Toaster richColors position="top-right" />
        <SideBar />
        <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
            <Header />

            <Breadcrumb first="Dashboard" second="Bed Allotments"
                firstIcon='<i class="fa-solid fa-gauge"></i>' secondIcon='<i class="fas fa-bed"></i>' link="/doctor-dashboard" />

            <!-- Table -->
            <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
                <!-- Search and Role Filter -->
                <div class="flex justify-between mb-4 gap-3 flex-col sm:flex-row">
                    <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
                        class="input input-bordered w-full  dark:bg-slate-800 dark:text-gray-300" />
                    <button @click="showAddBedAllotmentModalFun()"
                        class="bg-primarycolor text-white rounded-lg p-4 text-sm hover:bg-blue-500 font-semibold w-full">Add
                        Bed Allotment</button>
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
                                <th @click="sortBy('bed_number')" class="cursor-pointer dark:text-gray-300">
                                    Bed Number
                                    <span>{{ getSortIcon('bed_number') }}</span>
                                </th>
                                <th @click="sortBy('bed_type')" class="cursor-pointer dark:text-gray-300">
                                    Bed Type
                                    <span>{{ getSortIcon('bed_type') }}</span>
                                </th>
                                <th @click="sortBy('patient_name')" class="cursor-pointer dark:text-gray-300">
                                    Patient Name
                                    <span>{{ getSortIcon('patient_name') }}</span>
                                </th>
                                <th @click="sortBy('patient_email')" class="cursor-pointer dark:text-gray-300">
                                    Patient Email
                                    <span>{{ getSortIcon('patient_email') }}</span>
                                </th>
                                <th @click="sortBy('allotment_time')" class="cursor-pointer dark:text-gray-300">
                                    Allotment Date
                                    <span>{{ getSortIcon('allotment_time') }}</span>
                                </th>
                                <th @click="sortBy('discharge_time')" class="cursor-pointer dark:text-gray-300">
                                    Discharge Date
                                    <span>{{ getSortIcon('discharge_time') }}</span>
                                </th>
                                <th class="dark:text-gray-300">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr v-if="searchQuery" v-for="bedAllotment in searchedBedAllotments" :key="bedAllotment.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ bedAllotment.bed_number }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ bedAllotment.bed_type }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ bedAllotment.patient_name }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ bedAllotment.patient_email }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ bedAllotment.allotment_time }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ bedAllotment.discharge_time }}
                                </td>
                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditBedAllotmentModalFunc(bedAllotment)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteBedAllotmentConfirmation(bedAllotment)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <tr v-else v-for="bed in filteredAndSortedBedAllotments" :key="bed.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ bed.bed_number }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ bed.bed_type }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ bed.patient_name }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ bed.patient_email }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ bed.allotment_time }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ bed.discharge_time }}
                                </td>
                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditBedAllotmentModalFunc(bed)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteBedAllotmentConfirmation(bed)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <!-- Add Bed Allotment Modal -->
                            <dialog v-if="showAddBedAllotmentModal" id="my_modal_2" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Bed Allotment Details</h3>

                                        <!-- Bed Number Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Bed Number</span>
                                            <input type="text" placeholder="Enter Bed Number" v-model="bedNumber"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Bed Type Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Bed Type</span>
                                            <select v-model="bedType" class="select select-bordered mt-2 dark:bg-slate-800 dark:text-gray-300">
                                                <option value="">Select Bed Type</option>
                                                <option value="generalWard">General Ward Bed</option>
                                                <option value="privateRoom">Private Room</option>
                                                <option value="icu">ICU Bed</option>
                                                <option value="pediatric">Pediatric Bed</option>
                                                <option value="maternity">Maternity Bed</option>
                                                <option value="orthopedic">Orthopedic Bed</option>
                                                <option value="bariatric">Bariatric Bed</option>
                                                <option value="emergency">Emergency Bed</option>
                                                <option value="dayCare">Day Care Bed</option>
                                                <option value="burnUnit">Burn Unit Bed</option>
                                                <option value="recovery">Recovery Bed</option>
                                                <option value="psychiatric">Psychiatric Bed</option>
                                            </select>
                                        </label>

                                        <!-- Patient Email Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Patient Email</span>
                                            <input type="email" placeholder="Enter Patient Email" v-model="patientEmail"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Allotment Date Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Allotment Date</span>
                                            <input type="date" v-model="allotmentDate"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Discharge Date Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Discharge Date</span>
                                            <input type="date" v-model="dischargeDate"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <div class="modal-action">
                                            <button @click="addBedAllotment" id="addDepartment-button"
                                                class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-16">
                                                Add Bed Allotment
                                            </button>
                                        </div>

                                    </div>
                                </div>

                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeModal">Close</button>
                                </form>
                            </dialog>



                            <!-- Edit Death Report Modal -->
                            <dialog v-if="showEditBedAllotmentModal" id="my_edit_modal" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Edit Bed Allotment Details</h3>
                                        <!-- Bed Number Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Bed Number</span>
                                            <input type="text" placeholder="Enter Bed Number" v-model="editBedNumber"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Bed Type Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Bed Type</span>
                                            <select v-model="editBedType" class="select select-bordered mt-2 dark:bg-slate-800 dark:text-gray-300">
                                                <option value="generalWard">General Ward Bed</option>
                                                <option value="privateRoom">Private Room</option>
                                                <option value="icu">ICU Bed</option>
                                                <option value="pediatric">Pediatric Bed</option>
                                                <option value="maternity">Maternity Bed</option>
                                                <option value="orthopedic">Orthopedic Bed</option>
                                                <option value="bariatric">Bariatric Bed</option>
                                                <option value="emergency">Emergency Bed</option>
                                                <option value="dayCare">Day Care Bed</option>
                                                <option value="burnUnit">Burn Unit Bed</option>
                                                <option value="recovery">Recovery Bed</option>
                                                <option value="psychiatric">Psychiatric Bed</option>
                                            </select>
                                        </label>

                                        <!-- Patient Email Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Patient Email</span>
                                            <input type="email" placeholder="Enter Patient Email"
                                                v-model="editPatientEmail"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Allotment Date Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Allotment Date</span>
                                            <input type="date" v-model="editAllotmentDate"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Discharge Date Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Discharge Date</span>
                                            <input type="date" v-model="editDischargeDate"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <div class="modal-action">
                                            <button @click="editBedAllotment" id="editDepartment-button"
                                                class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-16">
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
                            <dialog v-if="showDeleteConfirmationModal" id="modal_delete_bedAllotment_confirmation"
                                class="modal modal-bottom sm:modal-middle">
                                <div class="modal-box dark:bg-slate-700">
                                    <h3 class="text-lg font-bold dark:text-gray-300">Confirm Delete Death Report</h3>
                                    <p class="py-4 text-red-600 font-semibold">Are you sure you want to delete the
                                        selected death report?</p>
                                    <div class="modal-action">
                                        <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                            @click="deleteBedAllotment">Yes</button>

                                        <form method="dialog">
                                            <button
                                                class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-1000">Close</button>
                                        </form>
                                    </div>
                                </div>
                            </dialog>
                        </tbody>
                    </table>
                    <div v-if="!bedAllotments" class="animate-pulse w-full">
                        <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                    </div>
                </div>
                <!-- Pagination -->
                <SearchBedAllotmentsPagination :searchQuery="searchQuery" v-if="searchQuery" />
                <BedAllotmentsPagination v-else />
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