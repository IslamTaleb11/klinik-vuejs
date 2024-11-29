<script setup>
import SideBar from '../../../components/dashboard/SideBar.vue';
import Header from '../../../components/dashboard/Header.vue';
import Chart from 'primevue/chart';
import { ref, onMounted, computed } from "vue";
import { useDoctorDashboard } from '../../../stores/doctorDashboard';
import Timeline from 'primevue/timeline';


const doctorDashboard = useDoctorDashboard()
const appointments = computed(() => doctorDashboard.appointments)
const topPayingPatients = computed(() => doctorDashboard.topPayingPatients)

onMounted(async () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
    pieChartData.value = setPieChartData();
    pieChartOptions.value = setPieChartOptions();
    lineChartData.value = setLineChartData();
    lineChartOptions.value = setLineChartOptions();
    CompareBetweenLastMonthAndCurrentMonth()
});
const upcomingAppointments = computed(() => doctorDashboard.upcomingAppointments)



const chartData = ref();
const chartOptions = ref();

const setChartData = () => {
    const months = Object.keys(appointments.value); // Get the months as an array
    const appointmentCounts = months.map(month => appointments.value[month].appointmentCount); // Extract the appointmentCount for each month
    return {
        labels: months,
        datasets: [
            {
                label: 'Appointments',
                data: appointmentCounts,
                backgroundColor: ['rgba(249, 115, 22, 0.2)', 'rgba(6, 182, 212, 0.2)', 'rgb(107, 114, 128, 0.2)', 'rgba(139, 92, 246 0.2)'],
                borderColor: ['rgb(249, 115, 22)', 'rgb(6, 182, 212)', 'rgb(107, 114, 128)', 'rgb(139, 92, 246)'],
                borderWidth: 1
            }
        ]
    };
};

const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
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
}


const pieChartData = ref();
const pieChartOptions = ref();

const setPieChartData = () => {
    const months = Object.keys(appointments.value); // Get the months as an array
    const profit = months.map(month => appointments.value[month].totalProfit); // Extract the appointmentCount for each month
    const documentStyle = getComputedStyle(document.body);

    return {
        labels: months,
        datasets: [
            {
                data: profit,
                backgroundColor: [
                    documentStyle.getPropertyValue('--p-cyan-500'),
                    documentStyle.getPropertyValue('--p-orange-500'),
                    documentStyle.getPropertyValue('--p-gray-500'),
                    documentStyle.getPropertyValue('--p-blue-500'),
                    documentStyle.getPropertyValue('--p-green-500'),
                    documentStyle.getPropertyValue('--p-red-500'),
                    documentStyle.getPropertyValue('--p-yellow-500'),
                    documentStyle.getPropertyValue('--p-purple-500'),
                    documentStyle.getPropertyValue('--p-pink-500'),
                    '#8B5CF6',
                    '#F56A1B',
                    '#F59E0B'
                ],
                hoverBackgroundColor: [
                    documentStyle.getPropertyValue('--p-cyan-400'),
                    documentStyle.getPropertyValue('--p-orange-400'),
                    documentStyle.getPropertyValue('--p-gray-400'),
                    documentStyle.getPropertyValue('--p-blue-400'),
                    documentStyle.getPropertyValue('--p-green-400'),
                    documentStyle.getPropertyValue('--p-red-400'),
                    documentStyle.getPropertyValue('--p-yellow-400'),
                    documentStyle.getPropertyValue('--p-purple-400'),
                    documentStyle.getPropertyValue('--p-pink-400'),
                    '#A78BFA',
                    '#F472B6',
                    '#FBBF24'
                ]
            }
        ]
    };
};

const setPieChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');

    return {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: '#9b9b9b'
                }
            }
        }
    };
};
let growthPercent = 0;
const CompareBetweenLastMonthAndCurrentMonth = () => {
    const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
    const previousMonthName = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'long' })
    const currentMonthProfit = appointments.value[currentMonthName]?.totalProfit || 0
    const previousMonthProfit = appointments.value[previousMonthName]?.totalProfit || 0
    if (previousMonthProfit > 0) {
        growthPercent = ((currentMonthProfit - previousMonthProfit) / previousMonthProfit) * 100
        console.log(growthPercent)
    } else if (currentMonthProfit > 0) {
        // If previous month's profit is 0 and current month's profit is greater than 0, it implies 100% growth.
        growthPercent = 100
    }
    return growthPercent
};






const lineChartData = ref();
const lineChartOptions = ref();

const setLineChartData = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const lastSixMonths = ref([])
    const months = Object.keys(doctorDashboard.patientsByMonths)
    months.forEach(month => {
        lastSixMonths.value.push(month)
    });
    const data = ref([])
    months.forEach(month => {
        data.value.push(doctorDashboard.patientsByMonths[month].length)
    });

    return {
        labels: months,
        datasets: [
            {
                label: 'Patients',
                fill: false,
                borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
                yAxisID: 'y',
                tension: 0.4,
                data: data.value
            },
        ]
    };
};

const setLineChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        stacked: false,
        maintainAspectRatio: false,
        aspectRatio: 0.6,
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
                type: 'linear',
                display: true,
                position: 'left',
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    drawOnChartArea: false,
                    color: surfaceBorder
                }
            }
        }
    };
}
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const events = upcomingAppointments.value.reverse().map(app => ({
    status: capitalize(app.general_status),
    date: app.date + '-' + app.start_time,
    icon: '<i class="fa-solid fa-calendar-check" style="color: #63E6BE;"></i>',
    color: '#9C27B0'
}));


</script>


