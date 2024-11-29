import axios from 'axios';
import { defineStore } from 'pinia';

export const useFetchOperationReports = defineStore({
    id: 'fetchOperationReports',
    state: () => ({
        data: null,
        currentPage: null,
        itemsPerPage: null,
        totalPages: null,
        page: 1,
        searchedOperationReports: null,
        searchQuery: null,
        allDepartments: null
    }),

    actions: {
        async fetchOperationReports(page) {
            try {
                await axios.get('/fetch-operation-reports', {
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

        async fetchSearchedOperationReports(page, searchQuery) {
            try {
                await axios.get('/fetch-searched-operation-reports', {
                    params: { search_query: searchQuery, page: page },
                }).then((res) => {
                    this.totalOperationReports = res.data.total;
                    this.searchedOperationReports = res.data.data;
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
            try{
                await axios.get('/fetch-departments-in-operation-reports').then((res)=>{
                    this.allDepartments = res.data.departments
                }).catch((err)=>{
                    console.log(err)
                })
            }
            catch(error){
                console.log(error)
            }
        }
    }
});
