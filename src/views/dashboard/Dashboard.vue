<script setup>
import SideBar from '../../components/dashboard/SideBar.vue';
import Header from '../../components/dashboard/Header.vue';
import Chart from 'primevue/chart';
import { ref, onMounted, computed } from "vue";
import { useAdminDashboard } from '../../stores/adminDashboard';


const adminDashboard = useAdminDashboard()
const appointments = computed(() => adminDashboard.appointments)
const topPayingPatients = computed(() => adminDashboard.topPayingPatients)
const orders = computed(() => adminDashboard.orders)

onMounted(async () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();

    polarChartData.value = setPolarChartData();
    polarChartOptions.value = setPolarChartOptions();
    appointmentsCompareBetweenLastMonthAndCurrentMonth()

    barChartData.value = setBarChartData();
    barChartOptions.value = setBarChartOptions();

    doughnutChartData.value = setDoughnutChartData();
    doughnutChartOptions.value = setDoughnutChartOptions();
    ordersCompareBetweenLastMonthAndCurrentMonth()
});


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
const theme = computed(()=> localStorage.getItem('bgTheme'))
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
                    color: '#9b9b9b'
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



const polarChartData = ref();
const polarChartOptions = ref();

const setPolarChartData = () => {
    const months = Object.keys(appointments.value);
    const profit = months.map(month => appointments.value[month].totalProfit);
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        datasets: [
            {
                data: profit,
                backgroundColor: [
                    documentStyle.getPropertyValue('--p-pink-500'),
                    documentStyle.getPropertyValue('--p-gray-500'),
                    documentStyle.getPropertyValue('--p-orange-500'),
                    documentStyle.getPropertyValue('--p-purple-500'),
                    documentStyle.getPropertyValue('--p-cyan-500')
                ],
                label: profit.forEach(pro => {
                    pro
                })
            }
        ],
        labels: months
    };
};
const setPolarChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
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
            r: {
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
}

let appointmentGrowthPercent = 0;
const appointmentsCompareBetweenLastMonthAndCurrentMonth = () => {
    const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
    const previousMonthName = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'long' })
    const currentMonthProfit = appointments.value[currentMonthName]?.totalProfit || 0
    const previousMonthProfit = appointments.value[previousMonthName]?.totalProfit || 0
    if (previousMonthProfit > 0) {
        appointmentGrowthPercent = ((currentMonthProfit - previousMonthProfit) / previousMonthProfit) * 100
    } else if (currentMonthProfit > 0) {
        // If previous month's profit is 0 and current month's profit is greater than 0, it implies 100% growth.
        appointmentGrowthPercent = 100
    }
    return appointmentGrowthPercent
};






const barChartData = ref();
const barChartOptions = ref();

const setBarChartData = () => {
    const months = ref([])
    months.value = Object.keys(orders.value)
    const data = ref([])
    data.value = months.value.map(month => orders.value[month]['orders'])
    data.value.forEach(dat => {
        if (dat.id) {
            dat['length'] = 0
            dat['length']++
        }
    });

    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: months.value,
        datasets: [
            {
                label: 'Orders',
                backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
                borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
                data: data.value.map(object => {
                    if (object.length) {
                        return object.length;
                    }
                })
            },
            // {
            //     label: 'My Second dataset',
            //     backgroundColor: documentStyle.getPropertyValue('--p-gray-500'),
            //     borderColor: documentStyle.getPropertyValue('--p-gray-500'),
            //     data: [28, 48, 40, 19, 86, 27, 90]
            // }
        ]
    };
};
const setBarChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        indexAxis: 'y',
        maintainAspectRatio: false,
        aspectRatio: 0.8,
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
                    color: '#9b9b9b',
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: '#9b9b9b'
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };
}





const doughnutChartData = ref();
const doughnutChartOptions = ref(null);

