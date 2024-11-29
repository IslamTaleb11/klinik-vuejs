<script setup>
import { computed, onMounted, ref } from 'vue';
import Header from '../../../components/dashboard/Header.vue';
import SideBar from '../../../components/dashboard/SideBar.vue';
import axios from 'axios';
import { Toaster, toast } from 'vue-sonner';
import { useDoctorSchedules } from '../../../stores/doctorSchedules';

const doctorSchedules = useDoctorSchedules();
const startTime = computed(() => doctorSchedules.startTime);
const endTime = computed(() => doctorSchedules.endTime);

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timesArray = ref([]);
const availableTimes = computed(() => doctorSchedules.availableTimes);

async function times(startTime, endTime) {
    const convertToMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const startTimeMinutes = convertToMinutes(startTime);
    const endTimeMinutes = convertToMinutes(endTime);
    const step = 15;

    timesArray.value = [];
    for (let currentTime = startTimeMinutes; currentTime <= endTimeMinutes; currentTime += step) {
        const hours = Math.floor(currentTime / 60);
        const minutes = currentTime % 60;
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        timesArray.value.push(formattedTime);
    }

}

const showWarning = ref(false)
onMounted(async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (!startTime.value && !endTime.value) {
        await new Promise(resolve => setTimeout(resolve, 500));
        showWarning.value = true
    }
    await times(startTime.value, endTime.value);
    
});

const setTimes = async () => {
    const button = document.getElementById('btn');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        const res = await axios.post('/doctor-schedules-set-times', {
            startTime: startTime.value,
            endTime: endTime.value
        });
        toast.success(res.data.message);
        await times(startTime.value, endTime.value);
    } catch (err) {
        console.log(err.response?.data?.message || 'An error occurred');
        toast.error(err.response?.data?.message || 'An error occurred');
    }
    button.innerHTML = 'Set Times';
};


const toggleAvailability = async (selectedDay, selectedStartTime) => {
    try {
        await axios.post('/doctor-schedules-toggle-availability', {
            day: selectedDay,
            start_time: selectedStartTime,
        }).then(async (res) => {
            toast.success(res.data.message)
            const btnId = `btn-${selectedDay}-${selectedStartTime}`
            const btn = document.getElementById(btnId)

            if (btn) {

                if (btn.innerHTML == '<i class="fas fa-check text-white"></i>') {
                    btn.className = 'bg-red-600 w-5 rounded-lg'
                    btn.innerHTML = '<i class="fas fa-times text-white">'
                }
                else {
                    btn.className = 'bg-green-500 w-5 rounded-lg'
                    btn.innerHTML = '<i class="fas fa-check text-white"></i>'
                }
            }


        }).catch((err) => {
            toast.error(err.response ? err.response.data : err.message);
        })
    }
    catch (err) {
        console.error(err.response ? err.response.data : err.message);
        toast.error(err.response ? err.response.data : err.message);
    }
}
</script>

<template>
    <div class="bg-[#F0F5F9] min-h-screen dark:bg-darkmodebg flex">
        <Toaster richColors position="top-right" />
        <SideBar />

        <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
            <Header />

            <div class="flex justify-center w-[80%] max-[1025px]:w-[90%]">
                <div class="p-8 text-white w-full space-y-14">
                    <h2 class="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-300">Doctor Schedule</h2>

                    <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-xl ">
                        <label class="block text-sm font-medium text-gray-600 mb-2 dark:text-gray-300">
                            Start Time (Optional)
                        </label>
                        <input v-model="doctorSchedules.startTime" type="time"
                            class="mb-4 w-full p-2 bg-[#F0F5F9] text-black rounded-md dark:bg-slate-800 dark:text-gray-300" />

                        <label class="block text-sm font-medium text-gray-600 mb-2 dark:text-gray-300">
                            End Time
                        </label>
                        <input v-model="doctorSchedules.endTime" type="time"
                            class="mb-4 w-full p-2 bg-[#F0F5F9] text-black rounded-md dark:bg-slate-800 dark:text-gray-300" />

                        <button id="btn" @click="setTimes"
                            class="bg-primarycolor text-white px-4 py-2 rounded-md h-12 w-full">
                            Set Times
                        </button>
                    </div>

                    <div class="mt-8 overflow-auto">
                        <table class="min-w-full text-center text-white">
                            <thead>
                                <tr class="bg-white dark:bg-gray-900">
                                    <th class="p-2 text-black dark:text-gray-300">Time</th>
                                    <th class="p-2 text-black dark:text-gray-300">Sunday</th>
                                    <th class="p-2 text-black dark:text-gray-300">Monday</th>
                                    <th class="p-2 text-black dark:text-gray-300">Tuesday</th>
                                    <th class="p-2 text-black dark:text-gray-300">Wednesday</th>
                                    <th class="p-2 text-black dark:text-gray-300">Thursday</th>
                                    <th class="p-2 text-black dark:text-gray-300">Friday</th>
                                    <th class="p-2 text-black dark:text-gray-300">Saturday</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="!startTime && !endTime">
                                    <td v-if="!showWarning" class="animate-pulse w-full" colspan="8">
                                        <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
                                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                                    </td>
                                    <td v-if="showWarning" class="p-2 text-white bg-red-600 rounded font-semibold" colspan="8">You don't have permission to set the times,
                                        you first have to be registered in the doctors table!</td>
                                </tr>
                                <tr v-for="timeSlot in timesArray" :key="timeSlot" class="bg-white">
                                    <td class="p-2 text-black dark:bg-gray-900 dark:text-gray-300">{{ timeSlot }}</td>
                                    <td v-for="day in ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']"
                                        :key="day" class="text-black dark:bg-gray-900 dark:text-gray-300">
                                        <span
                                            v-if="availableTimes.some(available => available.start_time.slice(0, 5) === timeSlot && available.day === day)">
                                            <button @click="toggleAvailability(day, timeSlot)"
                                                class="bg-green-500 w-5 rounded-lg" :id="`btn-${day}-${timeSlot}`">
                                                <i class="fas fa-check text-white"></i>
                                            </button>
                                        </span>
                                        <span v-else>
                                            <button @click="toggleAvailability(day, timeSlot)"
                                                class="bg-red-600 w-5 rounded-lg" :id="`btn-${day}-${timeSlot}`">
                                                <i class="fas fa-times text-white"></i>
                                            </button>
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                    </div>

                </div>
            </div>

        </div>
    </div>
</template>

<style scoped></style>
