import { ref } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';

export const useAdminDashboard = defineStore({
    id: 'adminDashboard',
    state: () => ({
        appointments: null,
        generalProfit: null,
        topPayingPatients: null,
        orders: null,
        ordersGeneralProfit: null,

    }),
    actions: {
        async getDoctorsAppointments() {
            try {
                await axios.get('/admin-appointments-for-charts').then((res)=>{
                    this.appointments = res.data.appointments
                    this.generalProfit = res.data.appointmentsGeneralProfit
                    this.topPayingPatients = res.data.topPayingPatients
                    this.orders = res.data.orders
                    this.ordersGeneralProfit = res.data.ordersGeneralProfit
                }).catch((err)=>{
                    console.log(err)
                });
            } catch (error) {
                 console.error('Error fetching auth status:', error);
            }
        },

    }

});

