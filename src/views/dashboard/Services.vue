<script setup>
import SideBar from '../../components/dashboard/SideBar.vue';
import Header from '../../components/dashboard/Header.vue';
import Breadcrumb from '../../components/dashboard/Breadcrumb.vue';
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'vue-sonner';
import { useFetchServices } from '../../stores/fetchServices.js';
import ServicesPagination from '../../components/dashboard/ServicesPagination.vue';
import SearchServicesPagination from '../../components/dashboard/SearchServicesPagination.vue';

const allServices = useFetchServices();
const services = computed(() => allServices.data);

const searchQuery = ref('');
const sortKey = ref('');
const sortOrder = ref(1);


const searchedServices = computed(() => {
    let filteredServices = allServices.searchedServices || [];
    if (sortKey.value) {
        filteredServices.sort((a, b) => {
            const aValue = a[sortKey.value] || '';
            const bValue = b[sortKey.value] || '';
            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }

    return filteredServices;
});

watch(() => searchQuery.value, async () => {
    if (searchQuery.value < 1) {
        await allServices.fetchServices();
    }
});

const captureSearchQuery = async () => {
    await allServices.fetchSearchedServices(1, searchQuery.value);
    searchedServices.value = allServices.searchedServices;
    return searchedServices.value;
};

const filteredAndSortedServices = computed(() => {
    const filteredServices = services.value || [];
    if (sortKey.value) {
        filteredServices.sort((a, b) => {
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
    return filteredServices;
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
    const services = ref([]);
    try {
        await axios.get('/fetch-all-services').then((res) => {
            services.value = res.data.services;
        }).catch((err) => {
            console.log(err);
        });
    } catch (error) {
        console.log(error);
    }
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the array of objects to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(services.value);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Services');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'services.xlsx');
}

const showAddServiceModalFun = () => {
    const modal = document.getElementById('my_modal_2');
    modal.showModal();
};

const showAddServiceModal = ref(true);

const updateDeletedServiceLocally = (serviceId) => {
    const serviceIndexInDefaultArray = filteredAndSortedServices.value.findIndex(service => service.id === serviceId);
    const serviceIndexInSearchedServices = searchedServices.value.findIndex(service => service.id === serviceId);

    if (serviceIndexInDefaultArray !== -1) {
        filteredAndSortedServices.value.splice(serviceIndexInDefaultArray, 1);
    }
    if (serviceIndexInSearchedServices !== -1) {
        searchedServices.value.splice(serviceIndexInSearchedServices, 1);
    }
};

const serviceToDelete = ref(null);
const deleteServiceConfirmation = (service) => {
    serviceToDelete.value = service;
    const modal = document.getElementById('modal_delete_service_confirmation');
    modal.showModal();
};
const showDeleteConfirmationModal = ref(true);
const deleteService = async () => {
    try {
        const res = await axios.post('/delete-service', {
            serviceId: serviceToDelete.value.id
        });
        showDeleteConfirmationModal.value = false;
        toast.success('Success', {
            description: res.data.message,
            duration: 5000,
        });
        updateDeletedServiceLocally(serviceToDelete.value.id);
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

const serviceTitle = ref('');
const servicePrice = ref('');
const serviceDescription = ref('');
const serviceStatus = ref('');

const addService = async () => {
    const button = document.getElementById('addService-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/add-service', {
            serviceTitle: serviceTitle.value,
            servicePrice: servicePrice.value,
            serviceDescription: serviceDescription.value,
            serviceStatus: serviceStatus.value,
        }).then(async (res) => {
            toast.success(res.data.message);
            showAddServiceModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddServiceModal.value = true;
            const objectToAdd = {
                id: res.data.newService.id,
                title: res.data.newService.title,
                price: res.data.newService.price,
                description: res.data.newService.description,
                status: res.data.newService.status,
            };
            console.log(res.data.newService.status)
            services.value.push(objectToAdd);
            if (searchedServices.value) {
                searchedServices.value.push(objectToAdd);
            }
        }).catch(async (error) => {
            toast.error(error.response.data.error);
            showAddServiceModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddServiceModal.value = true;
        });
    } catch (error) {
        console.log(error);
        toast.error(error);
        showAddServiceModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showAddServiceModal.value = true;
    }
    button.innerHTML = 'Add Service';
};

const showEditServiceModal = ref(true);
const editableServiceId = ref(null);
const serviceForEdit = ref(null);
const editServiceTitle = ref('');
const editServicePrice = ref('');
const editServiceDescription = ref('');
const editServiceStatus = ref('');

const showEditServiceModalFunc = (service) => {
    const modal = document.getElementById('my_edit_modal');
    editableServiceId.value = service.id;
    serviceForEdit.value = service;
    editServiceTitle.value = service.title;
    editServicePrice.value = service.price;
    editServiceDescription.value = service.description;
    editServiceStatus.value = service.status;
    modal.showModal();
};

const editService = async () => {
    const button = document.getElementById('editService-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        const response = await axios.post('/update-service', {
            serviceId: editableServiceId.value,
            serviceTitle: editServiceTitle.value,
            servicePrice: editServicePrice.value,
            serviceDescription: editServiceDescription.value,
            serviceStatus: editServiceStatus.value,
        });
        updateServiceDetailsLocally(
            editableServiceId.value,
            editServiceTitle.value,
            editServicePrice.value,
            editServiceDescription.value,
            editServiceStatus.value
        );
        showEditServiceModal.value = false;
        toast.success(response.data.message, {
            description: 'Service has been updated successfully',
            duration: 5000,
        });

        await new Promise(resolve => setTimeout(resolve, 500));
        showEditServiceModal.value = true;

    } catch (error) {
        showEditServiceModal.value = false;
        toast.error(error.response.data.error, {
            description: 'Service could not be updated. Please try again.',
            duration: 5000,
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        showEditServiceModal.value = true;
        console.log(error);
    }
    button.innerHTML = 'Update Service';
};


const updateServiceDetailsLocally = (serviceId, title, price, description, status) => {
    const serviceIndexInDefaultArray = filteredAndSortedServices.value.find(service => service.id === serviceId);
    const serviceIndexInSearchedServices = searchedServices.value.find(service => service.id === serviceId);

    if (serviceIndexInDefaultArray) {
        serviceIndexInDefaultArray.title = title;
        serviceIndexInDefaultArray.price = price;
        serviceIndexInDefaultArray.description = description;
        serviceIndexInDefaultArray.status = status;
    }

    if (serviceIndexInSearchedServices) {
        serviceIndexInSearchedServices.title = title;
        serviceIndexInSearchedServices.price = price;
        serviceIndexInSearchedServices.description = description;
        serviceIndexInSearchedServices.status = status;
    }
};

</script>





<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen">
        <Toaster richColors position="top-right" />
        <SideBar />
        <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
            <Header />

            <Breadcrumb first="Dashboard" second="Service"
                firstIcon='<i class="fa-solid fa-gauge"></i>' secondIcon='<i class="fa-solid fa-tools"></i>'
                 link="/dashboard" />

            <!-- Table -->
            <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
                <!-- Search and Role Filter -->
                <div class="flex justify-between mb-4 gap-3 flex-col sm:flex-row">
                    <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
                        class="input input-bordered w-full dark:bg-slate-800 dark:text-gray-300" />
                    <button @click="showAddServiceModalFun()"
                        class="bg-primarycolor text-white rounded-lg p-4 text-sm hover:bg-blue-500 font-semibold w-full">Add
                        Service</button>
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
                                <th @click="sortBy('title')" class="cursor-pointer dark:text-gray-300">
                                    Service Title
                                    <span>{{ getSortIcon('title') }}</span>
                                </th>
                                <th @click="sortBy('description')" class="cursor-pointer dark:text-gray-300">
                                    Description
                                    <span>{{ getSortIcon('description') }}</span>
                                </th>
                                <th @click="sortBy('price')" class="cursor-pointer dark:text-gray-300">
                                    Price
                                    <span>{{ getSortIcon('price') }}</span>
                                </th>
                                <th @click="sortBy('status')" class="cursor-pointer dark:text-gray-300">
                                    Status
                                    <span>{{ getSortIcon('status') }}</span>
                                </th>
                                <th class="dark:text-gray-300">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr v-if="searchQuery" v-for="service in searchedServices" :key="service.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ service.title }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ service.description ? service.description : 'No Description' }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    ${{ service.price }}
                                </td>
                                <td class="dark:text-gray-300">
                                    <span v-if="service.status == 1">Active</span>
                                    <span v-else>Inactive</span>
                                    <!-- {{ service.status === 1 ? 'Active' : 'Inactive' }} -->
                                </td>
                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditServiceModalFunc(service)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteServiceConfirmation(service)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <tr v-else v-for="srv in filteredAndSortedServices" :key="srv.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ srv.title }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ srv.description ? srv.description : 'No Description' }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    ${{ srv.price }}
                                </td>
                                <td class="dark:text-gray-300">
                                    <span v-if="srv.status == 1">Active</span>
                                    <span v-else>Inactive</span>
                                </td>
                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditServiceModalFunc(srv)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteServiceConfirmation(srv)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <!-- Add Service Modal -->
                            <dialog v-if="showAddServiceModal" id="my_modal_2" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Service Details</h3>

                                        <!-- Title Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Service Title</span>
                                            <input type="text" placeholder="Enter Service Title" v-model="serviceTitle"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Price Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Price</span>
                                            <input type="number" step="0.01" placeholder="Enter Price"
                                                v-model="servicePrice"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Description Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Description</span>
                                            <textarea placeholder="Enter Description" v-model="serviceDescription"
                                                class="textarea textarea-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300"></textarea>
                                        </label>

                                        <!-- Status Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Status</span>
                                            <select class="select select-bordered mt-2 dark:bg-slate-800 dark:text-gray-300" v-model="serviceStatus">
                                                <option disabled selected>Choose one</option>
                                                <option value="1">Active</option>
                                                <option value="0">Inactive</option>
                                            </select>
                                        </label>

                                        <div class="modal-action">
                                            <button @click="addService" id="addService-button"
                                                class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-16">
                                                Add Service
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeModal">Close</button>
                                </form>
                            </dialog>


                            <!-- Edit Service Modal -->
                            <dialog v-if="showEditServiceModal" id="my_edit_modal" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Service Details</h3>

                                        <!-- Title Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Service Title</span>
                                            <input type="text" placeholder="Enter Service Title"
                                                v-model="editServiceTitle"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Price Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Price</span>
                                            <input type="number" step="0.01" placeholder="Enter Price"
                                                v-model="editServicePrice"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <!-- Description Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Description</span>
                                            <textarea placeholder="Enter Description" v-model="editServiceDescription"
                                                class="textarea textarea-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300"></textarea>
                                        </label>

                                        <!-- Status Input -->
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Status</span>
                                            <select class="select select-bordered mt-2 dark:bg-slate-800 dark:text-gray-300" v-model="editServiceStatus">
                                                <option disabled value="">Choose one</option>
                                                <option :value="1" :selected="editServiceStatus === 1">Active</option>
                                                <option :value="0" :selected="editServiceStatus === 0">Inactive</option>
                                            </select>

                                        </label>

                                        <div class="modal-action">
                                            <button @click="editService" id="editService-button"
                                                class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-16">
                                                Edit Service
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeEditModal">Close</button>
                                </form>
                            </dialog>

                            <!-- Modal Delete Service Confirmation -->
                            <dialog v-if="showDeleteConfirmationModal" id="modal_delete_service_confirmation"
                                class="modal modal-bottom sm:modal-middle">
                                <div class="modal-box dark:bg-slate-700">
                                    <h3 class="text-lg font-bold dark:text-gray-300">Confirm Delete Service</h3>
                                    <p class="py-4 text-red-600 font-semibold">Are you sure you want to delete the
                                        selected service?</p>
                                    <div class="modal-action">
                                        <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                            @click="deleteService">Yes</button>

                                        <form method="dialog">
                                            <button
                                                class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-1000">Close</button>
                                        </form>
                                    </div>
                                </div>
                            </dialog>
                        </tbody>
                    </table>
                    <div v-if="!services" class="animate-pulse w-full">
                        <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                    </div>
                </div>
                <!-- Pagination -->
                <SearchServicesPagination :searchQuery="searchQuery" v-if="searchQuery" />
                <ServicesPagination v-else />
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