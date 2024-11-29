import axios from 'axios';
import { defineStore } from 'pinia';

export const useFetchBirthReports = defineStore({
    id: 'fetchBirthReports',
    state: () => ({
        data: null,
        currentPage: null,
        itemsPerPage: null,
        totalPages: null,
        page: 1,
        searchedBirthReports: null,
        searchQuery: null,
        allDepartments: null
    }),

    actions: {
        async fetchBirthReports(page) {
            try {
                await axios.get('/fetch-birth-reports', {
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

        async fetchSearchedBirthReports(page, searchQuery) {
            try {
                await axios.get('/fetch-searched-birth-reports', {
                    params: { search_query: searchQuery, page: page },
                }).then((res) => {
                    this.totalBirthReports = res.data.total;
                    this.searchedBirthReports = res.data.data;
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
                await axios.get('/fetch-departments-in-birth-reports').then((res) => {
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
