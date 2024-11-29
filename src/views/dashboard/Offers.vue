<script setup>
import SideBar from '../../components/dashboard/SideBar.vue';
import Header from '../../components/dashboard/Header.vue';
import Breadcrumb from '../../components/dashboard/Breadcrumb.vue';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'vue-sonner';
import { useFetchOffers } from '../../stores/fetchOffers.js';
import OffersPagination from '../../components/dashboard/OffersPagination.vue';
import SearchOffersPagination from '../../components/dashboard/SearchOffersPagination.vue';


const allOffers = useFetchOffers();
const offers = computed(() => allOffers.data);


const searchQuery = ref('');
const sortKey = ref('');
const sortOrder = ref(1);

const searchedOffers = computed(() => {
    let filteredOffers = allOffers.searchedOffers || [];
    if (sortKey.value) {
        filteredOffers.sort((a, b) => {
            const aValue = a[sortKey.value] || '';
            const bValue = b[sortKey.value] || '';
            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }

    return filteredOffers;
});

watch(() => searchQuery.value, async () => {
    if (searchQuery.value < 1) {
        await allOffers.fetchOffers();
    }
});

const captureSearchQuery = async () => {
    await allOffers.fetchSearchedOffers(1, searchQuery.value);
    searchedOffers.value = allOffers.searchedOffers;
    return searchedOffers.value;
};

const filteredAndSortedOffers = computed(() => {
    const filteredOffers = offers.value || [];
    if (sortKey.value) {
        filteredOffers.sort((a, b) => {
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
    return filteredOffers;
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
    const offers = ref([]);
    try {
        await axios.get('/fetch-all-offers').then((res) => {
            offers.value = res.data.offers;
        }).catch((err) => {
            console.log(err);
        });
    } catch (error) {
        console.log(error);
    }
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the array of objects to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(offers.value);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Offers');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'offers.xlsx');
}

const showAddOfferModalFun = () => {
    const modal = document.getElementById('my_modal_2');
    modal.showModal();
};

const showAddOfferModal = ref(true);

const updateDeletedOfferLocally = (offerId) => {
    const offerIndexInDefaultArray = filteredAndSortedOffers.value.findIndex(offer => offer.id === offerId);
    const offerIndexInSearchedOffers = searchedOffers.value.findIndex(offer => offer.id === offerId);

    if (offerIndexInDefaultArray !== -1) {
        filteredAndSortedOffers.value.splice(offerIndexInDefaultArray, 1);
    }
    if (offerIndexInSearchedOffers !== -1) {
        searchedOffers.value.splice(offerIndexInSearchedOffers, 1);
    }
};

const offerToDelete = ref(null);
const deleteOfferConfirmation = (offer) => {
    offerToDelete.value = offer;
    const modal = document.getElementById('modal_delete_offer_confirmation');
    modal.showModal();
};
const showDeleteConfirmationModal = ref(true);
const deleteOffer = async () => {
    try {
        const res = await axios.post('/delete-offer', {
            offerId: offerToDelete.value.id
        });
        showDeleteConfirmationModal.value = false;
        toast.success('Success', {
            description: res.data.message,
            duration: 5000,
        });
        updateDeletedOfferLocally(offerToDelete.value.id);
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

const offerName = ref('');
const offerDiscountValue = ref('');
const offerTaxRate = ref('');

const addOffer = async () => {
    const button = document.getElementById('addOffer-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/add-offer', {
            name: offerName.value,
            offerDiscountValue: offerDiscountValue.value,
            offerTaxRate: offerTaxRate.value,
            selectedServices: selectedServices.value.map((service) => service.id)
        }).then(async (res) => {
            toast.success(res.data.message);
            showAddOfferModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddOfferModal.value = true;
            const objectToAdd = {
                id: res.data.newOffer.id,
                name: res.data.newOffer.name,
                total_before_discount: res.data.newOffer.total_before_discount,
                discount_value: res.data.newOffer.discount_value ? res.data.newOffer.discount_value : null,
                total_after_discount: res.data.newOffer.total_after_discount,
                tax_rate: res.data.newOffer.tax_rate ? res.data.newOffer.tax_rate : null,
                total_with_tax: res.data.newOffer.total_with_tax,
                service_offer: res.data.newOffer.services
            };
            offers.value.push(objectToAdd);
            if (searchedOffers.value) {
                searchedOffers.value.push(objectToAdd);
            }
        }).catch(async (error) => {
            toast.error(error.response.data.error);
            showAddOfferModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddOfferModal.value = true;
        });
    } catch (error) {
        console.log(error);
        toast.error(error);
        showAddOfferModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showAddOfferModal.value = true;
    }
    button.innerHTML = 'Add Offer';
};

const showEditOfferModal = ref(true);
const editableOfferId = ref(null);
const offerForEdit = ref(null);
const editOfferName = ref('');
const editOfferTotalBeforeDiscount = ref('');
const editOfferDiscountValue = ref('');
const editOfferTotalAfterDiscount = ref('');
const editOfferTaxRate = ref('');
const editOfferTotalWithTax = ref('');
const selectedServicesInEditing = ref(null)
const offerServicesLenght = ref(null)
const showEditOfferModalFunc = (offer) => {
    const modal = document.getElementById('my_edit_modal');
    editableOfferId.value = offer.id;
    offerForEdit.value = offer;
    editOfferName.value = offer.name;
    editOfferTotalBeforeDiscount.value = offer.total_before_discount;
    editOfferDiscountValue.value = offer.discount_value;
    editOfferTotalAfterDiscount.value = offer.total_after_discount;
    editOfferTaxRate.value = offer.tax_rate;
    editOfferTotalWithTax.value = offer.total_with_tax;
    selectedServices.value = offer.service_offer
    selectedServicesInEditing.value = offer.service_offer
    offerServicesLenght.value = offer.service_offer.length
    modal.showModal();
};




const editOffer = async () => {
    const button = document.getElementById('editOffer-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        const response = await axios.post('/update-offer', {
            offerId: editableOfferId.value,
            name: editOfferName.value,
            offerDiscountValue: editOfferDiscountValue.value,
            offerTaxRate: editOfferTaxRate.value,
            selectedServices: selectedServices.value.map((service) => service.id)
        });
        updateOfferDetailsLocally(
            editableOfferId.value,
            editOfferName.value,
            response.data.updatedOffer.total_before_discount,
            editOfferDiscountValue.value,
            response.data.updatedOffer.total_after_discount,
            editOfferTaxRate.value,
            response.data.updatedOffer.total_with_tax,
            selectedServices.value
        );
        showEditOfferModal.value = false;
        toast.success(response.data.message, {
            description: 'Offer has been updated successfully',
            duration: 5000,
        });

        await new Promise(resolve => setTimeout(resolve, 500));
        showEditOfferModal.value = true;

    } catch (error) {
        showEditOfferModal.value = false;
        toast.error(error.response.data.error, {
            description: 'Failed to update the offer',
            duration: 5000,
        });

        await new Promise(resolve => setTimeout(resolve, 500));
        showEditOfferModal.value = true;
    }
    button.innerHTML = 'Update Offer';
};

const updateOfferDetailsLocally = (
    offerId,
    updatedName,
    updatedTotalBeforeDiscount,
    updatedDiscountValue,
    updatedTotalAfterDiscount,
    updatedTaxRate,
    updatedTotalWithTax,
    services
) => {
    const offerIndexInDefaultArray = filteredAndSortedOffers.value.findIndex(offer => offer.id === offerId);
    const offerIndexInSearchedOffers = searchedOffers.value.findIndex(offer => offer.id === offerId);

    if (offerIndexInDefaultArray !== -1) {
        filteredAndSortedOffers.value[offerIndexInDefaultArray].name = updatedName;
        filteredAndSortedOffers.value[offerIndexInDefaultArray].total_before_discount = updatedTotalBeforeDiscount;
        filteredAndSortedOffers.value[offerIndexInDefaultArray].discount_value = updatedDiscountValue;
        filteredAndSortedOffers.value[offerIndexInDefaultArray].total_after_discount = updatedTotalAfterDiscount;
        filteredAndSortedOffers.value[offerIndexInDefaultArray].tax_rate = updatedTaxRate;
        filteredAndSortedOffers.value[offerIndexInDefaultArray].total_with_tax = updatedTotalWithTax;
        filteredAndSortedOffers.value[offerIndexInDefaultArray].service_offer = services;

    }

    if (offerIndexInSearchedOffers !== -1) {
        searchedOffers.value[offerIndexInSearchedOffers].name = updatedName;
        searchedOffers.value[offerIndexInSearchedOffers].total_before_discount = updatedTotalBeforeDiscount;
        searchedOffers.value[offerIndexInSearchedOffers].discount_value = updatedDiscountValue;
        searchedOffers.value[offerIndexInSearchedOffers].total_after_discount = updatedTotalAfterDiscount;
        searchedOffers.value[offerIndexInSearchedOffers].tax_rate = updatedTaxRate;
        searchedOffers.value[offerIndexInSearchedOffers].service_offer = services;
    }
};


const services = computed(() => allOffers.services);
const selectedServices = ref([]);
const searchTerm = ref("");
const showList = ref(false);
const boxContainer = ref(null);
const searchInput = ref(null);


function toggleDropdown() {
    showList.value = !showList.value;
}

function selectService(service) {
    if (isSelected(service)) {
        selectedServices.value = selectedServices.value.filter((t) => t.id !== service.id);
    } else {
        selectedServices.value.push(service);
    }
}

function isSelected(service) {
    return selectedServices.value.some(selected => selected.id === service.id);
}

const filteredServices = computed(() => {
    const term = searchTerm.value.toLowerCase();
    console.log(services.value)
    return services.value.filter((service) => service.title.toLowerCase().includes(term));
});

function selectAllServices() {
    const currentlyFilteredServices = filteredServices.value;
    if (areAllVisibleServicesSelected.value) {
        selectedServices.value = selectedServices.value.filter(
            (service) => !currentlyFilteredServices.some(filteredService => filteredService.id === service.id)
        );
    } else {
        const newServices = currentlyFilteredServices.filter(
            (service) => !selectedServices.value.some(selectedService => selectedService.id === service.id)
        );
        selectedServices.value.push(...newServices);
    }
}

const areAllVisibleServicesSelected = computed(() => {
    const currentlyFilteredServices = filteredServices.value;
    return (
        currentlyFilteredServices.length > 0 &&
        currentlyFilteredServices.every((service) => selectedServices.value.some(selectedService => selectedService.id === service.id))
    );
});

function closeDropdown(event) {
    if (
        !boxContainer.value.contains(event.target) &&
        !searchInput.value.contains(event.target)
    ) {
        searchTerm.value = "";
        showList.value = false;
    }
}

onMounted(() => {
    window.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
    window.removeEventListener("click", closeDropdown);
});


const closeEditModal = () => {
    const modal = document.getElementById('my_edit_modal');
    if (selectedServices.value.length > 1) {
        selectedServices.value.splice(offerServicesLenght.value);
    }
    modal.close()
}
</script>






<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen">
        <Toaster richColors position="top-right" />
        <SideBar />
        <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
            <Header />

            <Breadcrumb first="Dashboard" second="Offer" firstIcon='<i class="fa-solid fa-gauge"></i>'
                secondIcon='<i class="fa-solid fa-gift"></i>' link="/dashboard" />

            <!-- Table -->
            <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
                <!-- Search and Role Filter -->
                <div class="flex justify-between mb-4 gap-3 flex-col sm:flex-row">
                    <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
                        class="input input-bordered w-full dark:bg-slate-800 dark:text-gray-300" />
                    <button @click="showAddOfferModalFun()"
                        class="bg-primarycolor text-white rounded-lg p-4 text-sm hover:bg-blue-500 font-semibold w-full">Add
                        Offer</button>
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
                                    Offer Name
                                    <span>{{ getSortIcon('name') }}</span>
                                </th>
                                <th @click="sortBy('service_offer')" class="cursor-pointer dark:text-gray-300">
                                    Services
                                    <span>{{ getSortIcon('service_offer') }}</span>
                                </th>
                                <th @click="sortBy('discount_value')" class="cursor-pointer dark:text-gray-300">
                                    Discount Value
                                    <span>{{ getSortIcon('discount_value') }}</span>
                                </th>
                                <th @click="sortBy('total_before_discount')" class="cursor-pointer dark:text-gray-300">
                                    Total Before Discount
                                    <span>{{ getSortIcon('total_before_discount') }}</span>
                                </th>
                                <th @click="sortBy('total_after_discount')" class="cursor-pointer dark:text-gray-300">
                                    Total After Discount
                                    <span>{{ getSortIcon('total_after_discount') }}</span>
                                </th>
                                <th @click="sortBy('tax_rate')" class="cursor-pointer dark:text-gray-300">
                                    Tax Rate
                                    <span>{{ getSortIcon('tax_rate') }}</span>
                                </th>
                                <th @click="sortBy('total_with_tax')" class="cursor-pointer dark:text-gray-300">
                                    Total With Tax
                                    <span>{{ getSortIcon('total_with_tax') }}</span>
                                </th>
                                <th>
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr v-if="searchQuery" v-for="offer in searchedOffers" :key="offer.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ offer.name }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span v-for="service in offer.service_offer" class="dark:text-gray-300">
                                        {{ service.title }} (${{ service.price }})
                                        <br />
                                    </span>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ offer.discount_value ? '$' + offer.discount_value : 'No discount given' }}
                                </td>
                                <td class="dark:text-gray-300">
                                    ${{ offer.total_before_discount }}
                                </td>
                                <td class="dark:text-gray-300">
                                    ${{ offer.total_after_discount }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ offer.tax_rate ? offer.tax_rate + '%' : 'No tax rate given' }}
                                </td>
                                <td class="dark:text-gray-300">
                                    ${{ offer.total_with_tax }}
                                </td>
                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditOfferModalFunc(offer)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteOfferConfirmation(offer)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <tr v-else v-for="ofr in filteredAndSortedOffers" :key="ofr.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ ofr.name }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span v-for="service in ofr.service_offer" class="dark:text-gray-300">
                                        {{ service.title }} (${{ service.price }})
                                        <br />
                                    </span>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ ofr.discount_value ? '$' + ofr.discount_value : 'No discount given' }}
                                </td>

                                <td class="dark:text-gray-300">
                                    ${{ ofr.total_before_discount }}
                                </td>
                                <td class="dark:text-gray-300">
                                    ${{ ofr.total_after_discount }}
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ ofr.tax_rate ? ofr.tax_rate + '%' : 'No tax rate given' }}
                                </td>

                                <td class="dark:text-gray-300">
                                    ${{ ofr.total_with_tax }}
                                </td>
                                <td>
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditOfferModalFunc(ofr)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteOfferConfirmation(ofr)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>



                            <!-- Add Offer Modal -->
                            <dialog v-if="showAddOfferModal" id="my_modal_2" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Offer Details</h3>

                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Offer Name</span>
                                            <input type="text" placeholder="Enter Offer Name" v-model="offerName"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <div class="relative mt-4 max-w-xs">
                                            <button @click="toggleDropdown"
                                                class="relative dark:bg-slate-800 dark:text-gray-300 flex input input-bordered w-full items-center justify-between rounded-lg bg-white px-3 py-2"
                                                aria-controls="tags-dropdown" aria-labelledby="tags-label">
                                                <div class="flex items-center gap-2 dark:text-gray-300">
                                                    <template v-if="selectedServices.length > 0">
                                                        <span v-for="service in selectedServices.slice(0, 2)"
                                                            :key="service"
                                                            class="inline-flex items-center rounded dark:text-gray-300 bg-indigo-100 px-2 py-0.5 text-xs font-medium dark:bg-slate-800">
                                                            {{ service.title }}
                                                        </span>
                                                        <span class="dark:text-gray-300"
                                                            v-if="selectedServices.length > 2">
                                                            +{{ selectedServices.length - 2 }}
                                                        </span>
                                                    </template>
                                                    <p v-else>Choose Services</p>
                                                </div>
                                            </button>

                                            <div v-if="showList"
                                                class="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-300 bg-white shadow-md dark:border-slate-600 dark:bg-slate-800"
                                                id="tags-dropdown">
                                                <div
                                                    class="flex items-center gap-3 border-b dark:text-gray-300 border-slate-200 px-3 dark:border-slate-600">
                                                    <input type="checkbox" id="select-all-checkbox"
                                                        :checked="areAllVisibleServicesSelected"
                                                        @change="selectAllServices"
                                                        class="size-5 cursor-pointer dark:text-gray-300 accent-primarycolor focus:outline-none focus:ring-2 focus:ring-primarycolor dark:focus:ring-primarycolor"
                                                        aria-checked="areAllVisibleServicesSelected" />
                                                    <input type="text" v-model="searchTerm" ref="searchInput"
                                                        placeholder="Search Services"
                                                        class="w-full rounded-t-lg dark:text-gray-300 bg-white py-2 focus:outline-none dark:bg-slate-800" />
                                                </div>
                                                <div class="combo-box-scrollbar max-h-96 overflow-y-auto">
                                                    <div v-for="service in filteredServices" :key="service.id"
                                                        @click="selectService(service)"
                                                        @keypress.space="selectService(service)"
                                                        class="flex cursor-pointer dark:text-gray-300 items-center gap-3 px-3 py-2 hover:bg-primarycolor hover:text-white focus:outline-none dark:hover:bg-primarycolor"
                                                        role="option" :aria-selected="isSelected(service)" tabindex="0">
                                                        <input type="checkbox" :id="service.id"
                                                            :checked="isSelected(service)"
                                                            class="size-5 dark:text-gray-300 cursor-pointer accent-primarycolor focus:outline-none focus:ring-2 focus:ring-primarycolor"
                                                            aria-checked="isSelected(service)" />
                                                        <label :for="service.title" class="pointer-events-none">{{
                                                            service.title }}</label>
                                                    </div>
                                                </div>
                                                <div
                                                    class="border-t border-slate-300 px-3 py-2 text-right dark:border-slate-600">
                                                    <button @click="showList = false"
                                                        class="rounded-md bg-primarycolor px-3 py-1 text-white hover:bg-primarycolor focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-primarycolor">
                                                        Done
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <label class="form-control w-full max-w-xs mt-4">
                                            <span class="label-text dark:text-gray-300">Discount Value ($)</span>
                                            <input type="number" placeholder="Enter Discount Value"
                                                v-model="offerDiscountValue"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <label class="form-control w-full max-w-xs mt-4">
                                            <span class="label-text dark:text-gray-300">Tax Rate (%)</span>
                                            <input type="number" placeholder="Enter Tax Rate" v-model="offerTaxRate"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <div class="modal-action mt-4">
                                            <button @click="addOffer" id="addOffer-button"
                                                class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-16">
                                                Add Offer
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeModal">Close</button>
                                </form>
                            </dialog>



                            <!-- Edit Offer Modal -->
                            <dialog v-if="showEditOfferModal" id="my_edit_modal" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Offer Details</h3>

                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Offer Name</span>
                                            <input type="text" placeholder="Enter Offer Name" v-model="editOfferName"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <div class="relative mt-4 max-w-xs">
                                            <button @click="toggleDropdown"
                                                class="relative flex w-full items-center justify-between rounded-lg   bg-white px-3 py-2 dark:bg-slate-800"
                                                aria-controls="tags-dropdown" aria-labelledby="tags-label">
                                                <div class="flex dark:text-gray-300 items-center gap-2">
                                                    <template v-if="selectedServices.length > 0">
                                                        <span v-for="service in selectedServices.slice(0, 2)"
                                                            :key="service.id"
                                                            class="inline-flex dark:text-gray-300 items-center rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium bg-transparent">
                                                            {{ service.title }}
                                                        </span>
                                                        <span v-if="selectedServices.length > 2">
                                                            +{{ selectedServices.length - 2 }}
                                                        </span>
                                                    </template>
                                                    <p v-else>Choose Services</p>
                                                </div>
                                            </button>

                                            <div v-if="showList"
                                                class="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-300 bg-white shadow-md dark:border-slate-600 dark:bg-slate-800"
                                                id="tags-dropdown">
                                                <div
                                                    class="flex items-center gap-3 border-b border-slate-200 px-3 dark:border-slate-600">
                                                    <input type="checkbox" id="select-all-checkbox"
                                                        :checked="areAllVisibleServicesSelected"
                                                        @change="selectAllServices"
                                                        class="size-5  cursor-pointer accent-primarycolor focus:outline-none focus:ring-2 focus:ring-primarycolor dark:focus:ring-primarycolor"
                                                        aria-checked="areAllVisibleServicesSelected" />
                                                    <input type="text" v-model="searchTerm" ref="searchInput"
                                                        placeholder="Search Services"
                                                        class="w-full dark:bg-slate-800 dark:text-gray-300 rounded-t-lg  bg-white py-2 focus:outline-none" />
                                                </div>
                                                <div class="combo-box-scrollbar max-h-96 overflow-y-auto">
                                                    <div v-for="service in filteredServices" :key="service.id"
                                                        @click="selectService(service)"
                                                        @keypress.space="selectService(service)"
                                                        class="flex dark:text-gray-300 cursor-pointer items-center gap-3 px-3 py-2 hover:bg-primarycolor hover:text-white focus:outline-none dark:hover:bg-primarycolor"
                                                        role="option" :aria-selected="isSelected(service)" tabindex="0">
                                                        <input type="checkbox" :id="service.id"
                                                            :checked="isSelected(service)"
                                                            class="size-5 cursor-pointer accent-primarycolor focus:outline-none focus:ring-2 focus:ring-primarycolor dark:focus:ring-indigo-700"
                                                            aria-checked="isSelected(service)" />
                                                        <label :for="service.title" class="pointer-events-none">{{
                                                            service.title }}</label>
                                                    </div>
                                                </div>
                                                <div
                                                    class="border-t border-slate-300 px-3 py-2 text-right dark:border-slate-600">
                                                    <button @click="showList = false"
                                                        class="rounded-md bg-primarycolor px-3 py-1 text-white hover:bg-primarycolor focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-primarycolor">
                                                        Done
                                                    </button>
                                                </div>
                                            </div>
                                        </div>


                                        <label class="form-control w-full max-w-xs mt-4">
                                            <span class="label-text dark:text-gray-300">Discount Value ($)</span>
                                            <input type="number" placeholder="Enter Discount Value"
                                                v-model="editOfferDiscountValue"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <label class="form-control w-full max-w-xs mt-4">
                                            <span class="label-text dark:text-gray-300">Tax Rate (%)</span>
                                            <input type="number" placeholder="Enter Tax Rate" v-model="editOfferTaxRate"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>

                                        <div class="modal-action mt-4">
                                            <button @click="editOffer" id="editOffer-button"
                                                class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-16">
                                                Add Offer
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeEditModal">Close</button>
                                </form>
                            </dialog>

                            <!-- Modal Delete Offer Confirmation -->
                            <dialog v-if="showDeleteConfirmationModal" id="modal_delete_offer_confirmation"
                                class="modal modal-bottom sm:modal-middle">
                                <div class="modal-box dark:bg-slate-700">
                                    <h3 class="text-lg font-bold dark:text-gray-300">Confirm Delete Offer</h3>
                                    <p class="py-4 text-red-600 font-semibold">Are you sure you want to delete the
                                        selected
                                        offer?</p>
                                    <div class="modal-action">
                                        <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                            @click="deleteOffer">Yes,
                                            Delete</button>
                                        <form method="dialog">
                                            <button
                                                class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-1000">Close</button>
                                        </form>
                                    </div>
                                </div>
                            </dialog>

                        </tbody>

                    </table>
                    <div v-if="!offers" class="animate-pulse w-full">
                        <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                    </div>
                </div>
                <SearchOffersPagination :searchQuery="searchQuery" v-if="searchQuery" />
                <OffersPagination v-else />
            </div>
        </div>
    </div>










</template>


<style>
.combo-box-scrollbar::-webkit-scrollbar {
    width: 10px;
}

.combo-box-scrollbar::-webkit-scrollbar-track {
    background: #c7d2fe;
}

.combo-box-scrollbar::-webkit-scrollbar-thumb {
    background: #818cf8;
}

.combo-box-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #6366f1;
}

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