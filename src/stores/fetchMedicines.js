import axios from 'axios';
import { defineStore } from 'pinia';

export const useFetchMedicines = defineStore({
    id: 'fetchMedicines',
    state: () => ({
        data: null,
        currentPage: null,
        itemsPerPage: null,
        totalPages: null,
        page: 1,
        searchedMedicines: null,
        searchQuery: null,
        allCategories: null
    }),

    actions: {
        async fetchMedicines(page) {
            try {
                await axios.get('/fetch-medicines', {
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

        async fetchSearchedMedicines(page, searchQuery) {
            try {
                await axios.get('/fetch-searched-medicines', {
                    params: { search_query: searchQuery, page: page },
                }).then((res) => {
                    this.searchedMedicines = res.data.data;
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

        async fetchCategories() {
            try {
                await axios.get('/fetch-medicine-categories').then((res) => {
                    this.allCategories = res.data.categories;
                }).catch((err) => {
                    console.log(err);
                });
            } catch (error) {
                console.log(error);
            }
        }
    }
});
