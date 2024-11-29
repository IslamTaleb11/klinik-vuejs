<script setup>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import router from '../router' 

const goHome = () => {
    router.push('/')
}
</script>

<template>
    <div class="overflow-x-hidden bg-bgcolor dark:bg-darkmodebg">
        <div class="h-fit">
            <Header />
        </div>

        <!-- Main modal -->
        <div v-motion-slide-visible-top id="cancelModal" tabindex="-1" aria-hidden="false"
            class="flex justify-center items-center inset-0 z-50 w-full h-[700px]">
            <div class="relative p-4 w-full max-w-md">
                <!-- Modal content -->
                <div class="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                    <div
                        class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 p-2 flex items-center justify-center mx-auto mb-3.5">
                        <svg aria-hidden="true" class="w-8 h-8 text-red-500 dark:text-red-400" fill="currentColor"
                            viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12V8a1 1 0 01-2 0V6a1 1 0 012 0zm0 4v4a1 1 0 01-2 0v-4a1 1 0 012 0z"
                                clip-rule="evenodd"></path>
                        </svg>
                        <span class="sr-only">Cancel</span>
                    </div>
                    <p class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Appointment Reservasion Cancelled.</p>
                    <button @click="goHome" type="button"
                        class="py-2 mt px-3 text-sm font-medium text-center text-white rounded-lg bg-red-500 dark:bg-red-600 mt-5 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-900">
                        Go Home
                    </button>
                </div>
            </div>
        </div>

        <div>
            <Footer />
        </div>
    </div>
</template>
