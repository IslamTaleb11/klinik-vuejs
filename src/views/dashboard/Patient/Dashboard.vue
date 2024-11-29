<script setup>
import SideBar from '../../../components/dashboard/SideBar.vue';
import Header from '../../../components/dashboard/Header.vue';
import Chart from 'primevue/chart';
import { ref, onMounted, computed } from "vue";
import { usePatientDashboard } from '../../../stores/patientDashboard';

const patientDashboard = usePatientDashboard();
const appointments = patientDashboard.appointments;
const orders = patientDashboard.orders;

const totalAppointments = patientDashboard.totalAppointments
const totalOrders = patientDashboard.totalOrders

onMounted(() => {
    lineChartData.value = setLineChartData();
    lineChartOptions.value = setLineChartOptions();

    barChartData.value = setBarChartData();
    barChartOptions.value = setBarChartOptions();
});

const lineChartData = ref();
const lineChartOptions = ref();

const setLineChartData = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const months = Object.keys(appointments);
    const appointmentsCount = ref([]);
    months.forEach(month => {
        appointmentsCount.value.push(appointments[month].appointmentCount);
    });
    return {
        labels: months,
        datasets: [
            {
                label: 'Appointments',
                data: appointmentsCount.value,
                fill: false,
                borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
                tension: 0.4
            }
        ]
    };
};

const setLineChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#9b9b9b'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
};

const barChartData = ref();
const barChartOptions = ref();

const setBarChartData = () => {
    const months = Object.keys(orders);
    const ordersCount = ref([]);
    months.forEach(month => {
        ordersCount.value.push(orders[month].orderCount);
    });
    return {
        labels: months,
        datasets: [
            {
                label: 'Orders',
                data: ordersCount.value,
                backgroundColor: ['rgba(249, 115, 22, 0.2)', 'rgba(6, 182, 212, 0.2)', 'rgb(107, 114, 128, 0.2)', 'rgba(139, 92, 246 0.2)'],
                borderColor: ['rgb(249, 115, 22)', 'rgb(6, 182, 212)', 'rgb(107, 114, 128)', 'rgb(139, 92, 246)'],
                borderWidth: 1
            }
        ]
    };
};

const setBarChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        plugins: {
            legend: {
                labels: {
                    color: '#9b9b9b'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
};
</script>



<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg min-h-screen flex w-full">
        <div class="min-[1024px]:w-[30%] flex self-start">
            <SideBar />
        </div>

        <div class="flex flex-col items-center w-full min-[1025px]:w-[75%] gap-5">
            <div class="flex justify-center w-full">
                <Header />
            </div>

            <!-- Total Appointments and Total Orders Section -->
            <div class="w-[90%] mt-4 h-fit flex justify-between space-x-4">
                <div
                    class="w-[50%] rounded-3xl bg-white dark:bg-gray-900 shadow-lg flex h-full min-h-[10rem] p-5 items-center justify-center flex-col">
                    <h1
                        class="font-jakarta font-semibold text-xl dark:text-gray-300 text-center">
                        Total Appointments</h1>
                    <p class="text-4xl font-bold dark:text-gray-100">{{ totalAppointments }}</p>
                </div>
                <div
                    class="w-[50%] rounded-3xl bg-white dark:bg-gray-900 shadow-lg flex h-full min-h-[10rem] p-5 items-center justify-center flex-col">
                    <h1
                        class="font-jakarta font-semibold text-xl dark:text-gray-300 text-center">
                        Total Orders</h1>
                    <p class="text-4xl font-bold dark:text-gray-100">{{ totalOrders }}</p>
                </div>


            </div>

            <!-- Charts for Appointments and Orders -->
            <div class="w-[90%] mt-4 h-fit flex-col space-y-10">
                <div
                    class="w-full rounded-3xl bg-white dark:bg-gray-900 shadow-lg flex h-fit p-5 items-center justify-center flex-col gap-5">
                    <h1 class="flex self-start font-jakarta font-semibold text-xl dark:text-gray-300">My Appointments
                        Per Month</h1>
                    <div id="chart-container">
                        <Chart type="line" :data="lineChartData" :options="lineChartOptions" class="h-[30rem]" />
                    </div>
                </div>

                <div
                    class="w-full rounded-3xl bg-white dark:bg-gray-900 shadow-lg flex h-fit p-5 items-center justify-center flex-col gap-5">
                    <h1 class="flex self-start font-jakarta font-semibold text-xl dark:text-gray-300">My Orders Per
                        Month</h1>
                    <div id="chart-container">
                        <Chart type="bar" :data="barChartData" :options="barChartOptions" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>



<style scoped>
#chart-container {
    width: 100%;
    height: 100%;
}
</style>