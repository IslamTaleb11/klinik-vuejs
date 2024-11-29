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
import { useFetchBloods } from '../../stores/fetchBloodsBank';
import BloodsPagination from '../../components/dashboard/BloodsPagination.vue';
import SearchBloodsPagination from '../../components/dashboard/SearchBloodsPagination.vue';

const backendUrl = useBackendUrl();
const allBloods = useFetchBloods();
const sideBar = useSideBar();
const bloods = computed(() => allBloods.data);

onMounted(() => {
    sideBar.isMonitorExpanded = true;
});

const searchQuery = ref('');
const sortKey = ref('');
const sortOrder = ref(1);

const searchedBloods = computed(() => {
    let filteredBloods = allBloods.searchedBloods || [];
    if (sortKey.value) {
        filteredBloods.sort((a, b) => {
            const aValue = a[sortKey.value] || '';
            const bValue = b[sortKey.value] || '';
            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }

    return filteredBloods;
});

watch(() => searchQuery.value, async () => {
    if (searchQuery.value < 1) {
        await allBloods.fetchBloods();
    }
});

const captureSearchQuery = async () => {
    await allBloods.fetchSearchedBloods(1, searchQuery.value);
    searchedBloods.value = allBloods.searchedBloods;
    return searchedBloods.value;
};

const filteredAndSortedBloods = computed(() => {
    const filteredBloods = bloods.value || [];
    if (sortKey.value) {
        filteredBloods.sort((a, b) => {
            const aValue = a[sortKey.value] || '';
            const bValue = b[sortKey.value] || '';

            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }
    return filteredBloods;
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
    const bloods = ref([]);
    try {
        await axios.get('/fetch-all-bloods').then((res) => {
            bloods.value = res.data.bloods;
        }).catch((err) => {
            console.log(err);
        });
    } catch (error) {
        console.log(error);
    }
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the array of objects to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(bloods.value);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bloods');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'bloods.xlsx');
}

const showAddBloodModalFun = () => {
    const modal = document.getElementById('my_modal_2');
    modal.showModal();
};

const showAddBloodModal = ref(true);

const updateDeletedBloodLocally = (bloodId) => {
    const bloodIndexInDefaultArray = filteredAndSortedBloods.value.findIndex(blood => blood.id === bloodId);
    const bloodIndexInSearchedBloods = searchedBloods.value.findIndex(blood => blood.id === bloodId);

    if (bloodIndexInDefaultArray !== -1) {
        filteredAndSortedBloods.value.splice(bloodIndexInDefaultArray, 1);
    }
    if (bloodIndexInSearchedBloods !== -1) {
        searchedBloods.value.splice(bloodIndexInSearchedBloods, 1);
    }
};

const bloodToDelete = ref(null);
const deleteBloodConfirmation = (blood) => {
    bloodToDelete.value = blood;
    const modal = document.getElementById('modal_delete_blood_confirmation');
    modal.showModal();
};
const showDeleteConfirmationModal = ref(true);
const deleteBlood = async () => {
    try {
        const res = await axios.post('/delete-blood', {
            blood_id: bloodToDelete.value.id
        });
        showDeleteConfirmationModal.value = false;
        toast.success('Success', {
            description: res.data.message,
            duration: 5000,
        });
        updateDeletedBloodLocally(bloodToDelete.value.id);
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

const bloodName = ref('')
const bloodType = ref('')
const quantity = ref('')

const addBlood = async () => {
    const button = document.getElementById('addDepartment-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/add-blood', {
            bloodName: bloodName.value,
            bloodType: bloodType.value,
            quantity: quantity.value
        }).then(async (res) => {
            toast.success(res.data.message);
            showAddBloodModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddBloodModal.value = true;
            const objectToAdd = {
                id: res.data.newBlood.id,
                blood_name: res.data.newBlood.blood_name,
                blood_type: res.data.newBlood.blood_type,
                quantity: res.data.newBlood.quantity,
            };
            bloods.value.push(objectToAdd);
            if (searchedBloods.value) {
                searchedBloods.value.push(objectToAdd);
            }
        }).catch(async (error) => {
            toast.error(error.response.data.error);
            showAddBloodModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddBloodModal.value = true;
        });
    } catch (error) {
        console.log(error);
        toast.error(error);
        showAddBloodModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showAddBloodModal.value = true;
    }
    button.innerHTML = 'Add Blood';
};


const showEditBloodModal = ref(true)
const editableBloodId = ref(null)
const bloodForEdit = ref(null)
const editBloodName = ref('')
const editBloodType = ref('')
const editQuantity = ref('')

const showEditBloodModalFunc = (blood) => {
    const modal = document.getElementById('my_edit_modal');
    editableBloodId.value = blood.id;
    bloodForEdit.value = blood
    editQuantity.value = blood.quantity
    editBloodName.value = blood.blood_name
    editBloodType.value = blood.blood_type
    modal.showModal();
};


const editBlood = async () => {
    const button = document.getElementById('editDepartment-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/update-blood', {
            blood_id: editableBloodId.value,
            bloodName: editBloodName.value,
            bloodType: editBloodType.value,
            quantity: editQuantity.value
        }).then(async (res) => {
            toast.success(res.data.message);
            showEditBloodModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showEditBloodModal.value = true;
            updateBloodDetailsLocally(editableBloodId.value, editBloodName.value, editBloodType.value, editQuantity.value);
        }).catch(async (error) => {
            toast.error(error.message);
            showEditBloodModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showEditBloodModal.value = true;
        });
    } catch (error) {
        toast.error(error);
        showEditBloodModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showEditBloodModal.value = true;
    }
    button.innerHTML = 'Edit Blood';
};

const updateBloodDetailsLocally = (bloodId, name, type, quantity) => {
    const bloodIndexInDefaultArray = filteredAndSortedBloods.value.find(blood => blood.id === bloodId);
    const bloodIndexInSearchedBloods = searchedBloods.value.find(blood => blood.id === bloodId);

    if (bloodIndexInDefaultArray) {
        bloodIndexInDefaultArray.blood_name = name;
        bloodIndexInDefaultArray.blood_type = type;
        bloodIndexInDefaultArray.quantity = quantity;
    }
    if (bloodIndexInSearchedBloods) {
        console.log('im here');
        bloodIndexInSearchedBloods.blood_name = name;
        bloodIndexInSearchedBloods.blood_type = type;
        bloodIndexInSearchedBloods.quantity = quantity;
    }
};

</script>




<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen">
        <Toaster richColors position="top-right" />
        <SideBar />
        <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
            <Header />

            <Breadcrumb first="Dashboard" second="Monitor Hospital" third="Blood" firstIcon='<i class="fa-solid fa-gauge"></i>'
                secondIcon='<i class="fa-solid fa-square-h"></i>'
                thirdIcon='<i class="fa-solid fa-prescription-bottle"></i>' link="/admin-dashboard" />

            <!-- Table -->
            <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
                <!-- Search and Role Filter -->
                <div class="flex justify-between mb-4 gap-3 flex-col sm:flex-row">
                    <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
                        class="input input-bordered w-full dark:bg-slate-800 dark:text-gray-300" />
                    <button @click="showAddBloodModalFun()"
                        class="bg-primarycolor text-white rounded-lg p-4 text-sm hover:bg-blue-500 font-semibold w-full">Add
                        Blood</button>
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
                                <th @click="sortBy('bloodName')" class="cursor-pointer dark:text-gray-300">
                                    Blood Name
                                    <span>{{ getSortIcon('bloodName') }}</span>
                                </th>
                                <th @click="sortBy('bloodType')" class="cursor-pointer dark:text-gray-300">
                                    Blood Type
                                    <span>{{ getSortIcon('bloodType') }}</span>
                                </th>
                                <th @click="sortBy('quantity')" class="cursor-pointer dark:text-gray-300">
                                    Quantity
                                    <span>{{ getSortIcon('quantity') }}</span>
                                </th>
                                <th class="dark:text-gray-300">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr v-if="searchQuery" v-for="blood in searchedBloods" :key="blood.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ blood.blood_name }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ blood.blood_type }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ blood.quantity }}
                                </td>

                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditBloodModalFunc(blood)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteBloodConfirmation(blood)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <tr v-else v-for="blo in filteredAndSortedBloods" :key="blo.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ blo.blood_name }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ blo.blood_type }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ blo.quantity }}
                                </td>

                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditBloodModalFunc(blo)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteBloodConfirmation(blo)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <!-- Add Blood Modal -->
                            <dialog v-if="showAddBloodModal" id="my_modal_2" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Blood Details</h3>

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
                                    </div>
                                    <div class="modal-action">
                                        <button @click="addBlood" id="addDepartment-button"
                                            class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-12">Add
                                            Blood</button>
                                    </div>
                                </div>
                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeModal">close</button>
                                </form>
                            </dialog>


                            <!-- Edit Blood Modal -->
                            <dialog v-if="showEditBloodModal" id="my_edit_modal" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div v-if="bloodForEdit" class="py-4 flex flex-col gap-3">
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
                                                <!-- Add more blood types as needed -->
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
                                                <!-- Add more blood types as needed -->
                                            </select>
                                        </label>

                                        <!-- Quantity Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Quantity</span>
                                            <input type="number" placeholder="Enter Quantity" v-model="editQuantity"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>
                                    </div>
                                    <div class="modal-action">
                                        <button @click="editBlood" id="editDepartment-button"
                                            class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-12">Update
                                            Blood</button>
                                    </div>
                                </div>
                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeModal">close</button>
                                </form>
                            </dialog>

                            <!-- Modal Delete Blood Confirmation -->
                            <dialog v-if="showDeleteConfirmationModal" id="modal_delete_blood_confirmation"
                                class="modal modal-bottom sm:modal-middle">
                                <div class="modal-box dark:bg-slate-700">
                                    <h3 class="text-lg font-bold dark:text-gray-300">Confirm Delete Blood</h3>
                                    <p class="py-4 text-red-600 font-semibold">Are you sure you want to delete the
                                        selected blood?</p>
                                    <div class="modal-action">
                                        <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                            @click="deleteBlood">Yes</button>

                                        <form method="dialog">
                                            <button
                                                class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-100">Close</button>
                                        </form>
                                    </div>
                                </div>
                            </dialog>
                        </tbody>
                    </table>
                    <div v-if="!bloods" class="animate-pulse w-full">
                        <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                    </div>
                </div>
                <!-- Pagination -->
                <SearchBloodsPagination :searchQuery="searchQuery" v-if="searchQuery" />
                <BloodsPagination v-else />
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