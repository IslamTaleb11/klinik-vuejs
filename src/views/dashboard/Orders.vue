<script setup>
import SideBar from '../../components/dashboard/SideBar.vue';
import Header from '../../components/dashboard/Header.vue';
import Breadcrumb from '../../components/dashboard/Breadcrumb.vue';
import { ref, computed, watch, onMounted } from 'vue';
import OrdersPagination from '../../components/dashboard/OrdersPagination.vue';
import { useFetchOrders } from '../../stores/fetchOrders';
import dayjs from 'dayjs';
import SearchOrdersPagination from '../../components/dashboard/SearchOrdersPagination.vue';
import SelectOrdersByStatusPagination from '../../components/dashboard/SelectOrdersByStatusPagination.vue'; // Adjusted component name
import axios, { all } from 'axios';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'vue-sonner';
import { useOrderNotificationsStore } from '../../stores/ordersNotifications';

const allOrders = useFetchOrders()
const orders = computed(() => allOrders.data)
const countAllOrders = computed(() => allOrders.countAllOrders)
const countAllPaid = computed(() => allOrders.countAllPaid)
const countAllUnpaid = computed(() => allOrders.countAllUnpaid)

watch(() => allOrders.currentPage, () => {
    orders.value = allOrders.data;
});
const notificationsStore = useOrderNotificationsStore();


onMounted(async () => {
    await axios.get('/read-order-notifications')
})

const searchQuery = ref('');
const selectedStatus = ref('');
const sortKey = ref('');
const sortOrder = ref(1);

