<script setup>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import DatePicker from 'primevue/datepicker';
import { ref } from 'vue';
const date = ref();

</script>


<template>
    <Header />
    <div class="flex justify-center dark:bg-darkmodebg">
        <div class="w-[60%] flex justify-center ">
            <div class="w-screen">
                <div
                    class="relative mx-auto mt-20 mb-20 w-full overflow-hidden rounded-t-xl bg-primarycolor py-32 text-center shadow-xl shadow-gray-300">
                    <h1 class="mt-2 px-8 text-3xl font-bold text-white md:text-5xl">Book an appointment</h1>
                    <p class="mt-6 text-lg text-white">Get an appointment with our experienced doctors</p>
                    <img class="absolute top-0 left-0 -z-10 h-full w-full object-cover"
                        src="/src/assets/images/hospital-inside.jpg" alt="" />
                </div>

                <div class="mx-auto grid max-w-screen-lg px-6 pb-20">
                    <div class="">
                        <p class="font-recursive text-xl font-bold text-blue-900">Select a Category</p>
                        <select class="select select-bordered w-full max-w-xs mt-5">
                            <option disabled selected>Select Category here</option>
                            <option>Han Solo</option>
                            <option>Greedo</option>
                        </select>
                    </div>

                    <div class="mt-10">
                        <p class="font-recursive text-xl font-bold text-blue-900">Select a Doctor</p>
                        <select class="select select-bordered w-full max-w-xs mt-5">
                            <option disabled selected>Select Doctor here</option>
                            <option>Han Solo</option>
                            <option>Greedo</option>
                        </select>
                    </div>

                    <div class="">
                        <p class="mt-8 font-recursive text-xl font-bold text-blue-900">Select a date</p>
                        <DatePicker v-model="date" />
                    </div>

                    <div class="">
                        <p class="mt-8 font-serif text-xl font-bold text-blue-900">Select a time</p>
                        <div class="mt-4 grid grid-cols-4 gap-2 lg:max-w-xl">
                            <button
                                class="rounded-lg bg-primarycolor px-4 py-2 font-medium text-emerald-900 active:scale-95">12:00</button>
                            <button
                                class="rounded-lg bg-primarycolor px-4 py-2 font-medium text-emerald-900 active:scale-95">14:00</button>
                            <button
                                class="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white active:scale-95">09:00</button>
                            <button
                                class="rounded-lg bg-emerald-100 px-4 py-2 font-medium text-emerald-900 active:scale-95">12:00</button>
                            <button
                                class="rounded-lg bg-emerald-100 px-4 py-2 font-medium text-emerald-900 active:scale-95">15:00</button>
                            <button
                                class="rounded-lg bg-emerald-100 px-4 py-2 font-medium text-emerald-900 active:scale-95">12:00</button>
                            <button
                                class="rounded-lg bg-emerald-100 px-4 py-2 font-medium text-emerald-900 active:scale-95">14:00</button>
                            <button
                                class="rounded-lg bg-emerald-100 px-4 py-2 font-medium text-emerald-900 active:scale-95">12:00</button>
                        </div>
                    </div>

                    <button
                        class="mt-8 w-56 rounded-full border-8 border-emerald-500 bg-emerald-600 px-10 py-4 text-lg font-bold text-white transition hover:translate-y-1">Book
                        Now</button>
                </div>
            </div>

        </div>
    </div>
    <Footer />
</template>