<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg h-[140vh] flex w-full">
        <div class="min-[1024px]:w-[30%] flex self-start">
            <SideBar />
        </div>

        <div class="flex flex-col items-center w-full min-[1025px]:w-[75%] gap-5">
            <div class="flex justify-center w-full">
                <Header />
            </div>

            <div class="w-[90%] gap-5 flex mt-4 h-fit max-[1700px]:flex-col">
                <!-- Scheduled/Completed Appointments Section -->
                <div
                    class="w-[60%] rounded-3xl bg-white dark:bg-gray-900 shadow-lg max-[1700px]:w-full flex h-full p-5 items-center justify-center flex-col gap-5">
                    <h1 class="flex self-start font-jakarta font-semibold text-xl dark:text-gray-300">
                        Scheduled/Completed Appointments
                    </h1>
                    <div id="chart-container">
                        <Chart type="bar" id="chart" :data="chartData" :options="chartOptions" />
                    </div>
                </div>

                <!-- Per Month Profit and Pie Chart Section -->
                <div class="w-[40%] gap-5 flex flex-col max-[1700px]:w-full">
                    <div class="flex max-[500px]:flex-col gap-5 dark:bg-gray-900 bg-white rounded-3xl shadow-lg h-fit">
                        <div class="w-1/2 p-8 flex flex-col gap-5 h-fit">
                            <h1 class="flex font-jakarta font-semibold text-xl dark:text-gray-300">
                                Per Month Profit
                            </h1>
                            <h1 class="flex font-jakarta font-semibold text-xl dark:text-gray-300">
                                General Profit:
                            </h1>
                            <p class="font-jakarta font-bold text-xl text-green-500">
                                ${{ Number(doctorDashboard.generalProfit).toFixed(2) }}
                            </p>
                            <p class="font-jakarta font-semibold">
                                <span v-if="growthPercent > 0" class="flex gap-2 items-center dark:text-gray-300">
                                    <i class="fa-solid fa-arrow-trend-up" style="color: #25b408;"></i>
                                    +{{ growthPercent }}% <p class="text-sm dark:text-gray-300">last month</p>
                                </span>
                                <span v-else-if="growthPercent === 0" class="flex gap-2 items-center dark:text-gray-300">
                                    <i class="fa-solid fa-equals" style="color: #FFD43B;"></i>
                                    {{ growthPercent }}% <p class="text-sm dark:text-gray-300">last month</p>
                                </span>
                                <span v-else class="flex gap-2 items-center dark:text-gray-300">
                                    <i class="fa-solid fa-arrow-trend-down" style="color: #f50505;"></i>
                                    -{{ growthPercent }}% <p class="text-sm dark:text-gray-300">last month</p>
                                </span>
                            </p>
                        </div>
                        <div class="w-1/2 p-3 h-full flex items-center max-[500px]:w-full">
                            <Chart type="pie" :data="pieChartData" :options="pieChartOptions" class="w-full" />
                        </div>
                    </div>

                    <!-- Patients Registered By Month Chart -->
                    <div class="w-full bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-5">
                        <h1 class="flex font-jakarta font-semibold text-xl dark:text-gray-300">
                            Patients Registered By Month
                        </h1>
                        <Chart type="line" :data="lineChartData" :options="lineChartOptions" />
                    </div>
                </div>
            </div>


            <!-- Upcoming Appointments and Top Paying Patients Section -->
            <div class="w-[90%] flex gap-5 max-[1700px]:flex-col">
                <div class="w-[40%] bg-white dark:bg-gray-900 p-5 shadow-lg rounded-3xl max-[1700px]:w-full">
                    <h1 class="flex self-start font-jakarta font-semibold text-xl dark:text-gray-300">
                        Upcoming Appointments
                    </h1>
                    <div v-if="upcomingAppointments.length > 0" class="card p-5">
                        <Timeline :value="events">
                            <template #opposite="slotProps">
                                <small class="text-surface-500 dark:text-surface-400 dark:text-gray-300">
                                    {{ slotProps.item.date }}
                                </small>
                            </template>
                            <template #content="slotProps">
                                <small class="dark:text-gray-300">
                                    {{ slotProps.item.status }}
                                </small>
                                
                            </template>
                        </Timeline>
                    </div>
                    <h1 v-else class="font-jakarta text-xl font-semibold mt-5 dark:text-gray-400">No Available Data</h1>
                </div>
                <div class="w-[60%] bg-white dark:bg-gray-900 shadow-lg rounded-3xl p-5 max-[1700px]:w-full">
                    <h1 class="flex self-start font-jakarta font-semibold text-xl dark:text-gray-300">
                        Top Appointments Paying Patients
                    </h1>
                    <div class="overflow-x-auto mt-3">
                        <table class="table">
                            <!-- head -->
                            <thead>
                                <tr v-if="topPayingPatients.length > 0">
                                    <th class="dark:text-gray-300">Name</th>
                                    <th class="dark:text-gray-300">Email</th>
                                    <th class="dark:text-gray-300">Total Patient Pay</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- row 1 -->
                                <tr v-if="topPayingPatients" v-for="patient in topPayingPatients">
                                    <td class="dark:text-gray-300">{{ patient.user.name }}</td>
                                    <td class="dark:text-gray-300">{{ patient.user.email }}</td>
                                    <td class="dark:text-gray-300">${{ patient.totalPaying }}</td>
                                </tr>
                                <tr v-else>
                                    <h1 class="font-jakarta text-xl font-semibold dark:text-gray-400">No Available Data</h1>
                                </tr>
                            </tbody>
                        </table>
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