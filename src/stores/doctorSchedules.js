import axios from 'axios';
import { defineStore } from 'pinia';


export const useDoctorSchedules = defineStore({
    id: 'doctorSchedules',
    state: () => ({
        startTime: null,
        endTime: null,
        availableTimes: null,
        message: null
    }),

    actions: {
        async fetchTimes() {
            try{
                await axios.get('/doctor-schedules-fetch-times').then((res)=>{
                    this.startTime = res.data.data.start_time
                    this.endTime = res.data.data.end_time
                    this.message = res.data.data.message
                }).catch((err)=>{
                    console.log(err)
                })
            }
            catch(error){
                console.log(error)
            }
        },

        async fetchAvailability() {
            try{
                await axios.get('/doctor-schedules-fetch-availability').then((res)=>{
                    this.availableTimes = res.data
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

