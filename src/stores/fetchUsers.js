import axios from 'axios';
import { defineStore } from 'pinia';


export const useFetchUsers = defineStore({
    id: 'fetchUsers',
    state: () => ({
        data: null,
        currentPage: null,
        itemsPerPage: null,
        totalPages: null,
        page: 1,
        searchedUsers: null,
        searchQuery: null,
        totalUsers: null,
        selectedByRoleUsers: null,
        isLoading: true,
        successChangeRole: null,
        countAllUsers: 0,
        countAllAdmins: 0,
        countAllDoctors: 0,
        countAllNurses: 0,
        countAllPharmacists: 0,
        countAllLaboratorists: 0,
        countAllPatients: 0,
    }),

    actions: {
        async fetchUsers (page){
            try{
                await axios.get('/fetch-users',{
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

        async fetchSearchedUsers (page, seachQuery){
            try{
                await axios.get('/fetch-searched-users',{
                    params: { search_query: seachQuery, page:page },
                }).then((res)=>{
                    this.totalUsers = res.data.users.total
                    this.searchedUsers = res.data.users.data
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


        async fetchUsersByRole (role, page){
            try{
                await axios.get('/fetch-users-by-role',{ 
                    params: { role:role.toLowerCase(), page:page },
                }).then((res)=>{
                    this.totalUsers = res.data.users.total
                    this.selectedByRoleUsers = res.data.users.data
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

        async fetchUsersCount() {
            try{
                await axios.get('/count-users').then((res)=>{
                    this.countAllUsers = res.data.allUsers
                    this.countAllAdmins = res.data.allAdmins
                    this.countAllDoctors = res.data.allDoctors
                    this.countAllNurses = res.data.allNurses
                    this.countAllPharmacists = res.data.allPharmacists
                    this.countAllLaboratorists = res.data.allLaboratorists
                    this.countAllPatients = res.data.allPatients
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

