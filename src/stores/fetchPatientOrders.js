import axios from 'axios';
import { defineStore } from 'pinia';

export const useFetchPatientOrders = defineStore({
    id: 'fetchPatientOrders',
    state: () => ({
        data: null,
        currentPage: null,
        itemsPerPage: null,
        totalPages: null,
        page: 1,
        searchedOrders: null,
        searchQuery: null,
        totalOrders: null,
        selectedOrdersByStatus: null,
        isLoading: true,
        successChangeStatus: null,
        countAllOrders: 0,
        countAllPaid: 0,
        countAllUnpaid: 0,

    }),

    actions: {
        async fetchPatientOrders(page) {
            try {
                const response = await axios.get('/fetch-patient-orders', {
                    params: { page }
                });
                this.currentPage = response.data.current_page;
                this.itemsPerPage = response.data.per_page;
                this.totalPages = response.data.last_page;
                this.data = response.data.data;
                this.totalOrders = response.data.data.length;
            } catch (error) {
                console.log(error);
            }
        },

        async fetchSearchedPatientOrders(page, searchQuery) {
            try {
                const response = await axios.get('/fetch-searched-patient-orders', {
                    params: { search_query: searchQuery, page }
                });
                this.totalOrders = response.data.orders.total;
                this.searchedOrders = response.data.orders.data;
                this.itemsPerPage = response.data.per_page;
                this.currentPage = response.data.current_page;
                this.totalPages = response.data.last_page;
            } catch (error) {
                console.log(error);
            }
        },

        async fetchPatientOrdersByStatus(paymentStatus, page) {
            try {
                const response = await axios.get('/fetch-patient-orders-by-status', {
                    params: { paymentStatus: paymentStatus.toLowerCase(), page }
                });
                this.totalOrders = response.data.orders.total;
                this.selectedOrdersByStatus = response.data.orders.data;
                this.itemsPerPage = response.data.per_page;
                this.currentPage = response.data.current_page;
                this.totalPages = response.data.last_page;
            } catch (error) {
                console.log(error);
            }
        },

        async fetchPatientOrdersCount() {
            try {
                const response = await axios.get('/count-patient-orders');
                this.countAllOrders = response.data.allOrders;
                this.countAllPaid = response.data.paidOrders;
                this.countAllUnpaid = response.data.unpaidOrders;
            } catch (error) {
                console.log(error);
            }
        }
    }
});
