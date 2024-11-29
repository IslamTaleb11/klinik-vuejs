import axios from 'axios';
import { defineStore } from 'pinia';

export const useFetchBloodDonors = defineStore({
    id: 'fetchBloodDonors',
    state: () => ({
        data: null,
        currentPage: null,
        itemsPerPage: null,
        totalPages: null,
        page: 1,
        searchedBloodDonors: null,
        searchQuery: null,
    }),

    actions: {
        async fetchBloodDonors(page) {
            try {
                await axios.get('/fetch-blood-donors', {
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

        async fetchSearchedBloodDonors(page, searchQuery) {
            try {
                await axios.get('/fetch-searched-blood-donors', {
                    params: { search_query: searchQuery, page: page },
                }).then((res) => {
                    this.totalBloodDonors = res.data.total;
                    this.searchedBloodDonors = res.data.data;
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