const setDoughnutChartData = () => {
    const months = Object.keys(orders.value);
    const profit = months.map(month => orders.value[month].totalProfit);
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
                    documentStyle.getPropertyValue('--p-green-500'),
                    documentStyle.getPropertyValue('--p-blue-500'),
                    documentStyle.getPropertyValue('--p-purple-500'),
                    documentStyle.getPropertyValue('--p-red-500'),
                    documentStyle.getPropertyValue('--p-yellow-500'),
                    documentStyle.getPropertyValue('--p-pink-500'),
                    documentStyle.getPropertyValue('--p-teal-500'),
                    documentStyle.getPropertyValue('--p-indigo-500'),
                    documentStyle.getPropertyValue('--p-lime-500')
                ],
                hoverBackgroundColor: [
                    documentStyle.getPropertyValue('--p-cyan-400'),
                    documentStyle.getPropertyValue('--p-orange-400'),
                    documentStyle.getPropertyValue('--p-gray-400'),
                    documentStyle.getPropertyValue('--p-green-400'),
                    documentStyle.getPropertyValue('--p-blue-400'),
                    documentStyle.getPropertyValue('--p-purple-400'),
                    documentStyle.getPropertyValue('--p-red-400'),
                    documentStyle.getPropertyValue('--p-yellow-400'),
                    documentStyle.getPropertyValue('--p-pink-400'),
                    documentStyle.getPropertyValue('--p-teal-400'),
                    documentStyle.getPropertyValue('--p-indigo-400'),
                    documentStyle.getPropertyValue('--p-lime-400')
                ]
            }
        ]
    };

};

const setDoughnutChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');

    return {
        plugins: {
            legend: {
                labels: {
                    cutout: '60%',
                    color: '#9b9b9b'
                }
            }
        }
    };
};

let ordersGrowthPercent = 0
const ordersCompareBetweenLastMonthAndCurrentMonth = () => {
    const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
    const previousMonthName = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'long' })
    const currentMonthProfit = orders.value[currentMonthName]?.totalProfit || 0
    const previousMonthProfit = orders.value[previousMonthName]?.totalProfit || 0
    if (previousMonthProfit > 0) {
        ordersGrowthPercent = ((currentMonthProfit - previousMonthProfit) / previousMonthProfit) * 100
    } else if (currentMonthProfit > 0) {
        // If previous month's profit is 0 and current month's profit is greater than 0, it implies 100% growth.
        ordersGrowthPercent = 100
    }
    return ordersGrowthPercent
};
</script>


