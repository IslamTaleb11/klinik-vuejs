import axios from 'axios';
import { defineStore } from 'pinia';

export const useFetchBedAllotments = defineStore({
    id: 'fetchBedAllotments',
    state: () => ({
        data: null,
        currentPage: null,
        itemsPerPage: null,
        totalPages: null,
        page: 1,
        searchedBedAllotments: null,
        searchQuery: null,
        allDepartments: null
    }),

    actions: {
        async fetchBedAllotments(page) {
            try {
                await axios.get('/fetch-bed-allotments', {
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

        async fetchSearchedBedAllotments(page, searchQuery) {
            try {
                await axios.get('/fetch-searched-bed-allotments', {
                    params: { search_query: searchQuery, page: page },
                }).then((res) => {
                    this.totalBedAllotments = res.data.total;
                    this.searchedBedAllotments = res.data.data;
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

        async fetchDepartments() {
            try {
                await axios.get('/fetch-departments-in-bed-allotments').then((res) => {
                    this.allDepartments = res.data.departments;
                }).catch((err) => {
                    console.log(err);
                });
            } catch (error) {
                console.log(error);
            }
        }
    }
});
