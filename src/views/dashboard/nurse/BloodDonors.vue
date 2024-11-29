<script setup>
import SideBar from '../../../components/dashboard/SideBar.vue';
import Header from '../../../components/dashboard/Header.vue';
import Breadcrumb from '../../../components/dashboard/Breadcrumb.vue';
import { onMounted, ref, computed, watch } from 'vue';
import { useSideBar } from '../../../stores/sideBar.js';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'vue-sonner';
import { useFetchBloodDonors } from '../../../stores/fetchBloodDonors.js';
import SearchBloodDonorsPagination from '../../../components/dashboard/SearchBloodDonorsPagination.vue';
import BloodDonorsPagination from '../../../components/dashboard/BloodDonorsPagination.vue';


const allBloodDonors = useFetchBloodDonors();
const sideBar = useSideBar();
const bloodDonors = computed(() => allBloodDonors.data);

onMounted(() => {
    sideBar.isMonitorExpanded = true;
});

const searchQuery = ref('');
const sortKey = ref('');
const sortOrder = ref(1);

const searchedBloodDonors = computed(() => {
    let filteredBloodDonors = allBloodDonors.searchedBloodDonors || [];
    if (sortKey.value) {
        filteredBloodDonors.sort((a, b) => {
            const aValue = a[sortKey.value] || '';
            const bValue = b[sortKey.value] || '';
            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }

    return filteredBloodDonors;
});

watch(() => searchQuery.value, async () => {
    if (searchQuery.value < 1) {
        await allBloodDonors.fetchBloodDonors();
    }
});

const captureSearchQuery = async () => {
    await allBloodDonors.fetchSearchedBloodDonors(1, searchQuery.value);
    searchedBloodDonors.value = allBloodDonors.searchedBloodDonors;
    return searchedBloodDonors.value;
};

const filteredAndSortedBloodDonors = computed(() => {
    const filteredBloodDonors = bloodDonors.value || [];
    if (sortKey.value) {
        filteredBloodDonors.sort((a, b) => {
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
    return filteredBloodDonors;
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
    const bloodDonors = ref([]);
    try {
        await axios.get('/fetch-all-blood-donors').then((res) => {
            bloodDonors.value = res.data.bloodDonors;
        }).catch((err) => {
            console.log(err);
        });
    } catch (error) {
        console.log(error);
    }
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the array of objects to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(bloodDonors.value);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BloodDonors');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'bloodDonors.xlsx');
}

const showAddBloodDonorModalFun = () => {
    const modal = document.getElementById('my_modal_2');
    modal.showModal();
};

const showAddBloodDonorModal = ref(true);

const updateDeletedBloodDonorLocally = (bloodDonorId) => {
    const bloodDonorIndexInDefaultArray = filteredAndSortedBloodDonors.value.findIndex(bloodDonor => bloodDonor.id === bloodDonorId);
    const bloodDonorIndexInSearchedBloodDonors = searchedBloodDonors.value.findIndex(bloodDonor => bloodDonor.id === bloodDonorId);

    if (bloodDonorIndexInDefaultArray !== -1) {
        filteredAndSortedBloodDonors.value.splice(bloodDonorIndexInDefaultArray, 1);
    }
    if (bloodDonorIndexInSearchedBloodDonors !== -1) {
        searchedBloodDonors.value.splice(bloodDonorIndexInSearchedBloodDonors, 1);
    }
};

const bloodDonorToDelete = ref(null);
const deleteBloodDonorConfirmation = (bloodDonor) => {
    console.log(bloodDonor)
    bloodDonorToDelete.value = bloodDonor;
    const modal = document.getElementById('modal_delete_bloodDonor_confirmation');
    modal.showModal();
};
const showDeleteConfirmationModal = ref(true);
const deleteBloodDonor = async () => {
    try {
        console.log(bloodDonorToDelete.value.id)
        const res = await axios.post('/delete-blood-donor', {
            bloodDonorId: bloodDonorToDelete.value.id
        });
        showDeleteConfirmationModal.value = false;
        toast.success('Success', {
            description: res.data.message,
            duration: 5000,
        });
        updateDeletedBloodDonorLocally(bloodDonorToDelete.value.id);
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

const donorName = ref('')
const donorAge = ref('')
const donorSex = ref('')
const quantity = ref('')
const bloodName = ref('')
const bloodType = ref('')
const lastDonationDate = ref('')
const identityCardId = ref('')


const addBloodDonor = async () => {
    const button = document.getElementById('addDepartment-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/add-blood-donor', {
            donorName: donorName.value,
            donorAge: donorAge.value,
            donorSex: donorSex.value,
            quantity: quantity.value,
            bloodName: bloodName.value,
            bloodType: bloodType.value,
            lastDonationDate: lastDonationDate.value,
            identityCardId: identityCardId.value
        }).then(async (res) => {
            console.log(res.data.newBloodDonor.id)
            toast.success(res.data.message);
            showAddBloodDonorModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddBloodDonorModal.value = true;
            const objectToAdd = {
                id: res.data.newBloodDonor.id,
                name: res.data.newBloodDonor.name,
                age: res.data.newBloodDonor.age,
                sex: res.data.newBloodDonor.sex,
                quantity: res.data.newBloodDonor.quantity,
                blood_name: res.data.newBloodDonor.blood_name,
                blood_type: res.data.newBloodDonor.blood_type,
                last_donation_date: res.data.newBloodDonor.last_donation_date,
                identity_card_id: res.data.newBloodDonor.identity_card_id,

            };
            bloodDonors.value.push(objectToAdd);
            if (searchedBloodDonors.value) {
                searchedBloodDonors.value.push(objectToAdd);
            }
        }).catch(async (error) => {
            toast.error(error.response.data.error);
            showAddBloodDonorModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddBloodDonorModal.value = true;
        });
    } catch (error) {
        console.log(error);
        toast.error(error);
        showAddBloodDonorModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showAddBloodDonorModal.value = true;
    }
    button.innerHTML = 'Add Blood Donor';
};


const showEditBloodDonorModal = ref(true)
const editableBloodDonorId = ref(null)
const bloodDonorForEdit = ref(null)
const editBloodDonorName = ref('')
const editBloodDonorAge = ref('')
const editBloodDonorSex = ref('')
const editQuantity = ref('')
const editBloodName = ref('')
const editBloodType = ref('')
const editLastDonationDate = ref('')
const editIdentityCardId = ref('')


const showEditBloodDonorModalFunc = (bloodDonor) => {
    const modal = document.getElementById('my_edit_modal');
    editableBloodDonorId.value = bloodDonor.id
    bloodDonorForEdit.value = bloodDonor
    editBloodDonorName.value = bloodDonor.name
    editBloodDonorAge.value = bloodDonor.age
    editBloodDonorSex.value = bloodDonor.sex
    editQuantity.value = bloodDonor.quantity
    editBloodName.value = bloodDonor.blood_name
    editBloodType.value = bloodDonor.blood_type
    editLastDonationDate.value = bloodDonor.last_donation_date
    editIdentityCardId.value = bloodDonor.identity_card_id

    modal.showModal();
};


const editBloodDonor = async () => {
    const button = document.getElementById('editDepartment-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        console.log(editableBloodDonorId.value)
        await axios.post('/update-blood-donor', {
            bloodId: editableBloodDonorId.value,
            bloodName: editBloodName.value,
            bloodType: editBloodType.value,
            quantity: editQuantity.value,
            donorName: editBloodDonorName.value,
            donorAge: editBloodDonorAge.value,
            donorSex: editBloodDonorSex.value,
            lastDonationDate: editLastDonationDate.value,
            identityCardId: editIdentityCardId.value,
        }).then(async (res) => {
            toast.success(res.data.message);
            showEditBloodDonorModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showEditBloodDonorModal.value = true;
            updateBloodDonorDetailsLocally(
                editableBloodDonorId.value,
                editBloodDonorName.value,
                editBloodDonorAge.value,
                editBloodDonorSex.value,
                editQuantity.value,
                editBloodName.value,
                editBloodType.value,
                editLastDonationDate.value,
                editIdentityCardId.value
            );
        }).catch(async (error) => {
            console.log(error)
            toast.error(error.message);
            showEditBloodDonorModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showEditBloodDonorModal.value = true;
        });
    } catch (error) {
        console.log(error)
        toast.error(error);
        showEditBloodDonorModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showEditBloodDonorModal.value = true;
    }
    button.innerHTML = 'Edit Blood Donor';
};

const updateBloodDonorDetailsLocally = (bloodDonorId, name, age, sex, quantity, bloodName, bloodType, lastDonationDate, identityCardId) => {
    const bloodDonorIndexInDefaultArray = filteredAndSortedBloodDonors.value.find(bloodDonor => bloodDonor.id === bloodDonorId);
    const bloodDonorIndexInSearchedBloodDonors = searchedBloodDonors.value.find(bloodDonor => bloodDonor.id === bloodDonorId);

    if (bloodDonorIndexInDefaultArray) {
        bloodDonorIndexInDefaultArray.blood_name = bloodName;
        bloodDonorIndexInDefaultArray.blood_type = bloodType;
        bloodDonorIndexInDefaultArray.quantity = quantity;
        bloodDonorIndexInDefaultArray.name = name;
        bloodDonorIndexInDefaultArray.age = age;
        bloodDonorIndexInDefaultArray.sex = sex;
        bloodDonorIndexInDefaultArray.last_donation_date = lastDonationDate;
        bloodDonorIndexInDefaultArray.identity_card_id = identityCardId;
    }
    if (bloodDonorIndexInSearchedBloodDonors) {
        bloodDonorIndexInSearchedBloodDonors.blood_name = bloodName;
        bloodDonorIndexInSearchedBloodDonors.blood_type = bloodType;
        bloodDonorIndexInSearchedBloodDonors.quantity = quantity;
        bloodDonorIndexInSearchedBloodDonors.name = name;
        bloodDonorIndexInSearchedBloodDonors.age = age;
        bloodDonorIndexInSearchedBloodDonors.sex = sex;
        bloodDonorIndexInSearchedBloodDonors.last_donation_date = lastDonationDate;
        bloodDonorIndexInSearchedBloodDonors.identity_card_id = identityCardId;
    }
};


</script>





<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen">
        <Toaster richColors position="top-right" />
        <SideBar />
        <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
            <Header />

            <Breadcrumb first="Dashboard" second="Monitor Hospital" third="Blood Donor"
                firstIcon='<i class="fa-solid fa-gauge"></i>' secondIcon='<i class="fa-solid fa-square-h"></i>'
                thirdIcon='<i class="fa-solid fa-prescription-bottle"></i>' link="/admin-dashboard" />

            <!-- Table -->
            <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
                <!-- Search and Role Filter -->
                <div class="flex justify-between mb-4 gap-3 flex-col sm:flex-row">
                    <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
                        class="input input-bordered w-full dark:bg-slate-800 dark:text-gray-300" />
                    <button @click="showAddBloodDonorModalFun()"
                        class="bg-primarycolor text-white rounded-lg p-4 text-sm hover:bg-blue-500 font-semibold w-full">Add
                        Blood Donor</button>
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
                                    Blood Donor Name
                                    <span>{{ getSortIcon('name') }}</span>
                                </th>
                                <th @click="sortBy('age')" class="cursor-pointer dark:text-gray-300">
                                    Blood Donor Age
                                    <span>{{ getSortIcon('age') }}</span>
                                </th>
                                <th @click="sortBy('sex')" class="cursor-pointer dark:text-gray-300">
                                    Blood Donor Sex
                                    <span>{{ getSortIcon('sex') }}</span>
                                </th>
                                <th @click="sortBy('blood_name')" class="cursor-pointer dark:text-gray-300">
                                    Blood Name
                                    <span>{{ getSortIcon('blood_name') }}</span>
                                </th>
                                <th @click="sortBy('blood_type')" class="cursor-pointer dark:text-gray-300">
                                    Blood Type
                                    <span>{{ getSortIcon('blood_type') }}</span>
                                </th>
                                <th @click="sortBy('quantity')" class="cursor-pointer dark:text-gray-300">
                                    Quantity
                                    <span>{{ getSortIcon('quantity') }}</span>
                                </th>
                                <th @click="sortBy('last_donation_time')" class="cursor-pointer dark:text-gray-300">
                                    Last Donation Date
                                    <span>{{ getSortIcon('last_donation_time') }}</span>
                                </th>
                                <th class="cursor-pointer dark:text-gray-300">
                                    Identity Card ID
                                </th>
                                <th class="dark:text-gray-300">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr v-if="searchQuery" v-for="bloodDonor in searchedBloodDonors" :key="bloodDonor.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ bloodDonor.name }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ bloodDonor.age }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ bloodDonor.sex }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ bloodDonor.blood_name }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ bloodDonor.blood_type }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ bloodDonor.quantity }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ bloodDonor.last_donation_date }}
                                </td>
                                <td>
                                    {{ bloodDonor.identity_card_id }}
                                </td>
                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditBloodDonorModalFunc(bloodDonor)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteBloodDonorConfirmation(bloodDonor)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <tr v-else v-for="blo in filteredAndSortedBloodDonors" :key="blo.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ blo.name }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ blo.age }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ blo.sex }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ blo.blood_name }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ blo.blood_type }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ blo.quantity }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ blo.last_donation_date }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ blo.identity_card_id }}
                                </td>
                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditBloodDonorModalFunc(blo)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteBloodDonorConfirmation(blo)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <!-- Add Blood Donor Modal -->
                            <dialog v-if="showAddBloodDonorModal" id="my_modal_2" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Blood Donor Details</h3>

                                        <!-- Donor Name Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Donor Name</span>
                                            <input type="text" placeholder="Enter Donor Name" v-model="donorName"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Donor Age Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Donor Age</span>
                                            <input type="number" placeholder="Enter Donor Age" v-model="donorAge"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Donor Sex Select -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Donor Sex</span>
                                            <select v-model="donorSex"
                                                class="select select-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300">
                                                <option value="" disabled>Select Donor Sex</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <!-- Add more options as needed -->
                                            </select>
                                        </label>

                                        <!-- Blood Name Select -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Blood Name</span>
                                            <select v-model="bloodName"
                                                class="select select-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300">
                                                <option value="" disabled>Select Blood Name</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                                <!-- Add more blood types as needed -->
                                            </select>
                                        </label>

                                        <!-- Blood Type Select -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Blood Type</span>
                                            <select v-model="bloodType"
                                                class="select select-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300">
                                                <option value="" disabled>Select Blood Type</option>
                                                <option value="Plasma">Plasma</option>
                                                <option value="Red Cells">Red Cells</option>
                                                <option value="Platelets">Platelets</option>
                                                <!-- Add more blood types as needed -->
                                            </select>
                                        </label>

                                        <!-- Quantity Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Quantity</span>
                                            <input type="number" placeholder="Enter Quantity" v-model="quantity"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Last Donation Date Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Last Donation Date</span>
                                            <input type="date" v-model="lastDonationDate"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Identity Card ID Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Identity Card ID</span>
                                            <input type="text" placeholder="Enter Identity Card ID"
                                                v-model="identityCardId"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>
                                    </div>
                                    <div class="modal-action">
                                        <button @click="addBloodDonor" id="addDepartment-button"
                                            class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-12">Add
                                            Blood Donor</button>
                                    </div>
                                </div>
                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeModal">Close</button>
                                </form>
                            </dialog>



                            <!-- Edit Blood Donor Modal -->
                            <dialog v-if="showEditBloodDonorModal" id="my_edit_modal" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div v-if="bloodDonorForEdit" class="py-4 flex flex-col gap-3">
                                        <!-- Blood Donor Name Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Blood Donor Name</span>
                                            <input type="text" v-model="editBloodDonorName"
                                                placeholder="Enter Blood Donor Name"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Blood Donor Age Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Blood Donor Age</span>
                                            <input type="number" v-model="editBloodDonorAge"
                                                placeholder="Enter Blood Donor Age"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Blood Donor Sex Select -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Blood Donor Sex</span>
                                            <select v-model="editBloodDonorSex"
                                                class="select select-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300">
                                                <option value="" disabled>Select Sex</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </label>

                                        <!-- Quantity Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Quantity</span>
                                            <input type="number" v-model="editQuantity" placeholder="Enter Quantity"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Blood Name Select -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Blood Name</span>
                                            <select v-model="editBloodName"
                                                class="select select-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300">
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                            </select>
                                        </label>

                                        <!-- Blood Type Select -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Blood Type</span>
                                            <select v-model="editBloodType"
                                                class="select select-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300">
                                                <option value="Plasma">Plasma</option>
                                                <option value="Red Cells">Red Cells</option>
                                                <option value="Platelets">Platelets</option>
                                            </select>
                                        </label>

                                        <!-- Last Donation Date Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Last Donation Date</span>
                                            <input type="date" v-model="editLastDonationDate"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Identity Card ID Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Identity Card ID</span>
                                            <input type="text" v-model="editIdentityCardId"
                                                placeholder="Enter Identity Card ID"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>
                                    </div>

                                    <div class="modal-action">
                                        <button @click="editBloodDonor" id="editDepartment-button"
                                            class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-14">Update
                                            Blood Donor</button>
                                    </div>
                                </div>
                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeModal">close</button>
                                </form>
                            </dialog>



                            <!-- Modal Delete Blood Donor Confirmation -->
                            <dialog v-if="showDeleteConfirmationModal" id="modal_delete_bloodDonor_confirmation"
                                class="modal modal-bottom sm:modal-middle">
                                <div class="modal-box dark:bg-slate-700">
                                    <h3 class="text-lg font-bold dark:text-gray-300">Confirm Delete Blood Donor</h3>
                                    <p class="py-4 text-red-600 font-semibold">Are you sure you want to delete the
                                        selected blood donor?</p>
                                    <div class="modal-action">
                                        <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                            @click="deleteBloodDonor">Yes</button>

                                        <form method="dialog">
                                            <button
                                                class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-100">Close</button>
                                        </form>
                                    </div>
                                </div>
                            </dialog>
                        </tbody>
                        <!-- foot -->
                    </table>
                    <div v-if="!bloodDonors" class="animate-pulse w-full">
                        <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                    </div>
                </div>

                <!-- Pagination -->
                <SearchBloodDonorsPagination :searchQuery="searchQuery" v-if="searchQuery" />
                <BloodDonorsPagination v-else />
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