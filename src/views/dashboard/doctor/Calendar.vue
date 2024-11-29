<script setup>
import SideBar from '../../../components/dashboard/SideBar.vue';
import Header from '../../../components/dashboard/Header.vue';
import Breadcrumb from '../../../components/dashboard/Breadcrumb.vue';
import { computed, onMounted, ref, watch } from 'vue';
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';
import { useCalendarEvents } from '../../../stores/CalendarEvents';

// Use Pinia store
const calendarEvents = useCalendarEvents();
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}
const startTime = computed(() => timeToMinutes(calendarEvents.startTime))
const endTime = computed(() => timeToMinutes(calendarEvents.endTime))

// Initialize refs for events and renderEvents
const events = ref([]); // This will hold the raw events from the store
const renderEvents = ref([]); // This will hold the transformed events for the calendar

// Fetch events from the store and assign to events ref on component mount
onMounted(async () => {
    // Fetch or update events from the store
    // Assuming calendarEvents has a method or property to get events
    events.value = calendarEvents.events; // Adjust based on actual store method/property
});

// Watch for changes in events and transform them
watch(
    () => events.value,
    (eventsToMap) => {
        // Transform the API response into calendar events format
        renderEvents.value = eventsToMap.map(event => ({
            start: `${event.date} ${event.start}`, // Combine date and start time
            end: `${event.date} ${event.end}`,     // Combine date and end time
            title: `Appointment`, // Adjust title as needed
            class: 'time',

        }));
    },
    { immediate: true } // Ensure it runs immediately on setup
);


const today = new Date();
const formattedToday = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
// Initialize selected date to today
const selectedDate = ref(formattedToday);


</script>

<template>
    <div class="bg-gray-100 dark:bg-darkmodebg flex  min-h-screen">
        <SideBar />
        <div class="flex items-center flex-col w-full min-[1025px]:w-[75%] p-8">
            <Header />

            <Breadcrumb first="Dashboard" second="Calendar" firstIcon='<i class="fa-solid fa-gauge"></i>'
                secondIcon='<i class="fa-solid fa-calendar-check"></i>' link="/dashboard" />

            <div
                class="mx-auto lg:w-3/4 xl:w-2/3 bg-white dark:bg-darkmodebg shadow-lg h-full w-full p-4 mt-10 rounded-3xl flex-wrap">
                <h2 class="text-2xl font-semibold text-gray-700 mb-4 dark:text-gray-300">Appointments Schedule</h2>

                <vue-cal :selected-date="selectedDate" :time="true" small :time-from="startTime" :time-to="endTime"
                    :time-step="5" :events="renderEvents"  :disable-views="['years', 'year']"
                    :min-cell-width="110"
                    class="bg-white dark:text-gray-300 font-semibold rounded-lg shadow border font-jakarta vuecal__menu">
                </vue-cal>
            </div>
        </div>
    </div>
</template>
<style scoped>
.vuecal__menu, .vuecal__cell-events-count {background-color: #F0F5F9;}
.dark .vuecal__menu, .dark .vuecal__cell-events-count {
    background-color: #070F2B; /* Custom dark mode background */
}
</style>