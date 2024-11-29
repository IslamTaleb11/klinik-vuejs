import axios from 'axios';
import { defineStore } from 'pinia';


export const useAppointmentsReservasion = defineStore({
    id: 'appointmentsReservasion',
    state: () => ({
        departments: null,
        doctors: null
    }),

    actions: {
        async fetchDepartments (){
            try{
                await axios.get('/appointments-fetch-departments').then((res)=>{
                    this.departments = res.data.data
                }).catch((err)=>{
                    console.log(err)
                })
            }
            catch(error){
                console.log(error)
            }
            
        },

        async fetchDoctors (departmentId){
            try{
                await axios.post('/appointments-fetch-doctors',{
                    departmentId: departmentId,
                }).then((res)=>{
                    this.doctors = res.data.data
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

