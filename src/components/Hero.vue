<script setup>

function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' }); // Smooth scrolling
    }
}
</script>

<template>
    <div class="flex justify-center">
        <div v-motion-slide-visible-top
            class="w-[60%] relative max-[1536px]:w-[90%] max-[1280px]:w-[80%] py-[200px] max-[1024px]:py-[100px] flex max-[1024px]:flex-col max-[1024px]:w-full ">
            <div class="w-[40%] max-[1024px]:w-full flex flex-col max-[1280px]:w-[60%]">
                <h3 class="font-recursive text-[#A1A7B0] tracking-widest max-[1024px]:text-center">Stay Well</h3>
                <h1
                    class="font-recursive dark:text-white font-bold text-7xl text-[#333333] mt-7 tracking-tight max-[1024px]:text-center max-[640px]:px-3 max-[768px]:text-3xl">
                    Empower Your Health</h1>
                <p
                    class="mt-10 dark:text-gray-400 max-[1024px]:mt-7 max-[640px]:px-4 font-recursive text-[#3333337f] w-[80%] tracking-wide max-[1024px]:text-center max-[1024px]:w-full max-[1024px]:px-20 max-[768px]:px-12">
                    Discover a revolutionary approach to healthcare that prioritizes your well-being and transforms your
                    health journey. </p>
                <button @click="scrollToSection('bookNow-section')"
                    class="bg-primarycolor hover:brightness-90 w-36 py-3 rounded mt-8 max-[1024px]:self-center"><span
                        class="font-semibold text-white font-recursive">Book Now</span></button>
            </div>
            <div 
                class="w-[60%] max-[1024px]:w-full max-[1024px]:mt-9 max-[640px]:px-5 max-[768px]:px-10 flex justify-center">
                <img src="/src/assets/images/hero-image.svg" alt="">
            </div>
            
            <!-- <div id="bookNow-section"
                class="bg-white dark:bg-slate-800 shadow-lg absolute bottom-0 transform translate-y-[75%] h-auto md:h-52 rounded-lg p-6 md:p-10 w-full flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
                <div class="w-full md:w-1/3 flex flex-col items-center">
                    <h1 class="font-recursive text-2xl font-bold dark:text-gray-300">Select Department</h1>
                    <select @change="fetchDoctors" v-model="departmentId"
                        class="select select-bordered w-full max-w-xs mt-3 dark:bg-slate-700 dark:text-gray-300">
                        <option value="" disabled selected>Select Department</option>
                        <option v-for="department in departments" :key="department.id" :value="department.id">
                            {{ department.name }}</option>
                    </select>
                </div>
                <div class="w-full md:w-1/3 flex flex-col items-center">
                    <h1 class="font-recursive text-2xl font-bold dark:text-gray-300">Choose Doctor</h1>
                    <select v-model="doctorId"
                        class="select select-bordered w-full max-w-xs mt-3 dark:bg-slate-700 dark:text-gray-300">
                        <option disabled selected>Select a doctor</option>
                        <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">{{ doctor.name }} - ${{
                            doctor.appointment_price }}</option>
                    </select>
                </div>
                <div class="w-full md:w-1/3 flex flex-col md:flex-row items-center">
                    <div class="flex flex-col items-center md:items-start">
                        <h1 class="font-recursive text-2xl font-bold dark:text-gray-300">Select Date</h1>
                        <DatePicker v-model="date" :pt="{
                            day: {
                                class: 'bg-primarycolor'
                            },
                        }" class="mt-3" inputClass="dark:bg-slate-700 dark:border-none rounded-xl"
                            inputStyle="border-color:#cacbd1;" />


                    </div>
                    <button @click="searchAvailability" type="submit"
                        class="p-2.5 h-fit flex-row ms-2 border-none text-sm font-medium text-white bg-primarycolor rounded-lg border focus:ring-4 focus:outline-none focus:ring-blue-300 mt-3 md:mt-11">
                        <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                        <span class="sr-only">Search</span>
                    </button>
                </div>
            </div> -->
        </div>

        <!-- <dialog v-if="showLoadingModal" id="loading-modal" class="modal modal-middle text-primarycolor">
            <div class="modal-box bg-white rounded-lg shadow-lg p-6 flex justify-center" id="child">
            </div>
        </dialog>

        <dialog v-if="showTimesModal" id="times-modal" class="modal modal-middle">
            <div class="modal-box bg-white rounded-lg shadow-lg p-6">
                <h3 v-if="availableTimes" class="text-xl font-semibold text-gray-800 mb-4">Available Times</h3>
                <h3 v-else class="text-xl font-semibold text-gray-800 mb-4">No Available times for this day right now!
                </h3>

                <div class="grid grid-cols-2 gap-4">
                    <div v-if="availableTimes" v-for="time in availableTimes" :key="time.id"
                        class="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                        <span class="text-gray-700">{{ `${time.start_time} - ${dateToShowInModal} (${time.day})`
                            }}</span>
                        <button
                            @click="reserveAppointment(time.start_time, dateToShowInModal, time.doctor_id, time.day)"
                            class="bg-primarycolor hover:bg-blue-500 text-white py-1 px-3 rounded-lg transition duration-200">
                            Reserve
                        </button>
                    </div>

                </div>
                <div class="flex justify-end px-10">
                    <form method="dialog" class=" w-10">
                        <button @click="closeModal" class="btn">close</button>
                    </form>
                </div>

            </div>
        </dialog> -->

    </div>
</template>
<style scoped>
.custom-datepicker .p-datepicker input {
    color: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
}
</style>