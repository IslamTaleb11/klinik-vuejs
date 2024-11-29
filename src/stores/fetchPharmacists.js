import axios from 'axios';
import { defineStore } from 'pinia';

export const useFetchPharmacists = defineStore({
    id: 'fetchPharmacists',
    state: () => ({
        data: null,
        currentPage: null,
        itemsPerPage: null,
        totalPages: null,
        page: 1,
        searchedPharmacists: null,
        searchQuery: null,
    }),

    actions: {
        async fetchPharmacists(page) {
            try {
                await axios.get('/fetch-pharmacists', {
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

        async fetchSearchedPharmacists(page, searchQuery) {
            try {
                await axios.get('/fetch-searched-pharmacists', {
                    params: { search_query: searchQuery, page: page },
                }).then((res) => {
                    this.totalPharmacists = res.data.total;
                    this.searchedPharmacists = res.data.data;
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
