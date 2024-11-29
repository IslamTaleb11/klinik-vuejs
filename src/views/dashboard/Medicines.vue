<script setup>
import SideBar from '../../components/dashboard/SideBar.vue';
import Header from '../../components/dashboard/Header.vue';
import Breadcrumb from '../../components/dashboard/Breadcrumb.vue';
import { onMounted, ref, computed, watch } from 'vue';
import { useSideBar } from '../../stores/sideBar.js';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'vue-sonner';
import { useFetchMedicines } from '../../stores/fetchMedicines.js';
import MedicinesPaginations from '../../components/dashboard/MedicinesPaginations.vue';
import SearchMedicinesPagination from '../../components/dashboard/SearchMedicinesPagination.vue';

const allMedicines = useFetchMedicines();
const sideBar = useSideBar();
const medicines = computed(() => allMedicines.data);

onMounted(() => {
    sideBar.isMonitorExpanded = true;
});

const searchQuery = ref('');
const sortKey = ref('');
const sortOrder = ref(1);

const searchedMedicines = computed(() => {
    let filteredMedicines = allMedicines.searchedMedicines || [];
    if (sortKey.value) {
        filteredMedicines.sort((a, b) => {
            const aValue = a[sortKey.value] || '';
            const bValue = b[sortKey.value] || '';
            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }

    return filteredMedicines;
});

watch(() => searchQuery.value, async () => {
    if (searchQuery.value < 1) {
        await allMedicines.fetchMedicines();
    }
});

const captureSearchQuery = async () => {
    await allMedicines.fetchSearchedMedicines(1, searchQuery.value);
    searchedMedicines.value = allMedicines.searchedMedicines;
    return searchedMedicines.value;
};

const filteredAndSortedMedicines = computed(() => {
    const filteredMedicines = medicines.value || [];
    if (sortKey.value) {
        filteredMedicines.sort((a, b) => {
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
    return filteredMedicines;
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
    const medicines = ref([]);
    try {
        await axios.get('/fetch-all-medicines').then((res) => {
            medicines.value = res.data.medicines;
        }).catch((err) => {
            console.log(err);
        });
    } catch (error) {
        console.log(error);
    }
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the array of objects to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(medicines.value);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Medicines');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'medicines.xlsx');
}

const showAddMedicineModalFun = () => {
    const modal = document.getElementById('my_modal_2');
    modal.showModal();
};

const showAddMedicineModal = ref(true);

const updateDeletedMedicineLocally = (medicineId) => {
    const medicineIndexInDefaultArray = filteredAndSortedMedicines.value.findIndex(medicine => medicine.id === medicineId);
    const medicineIndexInSearchedMedicines = searchedMedicines.value.findIndex(medicine => medicine.id === medicineId);

    if (medicineIndexInDefaultArray !== -1) {
        filteredAndSortedMedicines.value.splice(medicineIndexInDefaultArray, 1);
    }
    if (medicineIndexInSearchedMedicines !== -1) {
        searchedMedicines.value.splice(medicineIndexInSearchedMedicines, 1);
    }
};

const medicineToDelete = ref(null);
const deleteMedicineConfirmation = (medicine) => {
    medicineToDelete.value = medicine;
    const modal = document.getElementById('modal_delete_medicine_confirmation');
    modal.showModal();
};
const showDeleteConfirmationModal = ref(true);
const deleteMedicine = async () => {
    try {
        const res = await axios.post('/delete-medicine', {
            medicineId: medicineToDelete.value.id
        });
        showDeleteConfirmationModal.value = false;
        toast.success('Success', {
            description: res.data.message,
            duration: 5000,
        });
        updateDeletedMedicineLocally(medicineToDelete.value.id);
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
const medicineName = ref('')
const medicineCategory = ref('')
const medicineDescription = ref('')
const medicinePrice = ref('')
const manufacturingCompany = ref('')
const medicineStatus = ref('')
const expirationDate = ref('')
const quantity = ref('')

const addMedicine = async () => {
    const button = document.getElementById('addMedicine-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/add-medicine', {
            medicineName: medicineName.value,
            medicineCategory: medicineCategory.value,
            medicineDescription: medicineDescription.value,
            medicinePrice: medicinePrice.value,
            manufacturingCompany: manufacturingCompany.value,
            medicineStatus: medicineStatus.value,
            expirationDate: expirationDate.value,
            quantity: quantity.value
        }).then(async (res) => {
            toast.success(res.data.message);
            showAddMedicineModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddMedicineModal.value = true;
            const objectToAdd = {
                id: res.data.newMedicine.id,
                name: res.data.newMedicine.name,
                medicine_category: res.data.newMedicine.medicine_category,
                description: res.data.newMedicine.description,
                price: res.data.newMedicine.price,
                manufacturing_company: res.data.newMedicine.manufacturing_company,
                status: res.data.newMedicine.status,
                expiration_date: res.data.newMedicine.expiration_date,
                quantity: res.data.newMedicine.quantity,
            };
            medicines.value.push(objectToAdd);
            if (searchedMedicines.value) {
                searchedMedicines.value.push(objectToAdd);
            }
        }).catch(async (error) => {
            toast.error(error.response.data.error);
            showAddMedicineModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddMedicineModal.value = true;
        });
    } catch (error) {
        console.log(error);
        toast.error(error);
        showAddMedicineModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showAddMedicineModal.value = true;
    }
    button.innerHTML = 'Add Medicine';
};

const showEditMedicineModal = ref(true);
const editableMedicineId = ref(null);
const medicineForEdit = ref(null);
const editMedicineName = ref('');
const editMedicineCategory = ref('');
const editExpirationDate = ref('');
const editQuantity = ref('');
const editMedicinePrice = ref('');
const editMedicineStatus = ref('');
const editMedicineDescription = ref('')
const editManufacturingCompany = ref('')

const showEditMedicineModalFunc = (medicine) => {
    const modal = document.getElementById('my_edit_modal');
    editableMedicineId.value = medicine.id;
    medicineForEdit.value = medicine;
    editMedicineName.value = medicine.name;
    editMedicineCategory.value = medicine.medicine_category;
    editMedicineDescription.value = medicine.description;
    editMedicinePrice.value = medicine.price;
    editManufacturingCompany.value = medicine.manufacturing_company;
    editMedicineStatus.value = medicine.status;
    editExpirationDate.value = medicine.expiration_date;
    editQuantity.value = medicine.quantity;
    modal.showModal();
};

const editMedicine = async () => {
    const button = document.getElementById('editMedicine-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        const response = await axios.post('/update-medicine', {
            medicineId: editableMedicineId.value,
            medicineName: editMedicineName.value,
            medicineCategory: editMedicineCategory.value,
            medicineDescription: editMedicineDescription.value,
            medicinePrice: editMedicinePrice.value,
            manufacturingCompany: editManufacturingCompany.value,
            medicineStatus: editMedicineStatus.value,
            expirationDate: editExpirationDate.value,
            quantity: editQuantity.value,
        });
        toast.success(response.data.message);
        showEditMedicineModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showEditMedicineModal.value = true;
        updateMedicineDetailsLocally(editableMedicineId.value, editMedicineName.value, editMedicineCategory.value,
            editMedicineDescription.value, editMedicinePrice.value, editManufacturingCompany.value , editMedicineStatus.value, 
            editExpirationDate.value, editQuantity.value);

    } catch (error) {
        toast.error(error.response.data.message)
        showEditMedicineModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showEditMedicineModal.value = true;
        console.log(error);
    }
    button.innerHTML = 'Save changes';
};

const updateMedicineDetailsLocally = (medicineId, medicineName, medicineCategory, medicineDescription, medicinePrice, manufacturingCompany,
    medicineStatus, expirationDate, quantity
) => {
    const medicineIndexInDefaultArray = filteredAndSortedMedicines.value.findIndex(medicine => medicine.id === medicineId);
    const medicineIndexInSearchedMedicines = searchedMedicines.value.findIndex(medicine => medicine.id === medicineId);

    if (medicineIndexInDefaultArray !== -1) {
        filteredAndSortedMedicines.value[medicineIndexInDefaultArray] = {
            ...filteredAndSortedMedicines.value[medicineIndexInDefaultArray],
            name: medicineName,
            medicine_category: medicineCategory,
            description: medicineDescription,
            price: medicinePrice,
            manufacturing_company: manufacturingCompany,
            status: medicineStatus,
            expiration_date: expirationDate,
            quantity: quantity
        };
    }

    if (medicineIndexInSearchedMedicines !== -1) {
        searchedMedicines.value[medicineIndexInSearchedMedicines] = {
            ...searchedMedicines.value[medicineIndexInSearchedMedicines],
            name: medicineName,
            medicine_category: medicineCategory,
            description: medicineDescription,
            price: medicinePrice,
            manufacturing_company: manufacturingCompany,
            status: medicineStatus,
            expiration_date: expirationDate,
            quantity: quantity
        };
    }
};
</script>



<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen">
        <Toaster richColors position="top-right" />
        <SideBar />
        <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
            <Header />

            <Breadcrumb first="Dashboard" second="Monitor Hospital" third="Medicine"
                firstIcon='<i class="fa-solid fa-gauge"></i>' secondIcon='<i class="fa-solid fa-square-h"></i>'
                thirdIcon='<i class="fa-solid fa-capsules"></i>' link="/admin-dashboard" />

            <!-- Table -->
            <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
                <!-- Search and Role Filter -->
                <div class="flex justify-between mb-4 gap-3 flex-col sm:flex-row">
                    <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
                        class="input input-bordered w-full dark:bg-slate-800 dark:text-gray-300" />
                    <button @click="showAddMedicineModalFun()"
                        class="bg-primarycolor text-white rounded-lg p-4 text-sm hover:bg-blue-500 font-semibold w-full">Add
                        Medicine</button>
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
                                    Medicine Name
                                </th>
                                <th @click="sortBy('date')" class="cursor-pointer dark:text-gray-300">
                                    Medicine Category
                                    <span>{{ getSortIcon('date') }}</span>
                                </th>
                                <th @click="sortBy('patient_name')" class="cursor-pointer dark:text-gray-300">
                                    Description
                                    <span>{{ getSortIcon('patient_name') }}</span>
                                </th>
                                <th @click="sortBy('patient_email')" class="cursor-pointer dark:text-gray-300">
                                    Price
                                    <span>{{ getSortIcon('patient_email') }}</span>
                                </th>
                                <th @click="sortBy('doctor_name')" class="cursor-pointer dark:text-gray-300">
                                    Manufacturing Company
                                    <span>{{ getSortIcon('doctor_name') }}</span>
                                </th>
                                <th @click="sortBy('doctor_email')" class="cursor-pointer dark:text-gray-300">
                                    Medicine Status
                                    <span>{{ getSortIcon('doctor_email') }}</span>
                                </th>
                                <th @click="sortBy('doctor_email')" class="cursor-pointer dark:text-gray-300">
                                    Expiration Date
                                    <span>{{ getSortIcon('doctor_email') }}</span>
                                </th>
                                <th @click="sortBy('doctor_email')" class="cursor-pointer dark:text-gray-300">
                                    Quantity
                                    <span>{{ getSortIcon('doctor_email') }}</span>
                                </th>
                                <th class="dark:text-gray-300">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr v-if="searchQuery" v-for="medicine in searchedMedicines" :key="medicine.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ medicine.name }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ medicine.medicine_category }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ medicine.description }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ medicine.price }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ medicine.manufacturing_company }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ medicine.status }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ medicine.expiration_date }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ medicine.quantity }}
                                </td>
                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditMedicineModalFunc(medicine)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteMedicineConfirmation(medicine)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <tr v-else v-for="med in filteredAndSortedMedicines" :key="med.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ med.name }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ med.medicine_category }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ med.description }}
                                </td>
                                <td class="dark:text-gray-300">
                                    ${{ med.price }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ med.manufacturing_company }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ med.status }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ med.expiration_date }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ med.quantity }}
                                </td>
                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditMedicineModalFunc(med)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteMedicineConfirmation(med)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <!-- Add Medicine Modal -->
                            <dialog v-if="showAddMedicineModal" id="my_modal_2" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Medicine Details</h3>

                                        <!-- Medicine Name Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Medicine Name</span>
                                            <input type="text" placeholder="Enter Medicine Name" v-model="medicineName"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Medicine Category Select -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Medicine Category</span>
                                            <select v-model="medicineCategory" class="select select-bordered mt-2 dark:bg-slate-800 dark:text-gray-300">
                                                <option value="" disabled>Select Category</option>
                                                <option value="antibiotic">Antibiotic</option>
                                                <option value="analgesic">Analgesic</option>
                                                <option value="antipyretic">Antipyretic</option>
                                                <option value="antiseptic">Antiseptic</option>
                                                <option value="antiviral">Antiviral</option>
                                                <option value="antifungal">Antifungal</option>
                                                <option value="antihistamine">Antihistamine</option>
                                                <option value="antidepressant">Antidepressant</option>
                                                <option value="antidiabetic">Antidiabetic</option>
                                                <option value="antimalarial">Antimalarial</option>
                                                <option value="antitussive">Antitussive</option>
                                            </select>
                                        </label>

                                        <!-- Description Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Description</span>
                                            <textarea placeholder="Enter Description" v-model="medicineDescription"
                                                class="textarea textarea-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300"></textarea>
                                        </label>

                                        <!-- Price Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Price</span>
                                            <input type="number" placeholder="Enter Price" v-model="medicinePrice"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Manufacturing Company Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Manufacturing Company</span>
                                            <input type="text" placeholder="Enter Manufacturing Company"
                                                v-model="manufacturingCompany"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Medicine Status Select -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Medicine Status</span>
                                            <select v-model="medicineStatus" class="select select-bordered mt-2 dark:bg-slate-800 dark:text-gray-300">
                                                <option value="" disabled>Select Status</option>
                                                <option value="instock">In Stock</option>
                                                <option value="outofstock">Out of Stock</option>
                                            </select>
                                        </label>

                                        <!-- Expiration Date Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Expiration Date</span>
                                            <input type="date" v-model="expirationDate"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Quantity Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Quantity</span>
                                            <input type="number" placeholder="Enter Quantity" v-model="quantity"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <div class="modal-action">
                                            <button @click="addMedicine" id="addMedicine-button"
                                                class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-16">
                                                Add Medicine
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeModal">Close</button>
                                </form>
                            </dialog>





                            <!-- Edit Medicine Modal -->
                            <dialog v-if="showEditMedicineModal" id="my_edit_modal" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Edit Medicine Details</h3>

                                        <!-- Medicine Name Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Medicine Name</span>
                                            <input type="text" placeholder="Enter Medicine Name"
                                                v-model="editMedicineName"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Medicine Category Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Medicine Category</span>
                                            <select v-model="editMedicineCategory" class="select select-bordered mt-2 dark:bg-slate-800 dark:text-gray-300">
                                                <option value="" disabled>Select Category</option>
                                                <option value="antibiotic">Antibiotic</option>
                                                <option value="analgesic">Analgesic</option>
                                                <option value="antipyretic">Antipyretic</option>
                                                <option value="antiseptic">Antiseptic</option>
                                                <option value="antiviral">Antiviral</option>
                                                <option value="antifungal">Antifungal</option>
                                                <option value="antihistamine">Antihistamine</option>
                                                <option value="antidepressant">Antidepressant</option>
                                                <option value="antidiabetic">Antidiabetic</option>
                                                <option value="antimalarial">Antimalarial</option>
                                                <option value="antitussive">Antitussive</option>
                                            </select>
                                        </label>

                                        <!-- Medicine Description Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Medicine Description</span>
                                            <textarea placeholder="Enter Medicine Description"
                                                v-model="editMedicineDescription"
                                                class="textarea textarea-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300"></textarea>
                                        </label>

                                        <!-- Medicine Price Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Medicine Price</span>
                                            <input type="number" step="0.01" placeholder="Enter Medicine Price"
                                                v-model="editMedicinePrice"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Manufacturing Company Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Manufacturing Company</span>
                                            <input type="text" placeholder="Enter Manufacturing Company"
                                                v-model="editManufacturingCompany"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Medicine Status Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Medicine Status</span>
                                            <select v-model="editMedicineStatus" class="select select-bordered mt-2 dark:bg-slate-800 dark:text-gray-300">
                                                <option value="" disabled>Select Status</option>
                                                <option value="instock">In Stock</option>
                                                <option value="outofstock">Out of Stock</option>
                                            </select>
                                        </label>

                                        <!-- Expiration Date Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Expiration Date</span>
                                            <input type="date" v-model="editExpirationDate"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Quantity Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Quantity</span>
                                            <input type="number" placeholder="Enter Quantity" v-model="editQuantity"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <div class="modal-action">
                                            <button @click="editMedicine" id="editMedicine-button"
                                                class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-16">
                                                Update Medicine
                                            </button>
                                        </div>

                                    </div>
                                </div>

                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeEditModal">Close</button>
                                </form>
                            </dialog>




                            <!-- Modal Delete Death Report Confirmation -->
                            <dialog v-if="showDeleteConfirmationModal" id="modal_delete_medicine_confirmation"
                                class="modal modal-bottom sm:modal-middle">
                                <div class="modal-box dark:bg-slate-700">
                                    <h3 class="text-lg font-bold dark:text-gray-300">Confirm Delete Medicine</h3>
                                    <p class="py-4 text-red-600 font-semibold">Are you sure you want to delete the
                                        selected medicine?</p>
                                    <div class="modal-action">
                                        <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                            @click="deleteMedicine">Yes</button>

                                        <form method="dialog">
                                            <button
                                                class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-1000">Close</button>
                                        </form>
                                    </div>
                                </div>
                            </dialog>
                        </tbody>
                    </table>
                    <div v-if="!medicines" class="animate-pulse w-full">
                        <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                    </div>
                </div>
                <!-- Pagination -->
                <SearchMedicinesPagination :searchQuery="searchQuery" v-if="searchQuery" />
                <MedicinesPaginations v-else />
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