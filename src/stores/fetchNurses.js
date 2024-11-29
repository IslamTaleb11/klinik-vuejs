import axios from 'axios';
import { defineStore } from 'pinia';


export const useFetchNurses = defineStore({
    id: 'fetchNurses',
    state: () => ({
        data: null,
        currentPage: null,
        itemsPerPage: null,
        totalPages: null,
        page: 1,
        searchedNurses: null,
        searchQuery: null,
        totalDoctors: null,
        allDepartments: [],
    }),

    actions: {
        async fetchNurses (page){
            try{
                await axios.get('/fetch-nurses',{
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

        async fetchSearchedNurses (page, seachQuery){
            try{
                await axios.get('/fetch-searched-nurses',{
                    params: { search_query: seachQuery, page:page },
                }).then((res)=>{
                    this.totalNurses = res.data.total
                    this.searchedNurses = res.data.data
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

    }


    


});

