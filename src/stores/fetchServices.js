import axios from 'axios';
import { defineStore } from 'pinia';

export const useFetchServices = defineStore({
    id: 'fetchServices',
    state: () => ({
        data: null,
        currentPage: null,
        itemsPerPage: null,
        totalPages: null,
        page: 1,
        searchedServices: null,
        searchQuery: null,
    }),

    actions: {
        async fetchServices(page) {
            try {
                await axios.get('/fetch-services', {
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

        async fetchSearchedServices(page, searchQuery) {
            try {
                await axios.get('/fetch-searched-services', {
                    params: { search_query: searchQuery, page: page },
                }).then((res) => {
                    this.searchedServices = res.data.data;
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
    }
});
