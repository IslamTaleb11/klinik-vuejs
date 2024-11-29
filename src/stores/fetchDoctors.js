import axios from 'axios';
import { defineStore } from 'pinia';


export const useFetchDoctors = defineStore({
    id: 'fetchDoctors',
    state: () => ({
        data: null,
        currentPage: null,
        itemsPerPage: null,
        totalPages: null,
        page: 1,
        searchedDoctors: null,
        searchQuery: null,
        totalDoctors: null,
        allDepartments: [],
    }),

    actions: {
        async fetchDoctors (page){
            try{
                await axios.get('/fetch-doctors',{
                    params: {page}
                }).then((res)=>{
                    this.currentPage = res.data.current_page
                    this.itemsPerPage = res.data.per_page
                    this.totalPages = res.data.last_page
                    this.data = res.data.data
                    this.totalUsers = res.data.data.length
                }).catch((err)=>{
                    console.log(err)
                })
            }
            catch(error){
                console.log(error)
            }
            
        },

        async fetchSearchedDoctors (page, seachQuery){
            try{
                await axios.get('/fetch-searched-doctors',{
                    params: { search_query: seachQuery, page:page },
                }).then((res)=>{
                    this.totalDoctors = res.data.total
                    this.searchedDoctors = res.data.doctors
                    this.itemsPerPage = res.data.per_page
                    this.currentPage = res.data.current_page
                    this.totalPages = res.data.last_page
                }).catch((err)=>{
                    console.log(err)
                })
            }
            catch(error){
                console.log(error)
            }
            
        },

        async fetchDepartments() {
            try{
                await axios.get('/fetch-departments-in-doctors').then((res)=>{
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

