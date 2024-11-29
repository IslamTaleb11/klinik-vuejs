import axios from 'axios';
import { defineStore } from 'pinia';


export const useFetchLaboratorists = defineStore({
    id: 'fetchLaboratorists',
    state: () => ({
        data: null,
        currentPage: null,
        itemsPerPage: null,
        totalPages: null,
        page: 1,
        searchedLaboratorists: null,
        searchQuery: null,
        totalDoctors: null,
    }),

    actions: {
        async fetchLaboratorists (page){
            try{
                await axios.get('/fetch-laboratorists',{
                    params: {page}
                }).then((res)=>{
                    this.currentPage = res.data.current_page
                    this.itemsPerPage = res.data.per_page
                    this.totalPages = res.data.last_page
                    this.data = res.data.data
                }).catch((err)=>{
                    console.log(err)
                })
            }
            catch(error){
                console.log(error)
            }
            
        },

        async fetchSearchedLaboratorists (page, seachQuery){
            try{
                await axios.get('/fetch-searched-laboratorists',{
                    params: { search_query: seachQuery, page:page },
                }).then((res)=>{
                    this.totalLaboratorists = res.data.total
                    this.searchedLaboratorists = res.data.data
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

