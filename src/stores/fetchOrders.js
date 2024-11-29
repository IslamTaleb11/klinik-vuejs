import axios from 'axios';
import { defineStore } from 'pinia';

export const useFetchOrders = defineStore({
    id: 'fetchOrders',
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
        countAllCancelled: 0,
    }),

    actions: {
        async fetchOrders(page) {
            try {
                const response = await axios.get('/fetch-orders', {
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

        async fetchSearchedOrders(page, searchQuery) {
            try {
                const response = await axios.get('/fetch-searched-orders', {
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

        async fetchOrdersByStatus(status, page) {
            try {
                const response = await axios.get('/fetch-orders-by-status', {
                    params: { status: status.toLowerCase(), page }
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

        async fetchOrdersCount() {
            try {
                const response = await axios.get('/count-orders');
                this.countAllOrders = response.data.allOrders;
                this.countAllPaid = response.data.paidOrders;
                this.countAllUnpaid = response.data.unpaidOrders;
            } catch (error) {
                console.log(error);
            }
        }
    }
});