<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg h-fit flex w-full">
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
                    class="w-[60%] rounded-3xl bg-white dark:bg-gray-900 shadow-lg max-[1700px]:w-full flex h-fit p-5 items-center justify-center flex-col gap-5">
                    <h1 class="flex self-start font-jakarta font-semibold text-xl dark:text-gray-200">
                        Scheduled/Completed Appointments
                    </h1>
                    <div id="chart-container">
                        <Chart type="bar" id="chart" :data="chartData" :options="chartOptions" />
                    </div>

                </div>

                <!-- Per Month Profit Section -->
                <div class="w-[40%] gap-5 flex flex-col max-[1700px]:w-full">
                    <div class="flex max-[500px]:flex-col gap-5 bg-white dark:bg-gray-900 rounded-3xl shadow-lg h-fit">
                        <div class="w-[40%] p-8 flex flex-col gap-5 h-fit max-[500px]:w-full">
                            <h1 class="flex font-jakarta font-semibold text-xl dark:text-gray-200">
                                Appointments Per Month Profit
                            </h1>
                            <h1 class="flex font-jakarta font-semibold text-xl dark:text-gray-200">
                                General Profit:
                            </h1>
                            <p class="font-jakarta font-bold text-xl text-green-500 ">
                                ${{ Number(adminDashboard.generalProfit).toFixed(2) }}
                            </p>
                            <p class="font-jakarta font-semibold">
                                <span v-if="appointmentGrowthPercent > 0" class="flex gap-2 items-center dark:text-gray-200">
                                    <i class="fa-solid fa-arrow-trend-up" style="color: #25b408;"></i>
                                    +{{ appointmentGrowthPercent }}% <p class="text-sm dark:text-gray-200">last month</p>
                                </span>
                                <span v-else-if="appointmentGrowthPercent === 0" class="flex gap-2 items-center dark:text-gray-200">
                                    <i class="fa-solid fa-equals" style="color: #FFD43B;"></i>
                                    {{ appointmentGrowthPercent }}% <p class="text-sm dark:text-gray-200">last month</p>
                                </span>
                                <span v-else class="flex gap-2 items-center dark:text-gray-200">
                                    <i class="fa-solid fa-arrow-trend-down" style="color: #f50505;"></i>
                                    -{{ appointmentGrowthPercent }}% <p class="text-sm dark:text-gray-200">last month</p>
                                </span>
                            </p>
                        </div>
                        <div class="w-[60%] p-3 h-full flex items-center max-[500px]:w-full">
                            <Chart type="polarArea" :data="polarChartData" :options="polarChartOptions"
                                class="w-full md:w-[30rem]" />
                        </div>
                    </div>

                    <!-- Patients Registered By Month Chart -->
                    <div class="flex max-[500px]:flex-col gap-5 bg-white dark:bg-gray-900 rounded-3xl shadow-lg h-fit">
                        <div class="w-[40%] p-8 flex flex-col gap-5 h-fit max-[500px]:w-full">
                            <h1 class="flex font-jakarta font-semibold text-xl dark:text-gray-200">
                                Orders Per Month Profit
                            </h1>
                            <h1 class="flex font-jakarta font-semibold text-xl dark:text-gray-200">
                                General Profit:
                            </h1>
                            <p class="font-jakarta font-bold text-xl text-green-500">
                                ${{ Number(adminDashboard.ordersGeneralProfit).toFixed(2) }}
                            </p>
                            <p class="font-jakarta font-semibold">
                                <span v-if="ordersGrowthPercent > 0" class="flex gap-2 items-center dark:text-gray-200">
                                    <i class="fa-solid fa-arrow-trend-up" style="color: #25b408;"></i>
                                    +{{ ordersGrowthPercent }}% <p class="text-sm dark:text-gray-200">last month</p>
                                </span>
                                <span v-else-if="ordersGrowthPercent === 0" class="flex gap-2 items-center dark:text-gray-200">
                                    <i class="fa-solid fa-equals" style="color: #FFD43B;"></i>
                                    {{ ordersGrowthPercent }}% <p class="text-sm dark:text-gray-200">last month</p>
                                </span>
                                <span v-else class="flex gap-2 items-center dark:text-gray-200">
                                    <i class="fa-solid fa-arrow-trend-down" style="color: #f50505;"></i>
                                    -{{ ordersGrowthPercent }}% <p class="text-sm dark:text-gray-200">last month</p>
                                </span>
                            </p>
                        </div>
                        <div class="w-[60%] p-3 h-full flex items-center max-[500px]:w-full">
                            <Chart type="doughnut" :data="doughnutChartData" :options="doughnutChartOptions"
                                class="w-full md:w-[30rem]" />
                        </div>
                    </div>
                </div>
            </div>


            <!-- Upcoming Appointments and Top Paying Patients Section -->
            <div class="w-[90%] flex gap-5 max-[1700px]:flex-col">
                <div class="w-[65%] bg-white dark:bg-gray-900 p-5 shadow-lg rounded-3xl max-[1700px]:w-full">
                    <h1 class="flex self-start font-jakarta font-semibold text-xl dark:text-gray-200">
                        Orders Per Month
                    </h1>
                    <Chart type="bar" :data="barChartData" :options="barChartOptions" class="h-[30rem]" />

                </div>
                <div class="w-[35%] bg-white dark:bg-gray-900 shadow-lg rounded-3xl p-5 max-[1700px]:w-full">
                    <h1 class="flex self-start font-jakarta font-semibold text-xl dark:text-gray-200">
                        Top Appointments Paying Patients
                    </h1>
                    <div class="overflow-x-auto mt-3">
                        <table class="table">
                            <!-- head -->
                            <thead>
                                <tr v-if="topPayingPatients.length > 0">
                                    <th class="dark:text-gray-200">Name</th>
                                    <th class="dark:text-gray-200">Email</th>
                                    <th class="dark:text-gray-200">Total Patient Pay</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- row 1 -->
                                <tr v-if="topPayingPatients" v-for="patient in topPayingPatients">
                                    <td class="dark:text-gray-200">{{ patient.user.name }}</td>
                                    <td class="dark:text-gray-200">{{ patient.user.email }}</td>
                                    <td class="dark:text-gray-200">${{ patient.totalPaying }}</td>
                                </tr>
                                <tr v-else>
                                    <h1 class="font-jakarta text-xl font-semibold dark:text-gray-400">Nooo Available Data</h1>
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