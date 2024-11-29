import axios from 'axios';
import { defineStore } from 'pinia';

export const useFetchVaccines = defineStore({
    id: 'fetchVaccines',
    state: () => ({
        data: null,
        currentPage: null,
        itemsPerPage: null,
        totalPages: null,
        page: 1,
        searchedVaccines: null,
        searchQuery: null,
    }),

    actions: {
        async fetchVaccines(page) {
            try {
                await axios.get('/fetch-vaccines', {
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

        async fetchSearchedVaccines(page, searchQuery) {
            try {
                await axios.get('/fetch-searched-vaccines', {
                    params: { search_query: searchQuery, page: page },
                }).then((res) => {
                    this.searchedVaccines = res.data.data;
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
