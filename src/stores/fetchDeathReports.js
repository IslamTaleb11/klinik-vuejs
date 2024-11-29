import axios from 'axios';
import { defineStore } from 'pinia';

export const useFetchDeathReports = defineStore({
    id: 'fetchDeathReports',
    state: () => ({
        data: null,
        currentPage: null,
        itemsPerPage: null,
        totalPages: null,
        page: 1,
        searchedDeathReports: null,
        searchQuery: null,
        allDepartments: null
    }),

    actions: {
        async fetchDeathReports(page) {
            try {
                await axios.get('/fetch-death-reports', {
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

        async fetchSearchedDeathReports(page, searchQuery) {
            try {
                await axios.get('/fetch-searched-death-reports', {
                    params: { search_query: searchQuery, page: page },
                }).then((res) => {
                    this.totalDeathReports = res.data.total;
                    this.searchedDeathReports = res.data.data;
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
                await axios.get('/fetch-departments-in-death-reports').then((res) => {
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
