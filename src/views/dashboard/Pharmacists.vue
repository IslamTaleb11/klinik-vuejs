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
import { useFetchPharmacists } from '../../stores/fetchPharmacists';
import PharmacistsPagination from '../../components/dashboard/PharmacistsPagination.vue';
import SearchPharmacistsPagination from '../../components/dashboard/SearchPharmacistsPagination.vue';

const backendUrl = useBackendUrl();
const allPharmacists = useFetchPharmacists();
const sideBar = useSideBar();
const pharmacists = computed(() => allPharmacists.data);

onMounted(() => {
    sideBar.isResourcesExpanded = true;
});

const searchQuery = ref('');
const sortKey = ref('');
const sortOrder = ref(1);

const searchedPharmacists = computed(() => {
    let filteredPharmacists = allPharmacists.searchedPharmacists || [];
    if (sortKey.value) {
        filteredPharmacists.sort((a, b) => {
            const aValue = a[sortKey.value] || '';
            const bValue = b[sortKey.value] || '';
            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }

    return filteredPharmacists;
});

watch(() => searchQuery.value, async () => {
    if (searchQuery.value < 1) {
        await allPharmacists.fetchPharmacists();
    }
});

const captureSearchQuery = async () => {
    await allPharmacists.fetchSearchedPharmacists(1, searchQuery.value);
    searchedPharmacists.value = allPharmacists.searchedPharmacists;
    return searchedPharmacists.value;
};

const filteredAndSortedPharmacists = computed(() => {
    const filteredPharmacists = pharmacists.value || [];
    if (sortKey.value) {
        filteredPharmacists.sort((a, b) => {
            const aValue = a[sortKey.value] || '';
            const bValue = b[sortKey.value] || '';

            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }
    return filteredPharmacists;
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
    const pharmacists = ref([]);
    try {
        await axios.get('/fetch-all-pharmacists').then((res) => {
            pharmacists.value = res.data.pharmacists;
        }).catch((err) => {
            console.log(err);
        });
    } catch (error) {
        console.log(error);
    }
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the array of objects to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(pharmacists.value);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pharmacists');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'pharmacists.xlsx');
}

const showAddPharmacistModalFun = () => {
    const modal = document.getElementById('my_modal_2');
    modal.showModal();
};

const showAddPharmacistModal = ref(true);

const updateDeletedPharmacistLocally = (pharmacistId) => {
    const pharmacistIndexInDefaultArray = filteredAndSortedPharmacists.value.findIndex(pharmacist => pharmacist.id === pharmacistId);
    const pharmacistIndexInSearchedPharmacists = searchedPharmacists.value.findIndex(pharmacist => pharmacist.id === pharmacistId);

    if (pharmacistIndexInDefaultArray !== -1) {
        filteredAndSortedPharmacists.value.splice(pharmacistIndexInDefaultArray, 1);
    }
    if (pharmacistIndexInSearchedPharmacists !== -1) {
        searchedPharmacists.value.splice(pharmacistIndexInSearchedPharmacists, 1);
    }
};

const pharmacistToDelete = ref(null);
const deletePharmacistConfirmation = (pharmacist) => {
    pharmacistToDelete.value = pharmacist;
    const modal = document.getElementById('modal_delete_pharmacist_confirmation');
    modal.showModal();
};
const showDeleteConfirmationModal = ref(true);
const deletePharmacist = async () => {
    try {
        const res = await axios.post('/delete-pharmacist', {
            pharmacist_id: pharmacistToDelete.value.id
        });
        showDeleteConfirmationModal.value = false;
        toast.success('Success', {
            description: res.data.message,
            duration: 5000,
        });
        updateDeletedPharmacistLocally(pharmacistToDelete.value.id);
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

const email = ref('');

const addPharmacist = async () => {
    const button = document.getElementById('addDepartment-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/add-pharmacist', {
            email: email.value,
        }).then(async (res) => {
            toast.success(res.data.message);
            showAddPharmacistModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddPharmacistModal.value = true;
            const objectToAdd = {
                id: res.data.newPharmacist.id,
                name: res.data.newPharmacist.name,
                email: res.data.newPharmacist.email,
                avatar: res.data.newPharmacist.avatar,
                created_at: res.data.newPharmacist.created_at,
            };
            pharmacists.value.push(objectToAdd);
            if (searchedPharmacists.value) {
                searchedPharmacists.value.push(objectToAdd);
            }
        }).catch(async (error) => {
            toast.error(error.response.data.error);
            showAddPharmacistModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddPharmacistModal.value = true;
        });
    } catch (error) {
        console.log(error);
        toast.error(error);
        showAddPharmacistModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showAddPharmacistModal.value = true;
    }
    button.innerHTML = 'Add Pharmacist';
};
</script>



<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen">
        <Toaster richColors position="top-right" />
        <SideBar />
        <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
            <Header />

            <Breadcrumb first="Dashboard" second="Resources" third="Pharmacists"
                firstIcon='<i class="fa-solid fa-gauge"></i>' secondIcon='<i class="fa-solid fa-people-group"></i>'
                thirdIcon='<i class="fa-solid fa-prescription-bottle"></i>' link="/admin-dashboard" />

            <!-- Table -->
            <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
                <!-- Search and Role Filter -->
                <div class="flex justify-between mb-4 gap-3 flex-col sm:flex-row">
                    <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
                        class="input input-bordered w-full dark:bg-slate-800 dark:text-gray-300" />
                    <button @click="showAddPharmacistModalFun()"
                        class="bg-primarycolor text-white rounded-lg p-4 text-sm hover:bg-blue-500 font-semibold w-full">Add
                        Pharmacist</button>
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

                            <tr v-if="searchQuery" v-for="pharmacist in searchedPharmacists" :key="pharmacist.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div class="avatar">
                                            <div class="mask mask-squircle h-12 w-12">
                                                <img v-if="pharmacist.avatar"
                                                    :src="backendUrl.backendUrl + '/storage/' + pharmacist.avatar"
                                                    alt="" />
                                                <img v-else src="/src/assets/images/unkown-profile-pic.png" alt="" />
                                            </div>
                                        </div>
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ pharmacist.name }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ pharmacist.email }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ formatDate(pharmacist.created_at) }}
                                </td>
                                <td>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deletePharmacistConfirmation(pharmacist)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <tr v-else v-for="phar in filteredAndSortedPharmacists" :key="phar.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div class="avatar">
                                            <div class="mask mask-squircle h-12 w-12">
                                                <img v-if="phar.avatar"
                                                    :src="backendUrl.backendUrl + '/storage/' + phar.avatar"
                                                    alt="" />
                                                <img v-else src="/src/assets/images/unkown-profile-pic.png" alt="" />
                                            </div>
                                        </div>
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ phar.name }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ phar.email }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ formatDate(phar.created_at) }}
                                </td>
                                <td>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deletePharmacistConfirmation(phar)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <!-- Add Pharmacist Modal -->
                            <dialog v-if="showAddPharmacistModal" id="my_modal_2" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Pharmacist Details</h3>
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Email</span>
                                            <input type="text" placeholder="Enter Email" v-model="email"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>
                                    </div>
                                    <div class="modal-action">
                                        <button @click="addPharmacist" id="addDepartment-button"
                                            class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-12">Add
                                            Pharmacist</button>
                                    </div>
                                </div>
                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeModal">close</button>
                                </form>
                            </dialog>

                            <!-- Modal Delete Pharmacist Confirmation -->
                            <dialog v-if="showDeleteConfirmationModal" id="modal_delete_pharmacist_confirmation"
                                class="modal modal-bottom sm:modal-middle">
                                <div class="modal-box dark:bg-slate-700">
                                    <h3 class="text-lg font-bold dark:text-gray-300">Confirm Delete Pharmacist</h3>
                                    <p class="py-4 text-red-600 font-semibold">Are you sure you want to delete the
                                        selected pharmacist?</p>
                                    <div class="modal-action">
                                        <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                            @click="deletePharmacist">Yes</button>

                                        <form method="dialog">
                                            <button
                                                class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-100">Close</button>
                                        </form>
                                    </div>
                                </div>
                            </dialog>
                        </tbody>
                    </table>
                    <div v-if="!pharmacists" class="animate-pulse w-full">
                        <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                    </div>
                </div>
                <!-- Pagination -->
                <SearchPharmacistsPagination :searchQuery="searchQuery" v-if="searchQuery" />
                <PharmacistsPagination v-else />
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