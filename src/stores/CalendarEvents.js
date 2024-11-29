import axios from 'axios';
import { defineStore } from 'pinia';


export const useCalendarEvents = defineStore({
    id: 'calendarEvents',
    state: () => ({
        events: null,
        startTime: null,
        endTime: null
    }),

    actions: {
        async fetchEvents (){
            try{
                await axios.get('/appointments-events').then((res)=>{
                    this.events = res.data.events
                    this.startTime = res.data.start_time
                    this.endTime = res.data.end_time
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

