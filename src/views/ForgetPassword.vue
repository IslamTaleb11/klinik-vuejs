<script setup>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { RouterLink } from 'vue-router'
import axios from 'axios'
import { Toaster, toast } from 'vue-sonner'
import { ref } from 'vue'

const email = ref('')

const forgetPassword = async () => {
    const resetPassSpan = document.getElementById('reset-pass-span');
    resetPassSpan.innerHTML = resetPassSpan.innerHTML.replace('Reset Password', "<span class='loading h-16 loading-dots loading-lg'></span>");
    const resetPassButton = document.getElementById('reset-pass-button');

    try {
        await axios.get('/sanctum/csrf-cookie');

        const response = await axios.post('/forgot-password', {
            email: email.value,
        });

        resetPassButton.classList.remove('bg-primarycolor');
        resetPassButton.classList.add('bg-green-600');
        resetPassButton.innerHTML = resetPassButton.innerHTML.replace('<span class="loading h-16 loading-dots loading-lg"></span>', '<span class="material-symbols-outlined">task_alt</span>');
        toast.success('Success', {
            description: response.data.status,
            duration: 5000,
        });

        await new Promise(resolve => setTimeout(resolve, 2000));
        resetPassButton.classList.remove('bg-green-600');
        resetPassButton.classList.add('bg-primarycolor');
        resetPassButton.innerHTML = resetPassButton.innerHTML.replace('<span class="material-symbols-outlined">task_alt</span>', 'Reset Password');
        email.value = ''
    } catch (error) {
        if (error.response) {
            toast.error(error.response.data.message);
            resetPassButton.classList.remove('bg-primarycolor')
            resetPassButton.classList.add('bg-red-600')
            resetPassSpan.innerHTML = resetPassSpan.innerHTML.replace('<span class="loading h-16 loading-dots loading-lg"></span>', '<span class="material-symbols-outlined">cancel</span>')
            await new Promise(resolve => setTimeout(resolve, 2000));
            resetPassSpan.innerHTML = resetPassSpan.innerHTML.replace('<span class="material-symbols-outlined">cancel</span>', 'Reset Password')
            resetPassButton.classList.remove('bg-red-600')
            resetPassButton.classList.add('bg-primarycolor')
        } else {
            toast.error('An error occurred.');
        }
    }
};


</script>


<template>

    <div class="dark:bg-darkmodebg">
        <Toaster richColors position="top-right" />
        <Header />

        <div class="flex justify-center">
            <div class="w-[60%] max-[1536px]:w-[90%] text-6xl flex h-fit max-[1280px]:justify-center mt-20">
                <div
                    class="w-[50%] max-[1280px]:w-[80%] max-[1536px]:w-[90%] max-[1280px]:p-3 dark:bg-darkmodebg bg-white shadow-lg p-20 flex flex-col items-center max-[1280px]:justify-center">
                    <!-- <h1 class="font-recursive font-bold text-4xl self-start text-[#333333] dark:text-white"><a
                        href="">Klinik</a>
                </h1> -->



                    <div class="my-12  text-center">
                        <div
                            class="dark:bg-transparent dark:text-gray-300 px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                            Fill up the form to reset the password
                        </div>
                    </div>

                    <div
                        class="flex flex-col min-[1536px]:w-[90%] max-[500px]:w-full max-[768px]:w-[70%] max-[1024px]:w-[60%] max-[1536px]:w-[70%] max-[1280px]:items-center max-[1280px]:justify-center">
                        <input v-model="email"
                            class="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            type="email" placeholder="Email" required />



                        <button @click="forgetPassword" id="reset-pass-button"
                            class="text-[18px] h-16 text-white flex justify-center items-center w-full transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline bg-primarycolor text-center p-4  mt-10 rounded-lg font-medium">
                            <div class="flex justify-center items-center gap-5">
                                <span id="reset-pass-span">Reset Password</span>
                            </div>
                        </button>

                        <p class="mt-6 text-xs text-gray-600 text-center">

                            <a href="#" class="border-b border-gray-500 border-dotted">
                                Terms of Service
                            </a>
                            and its
                            <a href="#" class="border-b border-gray-500 border-dotted">
                                Privacy Policy
                            </a>
                        </p>
                        <p class="mt-6 text-xs text-gray-600 text-center">
                            <RouterLink to="/signup" class="border-b border-gray-500 border-dotted">
                                Or Signup here
                            </RouterLink>
                        </p>
                    </div>

                </div>
                <div
                    class="w-[50%] dark:bg-darkmodebg bg-bgcolor shadow-lg max-[1024px]:hidden flex justify-center items-center">
                    <img src="/src/assets/images/Two factor authentication-bro.svg" alt="">
                </div>
            </div>
        </div>

        <div class="mt-52">
            <Footer />
        </div>
    </div>

</template>