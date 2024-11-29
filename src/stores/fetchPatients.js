import axios from 'axios';
import { defineStore } from 'pinia';

export const useFetchPatients = defineStore({
    id: 'fetchPatients',
    state: () => ({
        data: null,
        currentPage: null,
        itemsPerPage: null,
        totalPages: null,
        page: 1,
        searchedPatients: null,
        searchQuery: null,
        appointments: null,
        orders: null
    }),

    actions: {
        async fetchPatients(page) {
            try {
                await axios.get('/fetch-patients', {
                    params: { page }
                }).then((res) => {
                    this.currentPage = res.data.current_page;
                    this.itemsPerPage = res.data.per_page;
                    this.totalPages = res.data.last_page;
                    this.data = res.data.data;
                }).catch((err) => {
                    console.log(err);
                });
            } catch (error) {
                console.log(error);
            }
        },

        async fetchSearchedPatients(page, searchQuery) {
            try {
                await axios.get('/fetch-searched-patients', {
                    params: { search_query: searchQuery, page: page },
                }).then((res) => {
                    this.totalPatients = res.data.total;
                    this.searchedPatients = res.data.data;
                    this.itemsPerPage = res.data.per_page;
                    this.currentPage = res.data.current_page;
                    this.totalPages = res.data.last_page;
                }).catch((err) => {
                    console.log(err);
                });
            } catch (error) {
                console.log(error);
            }
        },

        async fetchPatientAppointmentsAndOrders() {
            try {
                await axios.get('/fetch-patient-appointments-and-orders').then((res) => {
                   this.appointments = res.data.appointments
                   this.orders = res.data.orders
                }).catch((err) => {
                    console.log(err);
                });
            } catch (error) {
                console.log(error);
            }
        },
    }
});
