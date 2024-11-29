<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { toast, Toaster } from 'vue-sonner'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import router from '../router'

const props = defineProps({
    sessionId: String,
    required: true,
});

const orderId = ref('')
onMounted(() => {
    try {
        axios.post('/appointment-success-payment', {
            sessionId: props.sessionId
        }).then((res) => {
            toast.success(res.data.message);
            orderId.value = res.data.appointment.order_id
        });
    } catch (error) {
        toast.error(error.response.data.message);
    }
});

const goHome = () => {
    router.push('/')
}
</script>

<template>
    <div class="overflow-x-hidden bg-bgcolor dark:bg-darkmodebg">
        <Toaster richColors position="top-right" />
        <div class="h-fit">
            <Header />
        </div>

        <!-- Main modal -->
        <div v-motion-slide-visible-top id="successModal" tabindex="-1" aria-hidden="false"
            class="flex justify-center items-center inset-0 z-50 w-full h-[700px]">
            <div class="relative p-4 w-full max-w-md">
                <!-- Modal content -->
                <div class="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                    <div
                        class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 p-2 flex items-center justify-center mx-auto mb-3.5">
                        <svg aria-hidden="true" class="w-8 h-8 text-green-500 dark:text-green-400" fill="currentColor"
                            viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clip-rule="evenodd"></path>
                        </svg>
                        <span class="sr-only">Success</span>
                    </div>
                    <p class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Successfull Payment.
                    </p>
                    <p class="dark:text-gray-400">Your Order ID: {{ orderId }}</p>
                    <button @click="goHome" type="button"
                        class="py-2 mt px-3 text-sm font-medium text-center text-white rounded-lg bg-primarycolor dark:bg-slate-500 mt-5 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-900">
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
