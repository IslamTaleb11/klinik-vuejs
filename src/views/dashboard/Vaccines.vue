<script setup>
import SideBar from '../../components/dashboard/SideBar.vue';
import Header from '../../components/dashboard/Header.vue';
import Breadcrumb from '../../components/dashboard/Breadcrumb.vue';
import { onMounted, ref, computed, watch } from 'vue';
import { useSideBar } from '../../stores/sideBar.js';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'vue-sonner';
import { useFetchVaccines } from '../../stores/fetchVaccines.js';
import VaccinesPagination from '../../components/dashboard/VaccinesPagination.vue'
import SearchVaccinesPagination from '../../components/dashboard/SearchVaccinesPagination.vue'

const allVaccines = useFetchVaccines();
const sideBar = useSideBar();
const vaccines = computed(() => allVaccines.data);

onMounted(() => {
    sideBar.isMonitorExpanded = true;
});

const searchQuery = ref('');
const sortKey = ref('');
const sortOrder = ref(1);

const searchedVaccines = computed(() => {
    let filteredVaccines = allVaccines.searchedVaccines || [];
    if (sortKey.value) {
        filteredVaccines.sort((a, b) => {
            const aValue = a[sortKey.value] || '';
            const bValue = b[sortKey.value] || '';
            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }

    return filteredVaccines;
});

watch(() => searchQuery.value, async () => {
    if (searchQuery.value < 1) {
        await allVaccines.fetchVaccines();
    }
});

const captureSearchQuery = async () => {
    await allVaccines.fetchSearchedVaccines(1, searchQuery.value);
    searchedVaccines.value = allVaccines.searchedVaccines;
    return searchedVaccines.value;
};

const filteredAndSortedVaccines = computed(() => {
    const filteredVaccines = vaccines.value || [];
    if (sortKey.value) {
        filteredVaccines.sort((a, b) => {
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
    return filteredVaccines;
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
    const vaccines = ref([]);
    try {
        await axios.get('/fetch-all-vaccines').then((res) => {
            vaccines.value = res.data.vaccines;
        }).catch((err) => {
            console.log(err);
        });
    } catch (error) {
        console.log(error);
    }
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the array of objects to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(vaccines.value);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vaccines');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'vaccines.xlsx');
}

const showAddVaccineModalFun = () => {
    const modal = document.getElementById('my_modal_2');
    modal.showModal();
};

const showAddVaccineModal = ref(true);

const updateDeletedVaccineLocally = (vaccineId) => {
    const vaccineIndexInDefaultArray = filteredAndSortedVaccines.value.findIndex(vaccine => vaccine.id === vaccineId);
    const vaccineIndexInSearchedVaccines = searchedVaccines.value.findIndex(vaccine => vaccine.id === vaccineId);

    if (vaccineIndexInDefaultArray !== -1) {
        filteredAndSortedVaccines.value.splice(vaccineIndexInDefaultArray, 1);
    }
    if (vaccineIndexInSearchedVaccines !== -1) {
        searchedVaccines.value.splice(vaccineIndexInSearchedVaccines, 1);
    }
};

const vaccineToDelete = ref(null);
const deleteVaccineConfirmation = (vaccine) => {
    vaccineToDelete.value = vaccine;
    const modal = document.getElementById('modal_delete_vaccine_confirmation');
    modal.showModal();
};
const showDeleteConfirmationModal = ref(true);
const deleteVaccine = async () => {
    try {
        const res = await axios.post('/delete-vaccine', {
            vaccineId: vaccineToDelete.value.id
        });
        showDeleteConfirmationModal.value = false;
        toast.success('Success', {
            description: res.data.message,
            duration: 5000,
        });
        updateDeletedVaccineLocally(vaccineToDelete.value.id);
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

const patientEmail = ref('')
const nurseEmail = ref('')
const vaccineName = ref('')
const serialNumber = ref('')
const doseNumber = ref('')
const dateGiven = ref('')
const note = ref('')


const addVaccine = async () => {
    const button = document.getElementById('addVaccine-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/add-vaccine', {
            patientEmail: patientEmail.value,
            nurseEmail: nurseEmail.value,
            vaccineName: vaccineName.value,
            serialNumber: serialNumber.value,
            doseNumber: doseNumber.value,
            dateGiven: dateGiven.value,
            note: note.value,
        }).then(async (res) => {
            toast.success(res.data.message);
            showAddVaccineModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddVaccineModal.value = true;
            const objectToAdd = {
                id: res.data.newVaccine.id,
                patient_name: res.data.newVaccine.patient_name,
                nurse_name: res.data.newVaccine.nurse_name,
                vaccine_name: res.data.newVaccine.vaccine_name,
                serial_number: res.data.newVaccine.serial_number,
                dose_number: res.data.newVaccine.dose_number,
                date_given: res.data.newVaccine.date_given,
                note: res.data.newVaccine.note,
                patient_email: res.data.newVaccine.patient_email,
                nurse_email: res.data.newVaccine.nurse_email
            };
            vaccines.value.push(objectToAdd);
            if (searchedVaccines.value) {
                searchedVaccines.value.push(objectToAdd);
            }
        }).catch(async (error) => {
            toast.error(error.response.data.error);
            showAddVaccineModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddVaccineModal.value = true;
        });
    } catch (error) {
        console.log(error);
        toast.error(error);
        showAddVaccineModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showAddVaccineModal.value = true;
    }
    button.innerHTML = 'Add Vaccine';
};

const showEditVaccineModal = ref(true);
const editableVaccineId = ref(null);
const vaccineForEdit = ref(null);
const editPatientEmail = ref('');
const editNurseEmail = ref('');
const editVaccineName = ref('');
const editSerialNumber = ref('');
const editDoseNumber = ref('');
const editDateGiven = ref('');
const editNote = ref('')

const showEditVaccineModalFunc = (vaccine) => {
    const modal = document.getElementById('my_edit_modal');
    editableVaccineId.value = vaccine.id;
    vaccineForEdit.value = vaccine;
    editPatientEmail.value = vaccine.patient_email;
    editNurseEmail.value = vaccine.nurse_email;
    editVaccineName.value = vaccine.vaccine_name;
    editSerialNumber.value = vaccine.serial_number;
    editDoseNumber.value = vaccine.dose_number;
    editDateGiven.value = vaccine.date_given;
    editNote.value = vaccine.note;
    modal.showModal();
};

const editVaccine = async () => {
    const button = document.getElementById('editVaccine-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        const response = await axios.post('/update-vaccine', {
            vaccineId: editableVaccineId.value,
            patientEmail: editPatientEmail.value,
            nurseEmail: editNurseEmail.value,
            vaccineName: editVaccineName.value,
            serialNumber: editSerialNumber.value,
            doseNumber: editDoseNumber.value,
            dateGiven: editDateGiven.value,
            note: editNote.value
        });
        updateVaccineDetailsLocally(
                editableVaccineId.value,
                response.data.updatedVaccine.patient_name,
                editPatientEmail.value,
                response.data.updatedVaccine.nurse_name,
                editNurseEmail.value,
                editVaccineName.value,
                editSerialNumber.value,
                editDoseNumber.value,
                editDateGiven.value,
                editNote.value
        );
        showEditVaccineModal.value = false;
        toast.success(response.data.message, {
            description: 'Vaccine has been updated successfully',
            duration: 5000,
        });

        await new Promise(resolve => setTimeout(resolve, 500));
        showEditVaccineModal.value = true;

    } catch (error) {
        showEditVaccineModal.value = false;
        toast.error(error.response.data.message, {
            description: 'Vaccine could not be updated. Please try again.',
            duration: 5000,
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        showEditVaccineModal.value = true;
        console.log(error);
    }
    button.innerHTML = 'Update Vaccine';
};


const updateVaccineDetailsLocally = (vaccineId, patientName, patientEmail, nurseName, nurseEmail, vaccineName, serialNumber,
 doseNumber, dateGiven, note) => {
    const vaccineIndexInDefaultArray = filteredAndSortedVaccines.value.find(vaccine => vaccine.id === vaccineId);
    const vaccineIndexInSearchedVaccines = searchedVaccines.value.find(vaccine => vaccine.id === vaccineId);

    if (vaccineIndexInDefaultArray) {
        vaccineIndexInDefaultArray.patient_name = patientName;
        vaccineIndexInDefaultArray.patient_email = patientEmail;
        vaccineIndexInDefaultArray.nurse_name = nurseName;
        vaccineIndexInDefaultArray.nurse_email = nurseEmail;
        vaccineIndexInDefaultArray.vaccine_name = vaccineName;
        vaccineIndexInDefaultArray.serial_number = serialNumber;
        vaccineIndexInDefaultArray.dose_number = doseNumber;
        vaccineIndexInDefaultArray.date_given = dateGiven;
        vaccineIndexInDefaultArray.note = note;
    }
    if (vaccineIndexInSearchedVaccines) {
        vaccineIndexInSearchedVaccines.patient_name = patientName;
        vaccineIndexInSearchedVaccines.patient_email = patientEmail;
        vaccineIndexInSearchedVaccines.nurse_name = nurseName;
        vaccineIndexInSearchedVaccines.nurse_email = nurseEmail;
        vaccineIndexInSearchedVaccines.vaccine_name = vaccineName;
        vaccineIndexInSearchedVaccines.serial_number = serialNumber;
        vaccineIndexInSearchedVaccines.dose_number = doseNumber;
        vaccineIndexInSearchedVaccines.date_given = dateGiven;
        vaccineIndexInSearchedVaccines.note = note;
    }
};

</script>




<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen">
        <Toaster richColors position="top-right" />
        <SideBar />
        <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
            <Header />

            <Breadcrumb first="Dashboard" second="Monitor Hospital" third="Vaccine"
                firstIcon='<i class="fa-solid fa-gauge"></i>' secondIcon='<i class="fa-solid fa-square-h"></i>'
                thirdIcon='<i class="fa-solid fa-syringe"></i>' link="/admin-dashboard" />

            <!-- Table -->
            <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
                <!-- Search and Role Filter -->
                <div class="flex justify-between mb-4 gap-3 flex-col sm:flex-row">
                    <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
                        class="input input-bordered w-full dark:bg-slate-800 dark:text-gray-300" />
                    <button @click="showAddVaccineModalFun()"
                        class="bg-primarycolor text-white rounded-lg p-4 text-sm hover:bg-blue-500 font-semibold w-full">Add
                        Vaccine</button>
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
                                <th @click="sortBy('nurse_name')" class="cursor-pointer dark:text-gray-300">
                                    Nurse Name
                                    <span>{{ getSortIcon('nurse_name') }}</span>
                                </th>
                                <th @click="sortBy('nurse_email')" class="cursor-pointer dark:text-gray-300">
                                    Nurse Email
                                    <span>{{ getSortIcon('nurse_email') }}</span>
                                </th>
                                <th @click="sortBy('vaccine_name')" class="cursor-pointer dark:text-gray-300">
                                    Vaccine
                                    <span>{{ getSortIcon('vaccine_name') }}</span>
                                </th>
                                <th @click="sortBy('serial_number')" class="cursor-pointer dark:text-gray-300">
                                    Serial Number
                                    <span>{{ getSortIcon('serial_number') }}</span>
                                </th>
                                <th @click="sortBy('dose_number')" class="cursor-pointer dark:text-gray-300">
                                    Dose Number
                                    <span>{{ getSortIcon('dose_number') }}</span>
                                </th>
                                <th @click="sortBy('date_given')" class="cursor-pointer dark:text-gray-300">
                                    Date
                                    <span>{{ getSortIcon('date_given') }}</span>
                                </th>
                                <th @click="sortBy('note')" class="cursor-pointer dark:text-gray-300">
                                    Note
                                    <span>{{ getSortIcon('note') }}</span>
                                </th>
                                <th class="dark:text-gray-300">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr v-if="searchQuery" v-for="vaccine in searchedVaccines" :key="vaccine.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ vaccine.patient_name }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ vaccine.patient_email }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300"> 
                                    {{ vaccine.nurse_name }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ vaccine.nurse_email }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ vaccine.vaccine_name }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ vaccine.serial_number }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ vaccine.dose_number }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ vaccine.date_given }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ vaccine.note }}
                                </td>
                                <td class="flex gap-1">
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditVaccineModalFunc(vaccine)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteVaccineConfirmation(vaccine)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <tr v-else v-for="vac in filteredAndSortedVaccines" :key="vac.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ vac.patient_name }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ vac.patient_email }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ vac.nurse_name }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ vac.nurse_email }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ vac.vaccine_name }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ vac.serial_number }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ vac.dose_number }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ vac.date_given }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ vac.note ? vac.note : 'No Notes' }}
                                </td>
                                <td class="flex gap-1">
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditVaccineModalFunc(vac)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteVaccineConfirmation(vac)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <!-- Add Vaccine Modal -->
                            <dialog v-if="showAddVaccineModal" id="my_modal_2" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Vaccine Details</h3>

                                        <!-- Patient Name Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Patient Email</span>
                                            <input type="text" placeholder="Enter Patient Email" v-model="patientEmail"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Nurse Email Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Nurse Email</span>
                                            <input type="text" placeholder="Enter Nurse Email" v-model="nurseEmail"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Vaccine Email Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Vaccine Name</span>
                                            <input type="text" placeholder="Enter Vaccine Name" v-model="vaccineName"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Serial Number Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Serial Number</span>
                                            <input type="text" placeholder="Enter Serial Number" v-model="serialNumber"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Dose Number Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Dose Number</span>
                                            <input type="number" placeholder="Enter Dose Number" v-model="doseNumber"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Date Given Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Date Given</span>
                                            <input type="date" v-model="dateGiven"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Note Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Note</span>
                                            <textarea placeholder="Enter Note" v-model="note"
                                                class="textarea textarea-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300"></textarea>
                                        </label>

                                        <div class="modal-action">
                                            <button @click="addVaccine" id="addVaccine-button"
                                                class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-16">
                                                Add Vaccine
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeModal">Close</button>
                                </form>
                            </dialog>





                            <!-- Edit Medicine Modal -->
                            <dialog v-if="showEditVaccineModal" id="my_edit_modal" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Vaccine Details</h3>

                                        <!-- Patient Name Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Patient Email</span>
                                            <input type="text" placeholder="Enter Patient Email" v-model="editPatientEmail"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Nurse Email Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Nurse Email</span>
                                            <input type="text" placeholder="Enter Nurse Email" v-model="editNurseEmail"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Vaccine Email Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Vaccine Name</span>
                                            <input type="text" placeholder="Enter Vaccine Name" v-model="editVaccineName"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Serial Number Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Serial Number</span>
                                            <input type="text" placeholder="Enter Serial Number" v-model="editSerialNumber"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Dose Number Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Dose Number</span>
                                            <input type="number" placeholder="Enter Dose Number" v-model="editDoseNumber"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Date Given Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Date Given</span>
                                            <input type="date" v-model="editDateGiven"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Note Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Note</span>
                                            <textarea placeholder="Enter Note" v-model="editNote"
                                                class="textarea textarea-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300"></textarea>
                                        </label>

                                        <div class="modal-action">
                                            <button @click="editVaccine" id="editVaccine-button"
                                                class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-16">
                                                Add Vaccine
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeEditModal">Close</button>
                                </form>
                            </dialog>




                            <!-- Modal Delete Death Report Confirmation -->
                            <dialog v-if="showDeleteConfirmationModal" id="modal_delete_vaccine_confirmation"
                                class="modal modal-bottom sm:modal-middle">
                                <div class="modal-box dark:bg-slate-700">
                                    <h3 class="text-lg font-bold dark:text-gray-300">Confirm Delete Vaccine</h3>
                                    <p class="py-4 text-red-600 font-semibold">Are you sure you want to delete the
                                        selected vaccine?</p>
                                    <div class="modal-action">
                                        <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                            @click="deleteVaccine">Yes</button>

                                        <form method="dialog">
                                            <button
                                                class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-1000">Close</button>
                                        </form>
                                    </div>
                                </div>
                            </dialog>
                        </tbody>
                    </table>
                    <div v-if="!vaccines" class="animate-pulse w-full">
                        <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                    </div>
                </div>
                <!-- Pagination -->
                <SearchVaccinesPagination :searchQuery="searchQuery" v-if="searchQuery" />
                <VaccinesPagination v-else />
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