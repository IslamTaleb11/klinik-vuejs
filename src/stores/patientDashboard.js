import { ref } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';

export const usePatientDashboard = defineStore({
    id: 'patientDashboard',
    state: () => ({
        appointments: null,
        orders: null,
        totalAppointments: 0,
        totalOrders: 0
    }),
    actions: {
        async getPatientDashboardData() {
            try {
                await axios.get('/patient-dashboard-data').then((res)=>{
                    this.appointments = res.data.appointments
                    this.orders = res.data.orders
                    this.totalAppointments = res.data.totalAppointments
                    this.totalOrders = res.data.totalOrders
                }).catch((err)=>{
                    console.log(err)
                });
            } catch (error) {
                 console.error('Error fetching auth status:', error);
            }
        },
    }

});