const searchedOrders = computed(() => {
    let filteredOrders = allOrders.searchedOrders || [];

    if (sortKey.value) {
        filteredOrders.sort((a, b) => {
            const aValue = a[sortKey.value] || ''; // Default to empty string if null or undefined
            const bValue = b[sortKey.value] || ''; // Default to empty string if null or undefined

            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }

    return filteredOrders;
});

const selectedByStatusOrders = computed(() => {
    let filteredOrders = allOrders.selectedOrdersByStatus || [];

    if (sortKey.value) {
        filteredOrders.sort((a, b) => {
            const aValue = a[sortKey.value] || ''; // Default to empty string if null or undefined
            const bValue = b[sortKey.value] || ''; // Default to empty string if null or undefined

            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }

    return filteredOrders;
});

watch(() => searchQuery.value, async () => {
    if (searchQuery.value < 1) {
        await allOrders.fetchOrders();
    }
});

const captureSearchQuery = async () => {
    if (selectedStatus.value) {
        selectedStatus.value = '';
    }
    await allOrders.fetchSearchedOrders(1, searchQuery.value);
    searchedOrders.value = allOrders.searchedOrders;
    return searchedOrders.value;
};

const filteredAndSortedOrders = computed(() => {
    const filteredOrders = orders.value || [];

    if (sortKey.value) {
        filteredOrders.sort((a, b) => {
            const aValue = a[sortKey.value] || ''; // Default to empty string if null or undefined
            const bValue = b[sortKey.value] || ''; // Default to empty string if null or undefined

            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }

    return filteredOrders;
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

const uniqueStatuses = ['Paid', 'Unpaid']

const ordersByStatus = () => {
    if (searchQuery.value) {
        searchQuery.value = '';
    }
    switch (selectedStatus.value) {
        case 'Paid':
            allOrders.fetchOrdersByStatus('paid');
            break;
        case 'Unpaid':
            allOrders.fetchOrdersByStatus('unpaid');
            break;
        default:
            break;
    }
};

async function exportToExcel() {
    const orders = ref([]);
    try {
        await axios.get('/fetch-all-orders').then((res) => {
            orders.value = res.data.orders;
        }).catch((err) => {
            console.log(err);
        });
    } catch (error) {
        console.log(error);
    }
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the array of objects to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(orders.value);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'orders.xlsx');
}



const updateDeletedOrderLocally = (orderId) => {
    const orderIndexInDefaultArray = filteredAndSortedOrders.value.findIndex(order => order.id === orderId);
    const orderIndexInSelectedByStatusOrders = selectedByStatusOrders.value.findIndex(order => order.id === orderId);
    const orderIndexInSearchedOrders = searchedOrders.value.findIndex(order => order.id === orderId);

    if (orderIndexInDefaultArray !== -1) {
        filteredAndSortedOrders.value.splice(orderIndexInDefaultArray, 1);
    }
    if (orderIndexInSelectedByStatusOrders !== -1) {
        selectedByStatusOrders.value.splice(orderIndexInSelectedByStatusOrders, 1);
    }
    if (orderIndexInSearchedOrders !== -1) {
        searchedOrders.value.splice(orderIndexInSearchedOrders, 1);
    }
};


const orderToDelete = ref(null);
const deleteOrderConfirmation = (order) => {
    orderToDelete.value = order;
    const modal = document.getElementById('modal_delete_order_confirmation');
    modal.showModal();
};

const showDeleteConfirmationModal = ref(true);
const deleteOrder = async () => {
    try {
        const res = await axios.post('/delete-order', {
            orderId: orderToDelete.value.id
        });

        showDeleteConfirmationModal.value = false;
        toast.success('Success', {
            description: res.data.message,
            duration: 5000,
        });
        updateDeletedOrderLocally(orderToDelete.value.id);
        await new Promise(resolve => setTimeout(resolve, 500));
        showDeleteConfirmationModal.value = true;
        allOrders.fetchOrdersCount()
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


const showEditOrderModal = ref(true)
const editableOrderId = ref(null)
const orderForEdit = ref(null)
const editOrderStatus = ref('')


const showEditOrderModalFun = (order) => {
    const modal = document.getElementById('my_edit_modal');
    editableOrderId.value = order.id
    orderForEdit.value = order
    editOrderStatus.value = order.status
    modal.showModal();
};


const editOrder = async () => {
    const button = document.getElementById('editOrder-button');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/update-order', {
            orderId: editableOrderId.value,
            status: editOrderStatus.value,
        }).then(async (res) => {
            toast.success(res.data.message);
            showEditOrderModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showEditOrderModal.value = true;
            updateOrderDetailsLocally(
                editableOrderId.value,
                editOrderStatus.value,
            );
            allOrders.fetchOrdersCount()
        }).catch(async (error) => {
            console.log(error)
            toast.error(error.response.data.error);
            showEditOrderModal.value = false;
            await new Promise(resolve => setTimeout(resolve, 500));
            showEditOrderModal.value = true;
        });
    } catch (error) {
        console.log(error);
        toast.error(error.response.data.error);
        showEditOrderModal.value = false;
        await new Promise(resolve => setTimeout(resolve, 500));
        showEditOrderModal.value = true;
    }
    button.innerHTML = 'Update Order';
};


const updateOrderDetailsLocally = (orderId, status) => {
    const orderIndexInDefaultArray = filteredAndSortedOrders.value.find(order => order.id === orderId)
    const orderIndexInSearchedOrders = searchedOrders.value.find(order => order.id === orderId)
    const orderIndexInSelectedByStatus = selectedByStatusOrders.value.find(order => order.id === orderId)

    if (orderIndexInDefaultArray) {
        orderIndexInDefaultArray.status = status;
    }

    if (orderIndexInSearchedOrders) {
        orderIndexInSearchedOrders.status = status;
    }

    if (orderIndexInSelectedByStatus) {
        orderIndexInSelectedByStatus.status = status;
    }
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
</script>



<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen">
        <Toaster richColors position="top-right" />
        <SideBar />
        <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
            <Header />

            <Breadcrumb first="Dashboard" second="Orders" firstIcon='<i class="fa-solid fa-gauge"></i>'
                secondIcon='<i class="fa-solid fa-box"></i>' link="/admin-dashboard" />

            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-[80%] mt-5 max-[1025px]:w-[90%]">
                <!-- All Orders Card -->
                <div class="bg-blue-500 text-white p-5 rounded-lg flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-box text-4xl"></i>
                        <div>
                            <p class="text-lg font-bold">Total Orders</p>
                            <p class="text-2xl">{{ countAllOrders }}</p>
                        </div>
                    </div>
                </div>

                <!-- Total Paid Orders Card -->
                <div class="bg-green-500 text-white p-5 rounded-lg flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-check-circle text-4xl"></i>
                        <div>
                            <p class="text-lg font-bold">Paid Orders</p>
                            <p class="text-2xl">{{ countAllPaid }}</p>
                        </div>
                    </div>
                </div>

                <!-- Total Unpaid Orders Card -->
                <div class="bg-cyan-500 text-white p-5 rounded-lg flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-hourglass-half text-4xl"></i>
                        <div>
                            <p class="text-lg font-bold">Unpaid Orders</p>
                            <p class="text-2xl">{{ countAllUnpaid }}</p>
                        </div>
                    </div>
                </div>
            </div>


            <!-- Table -->
            <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
                <!-- Search and Status Filter -->
                <div class="flex justify-between mb-4 gap-3 flex-col sm:flex-row">
                    <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
                        class="input input-bordered w-full dark:bg-slate-800 dark:text-gray-300" />
                    <select v-model="selectedStatus" @change="ordersByStatus"
                        class="select select-bordered w-full dark:bg-slate-800 dark:text-gray-300">
                        <option value="">All Statuses</option>
                        <option v-for="status in uniqueStatuses" :key="status" :value="status">
                            {{ status }}
                        </option>
                    </select>
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
                                <th class="dark:text-gray-300">
                                    Order ID
                                </th>
                                <th @click="sortBy('full_name')" class="cursor-pointer dark:text-gray-300">
                                    Customer Name
                                    <span>{{ getSortIcon('full_name') }}</span>
                                </th>
                                <th @click="sortBy('status')" class="cursor-pointer dark:text-gray-300">
                                    Status
                                    <span>{{ getSortIcon('status') }}</span>
                                </th>
                                <th @click="sortBy('price')" class="cursor-pointer dark:text-gray-300">
                                    Price
                                    <span>{{ getSortIcon('price') }}</span>
                                </th>
                                <th @click="sortBy('gender')" class="cursor-pointer dark:text-gray-300">
                                    Customer Gender
                                    <span>{{ getSortIcon('gender') }}</span>
                                </th>
                                <th class="dark:text-gray-300">
                                    Customer National Card ID
                                </th>
                                <th @click="sortBy('created_at')" class="cursor-pointer dark:text-gray-300">
                                    Date Created
                                    <span>{{ getSortIcon('created_at') }}</span>
                                </th>
                                <th class="dark:text-gray-300">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="searchQuery" v-for="order in searchedOrders" :key="order.id">
                                <td class="dark:text-gray-300">{{ order.order_id }}</td>
                                <td class="dark:text-gray-300">{{ order.full_name }}</td>
                                <td :class="{
                                    'text-green-500': order.status === 'paid',
                                    'text-red-600': order.status !== 'paid'
                                }">
                                    {{ order.status }}
                                </td>
                                <td class="dark:text-gray-300">${{ order.total_price }}</td>
                                <td class="dark:text-gray-300">{{ order.gender }}</td>
                                <td class="dark:text-gray-300">{{ order.national_card_id }}</td>
                                <td class="dark:text-gray-300">{{ formatDate(order.created_at) }}</td>
                                <td class="flex gap-1">
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditOrderModalFun(order)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteOrderConfirmation(order)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <tr v-else-if="selectedStatus" v-for="orderByStatus in selectedByStatusOrders"
                                :key="orderByStatus.id">
                                <td class="dark:text-gray-300">{{ orderByStatus.order_id }}</td>
                                <td class="dark:text-gray-300">{{ orderByStatus.full_name }}</td>
                                <td :class="{
                                    'text-green-500': orderByStatus.status === 'paid',
                                    'text-red-600': orderByStatus.status !== 'paid'
                                }">
                                    {{ orderByStatus.status }}
                                </td>
                                <td class="dark:text-gray-300">${{ orderByStatus.total_price }}</td>
                                <td class="dark:text-gray-300">{{ orderByStatus.gender }}</td>
                                <td class="dark:text-gray-300">{{ orderByStatus.national_card_id }}</td>
                                <td class="dark:text-gray-300">{{ formatDate(orderByStatus.created_at) }}</td>
                                <td class="flex gap-1">
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditOrderModalFun(orderByStatus)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteOrderConfirmation(orderByStatus)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <tr v-else v-for="ord in filteredAndSortedOrders" :key="ord.id">
                                <td class="dark:text-gray-300">{{ ord.order_id }}</td>
                                <td class="dark:text-gray-300">{{ ord.full_name }}</td>
                                <td :class="{
                                    'text-green-500': ord.status === 'paid',
                                    'text-red-600': ord.status !== 'paid'
                                }">
                                    {{ ord.status }}
                                </td>
                                <td class="dark:text-gray-300">${{ ord.total_price }}</td>
                                <td class="dark:text-gray-300">{{ ord.gender }}</td>
                                <td class="dark:text-gray-300">{{ ord.national_card_id }}</td>
                                <td class="dark:text-gray-300">{{ formatDate(ord.created_at) }}</td>
                                <td class="flex gap-1">
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 mr-2"
                                        @click="showEditOrderModalFun(ord)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteOrderConfirmation(ord)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>

                            <!-- Modal -->
                            <dialog v-if="showDeleteConfirmationModal" id="modal_delete_order_confirmation"
                                class="modal modal-bottom sm:modal-middle">
                                <div class="modal-box dark:bg-slate-700">
                                    <h3 class="text-lg font-bold dark:text-gray-300">Confirm Delete Order</h3>
                                    <p class="py-4 text-red-600 font-semibold">Are you sure you want to delete the
                                        selected order?</p>
                                    <div class="modal-action">
                                        <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                            @click="deleteOrder">Yes</button>
                                        <form method="dialog">
                                            <button
                                                class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-1000">Close</button>
                                        </form>
                                    </div>
                                </div>
                            </dialog>
                        </tbody>
                    </table>
                    <div v-if="!orders" class="animate-pulse w-full">
                        <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                    </div>
                </div>


                <!-- Edit Order Modal -->
                <dialog v-if="showEditOrderModal" id="my_edit_modal" class="modal">
                    <div class="modal-box dark:bg-slate-700">
                        <div class="py-4 flex flex-col gap-3">
                            <h3 class="text-lg font-bold dark:text-gray-300">Order Details</h3>
                            <!-- Order Status Select -->
                            <label class="form-control w-full max-w-xs">
                                <span class="label-text dark:text-gray-300">Order Status</span>
                                <select v-model="editOrderStatus"
                                    class="select select-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300">
                                    <option :value="editOrderStatus" selected>{{ capitalizeFirstLetter(editOrderStatus)
                                        }}</option>
                                    <option value="paid" v-if="editOrderStatus === 'unpaid'">Paid</option>
                                    <option value="unpaid" v-else>Unpaid</option>

                                </select>
                            </label>
                            <div class="modal-action">
                                <button @click="editOrder" id="editOrder-button"
                                    class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-12">
                                    Edit Order
                                </button>
                            </div>
                        </div>
                    </div>

                    <form method="dialog" class="modal-backdrop">
                        <button @click="closeEditModal">Close</button>
                    </form>
                </dialog>



                <!-- Pagination -->
                <SearchOrdersPagination :searchQuery="searchQuery" v-if="searchQuery" />
                <SelectOrdersByStatusPagination v-else-if="selectedStatus" :status="selectedStatus" />
                <OrdersPagination v-else />




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