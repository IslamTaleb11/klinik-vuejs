import { ref } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';

export const useDoctorDashboard = defineStore({
    id: 'doctorDashboard',
    state: () => ({
        appointments: null,
        generalProfit: null,
        patientsByMonths: null,
        upcomingAppointments: null,
        topPayingPatients: null
    }),
    actions: {
        async getDoctorAppointments() {
            try {
                await axios.get('/doctor-appointments-for-charts').then((res)=>{
                    this.appointments = res.data.appointments
                    this.generalProfit = res.data.generalProfit
                    this.patientsByMonths = res.data.patientsByMonths
                }).catch((err)=>{
                    console.log(err)
                });
            } catch (error) {
                 console.error('Error fetching auth status:', error);
            }
        },

        async getDoctorUpcomingAppointments() {
            try {
                await axios.get('/doctor-upcoming-appointments').then((res)=>{
                    this.upcomingAppointments = res.data.upcomingAppointments
                    this.topPayingPatients = res.data.bestPayingPatients

                }).catch((err)=>{
                    console.log(err)
                });
            } catch (error) {
                 console.error('Error fetching auth status:', error);
            }
        }
    }

});

