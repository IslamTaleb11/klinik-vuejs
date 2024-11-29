import axios from 'axios';
import { defineStore } from 'pinia';


export const useDepartments = defineStore({
    id: 'departments',
    state: () => ({
        defaultData: null,
        page: 1,
        currentPage: null,
        itemsPerPage: null,
        totalPages: null,
        totalDepartments: null,
        searchedDepartments: null,
    }),

    actions: {
        async fetchDepartments (page){
            try{
                await axios.get('/fetch-departments',{
                    params: {page}
                }).then((res)=>{
                    this.defaultData = res.data.data
                    this.currentPage = res.data.current_page
                    this.itemsPerPage = res.data.per_page
                    this.totalPages = res.data.last_page
                    this.totalDepartments = res.data.data.length
                }).catch((err)=>{
                    console.log(err)
                })
            }
            catch(error){
                console.log(error)
            }
            
        },

        async fetchSearchedDepartments (page, seachQuery){
            try{
                await axios.get('/fetch-searched-departments',{
                    params: { search_query: seachQuery, page:page },
                }).then((res)=>{
                    this.totalUsers = res.data.departments.total
                    this.searchedDepartments = res.data.departments.data
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

        // async addDepartment(name, slug, description){
        //     try{
        //         await axios.post('/add-department',{
        //             name: name,
        //             slug: slug,
        //             description: description
        //         }).then((res)=>{
        //             console.log(res)
        //         }).catch((err)=>{
        //             console.log(err)
        //         })
        //     }
        //     catch(error){
        //         console.log(error)
        //     }
        // }
    }


    


});

