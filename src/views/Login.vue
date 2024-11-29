<script setup>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { RouterLink } from 'vue-router';
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { Toaster, toast } from 'vue-sonner';
import { useRouter } from 'vue-router';


const email = ref('')
const password = ref('')
const router = useRouter();

const login = async () => {

    const signinSpan = document.getElementById('signin-span')
    signinSpan.innerHTML = signinSpan.innerHTML.replace('Sign In', "<span class='loading h-16 loading-dots loading-lg'></span>");
    const signinButton = document.getElementById('signin-button')

    try {
        axios.get('/sanctum/csrf-cookie', {
            withCredentials: true,
        }).then(response => {
            axios.post('/login', {
                email: email.value,
                password: password.value,
            })
                .then(async (response) => {
                    localStorage.setItem('token', response.data.token);
                    localStorage.getItem('isUserAuth');
                    localStorage.setItem('isUserAuth', true);
                    toast.success('Success', {
                        description: response.data.status,
                        duration: 5000,
                    });
                    signinButton.classList.remove('bg-primarycolor')
                    signinButton.classList.add('bg-green-600')
                    signinButton.innerHTML = signinSpan.innerHTML.replace('<span class="loading h-16 loading-dots loading-lg"></span>', '<span class="material-symbols-outlined">task_alt</span>')
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    router.push('/')
                })
                .catch(async (err) => {
                    toast.error(err.response.data.message);
                    signinButton.classList.remove('bg-primarycolor')
                    signinButton.classList.add('bg-red-600')
                    signinSpan.innerHTML = signinSpan.innerHTML.replace('<span class="loading h-16 loading-dots loading-lg"></span>', '<span class="material-symbols-outlined">cancel</span>')
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    signinSpan.innerHTML = signinSpan.innerHTML.replace('<span class="material-symbols-outlined">cancel</span>', 'Sign In')
                    signinButton.classList.remove('bg-red-600')
                    signinButton.classList.add('bg-primarycolor')
                });
        });
    } catch(error) {
        console.log(error)
    }
}
    

</script>


<template>

    <div class="dark:bg-darkmodebg">
        <Toaster richColors position="top-right" />
        <Header />
<!-- Credentials Section -->
<div class="mt-10 mx-auto w-[60%] max-[1536px]:w-[90%] dark:bg-darkmodebg bg-white shadow-lg p-8 rounded-lg">
            <h2 class="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-5 text-center">Demo Account Credentials
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded shadow">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Admin</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Email: admin@gmail.com</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Password: islamislam</p>
                </div>
                <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded shadow">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Doctor</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Email: doctor@gmail.com</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Password: islamislam</p>
                </div>
                <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded shadow">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Nurse</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Email: nurse@gmail.com</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Password: islamislam</p>
                </div>
                <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded shadow">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Pharmacist</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Email: pharmacist@gmail.com</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Password: islamislam</p>
                </div>
                <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded shadow">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Patient</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Email: patient@gmail.com</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Password: islamislam</p>
                </div>
            </div>
        </div>
        <div class="flex justify-center">
            <div class="w-[60%] max-[1536px]:w-[90%] text-6xl flex h-fit max-[1280px]:justify-center mt-20">
                <div
                    class="w-[50%] max-[1280px]:w-[80%] max-[1536px]:w-[90%] max-[1280px]:p-3 dark:bg-darkmodebg bg-white shadow-lg p-20 flex flex-col items-center max-[1280px]:justify-center">
                    <!-- <h1 class="font-recursive font-bold text-4xl self-start text-[#333333] dark:text-white"><a
                        href="">Klinik</a>
                </h1> -->

                    <!-- <button
                        class="text-[18px] min-[1536px]:w-[90%] max-[500px]:w-full max-[768px]:w-[70%] max-[1024px]:w-[60%] max-[1536px]:w-[70%] text-white transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline bg-primarycolor text-center p-4 mt-10 rounded-lg font-medium font-semibold">
                        <div class="flex max-[350px]:flex-col justify-center items-center gap-5">
                            <div class="w-10 h-10 rounded-full bg-white flex justify-center items-center">
                                <img src="/src/assets/images/facebook.png" class="h-9 w-9" alt="">
                            </div>

                            <span class="max-[350px]:-order-1" @click="loginWithFacebook">Sign In with Facebook</span>
                        </div>
                    </button> -->

                    <div class="my-12  text-center">
                        <div
                            class="dark:bg-transparent dark:text-gray-300 px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                            Sign In with your Klinik E-mail
                        </div>
                    </div>

                    <div
                        class="flex flex-col min-[1536px]:w-[90%] max-[500px]:w-full max-[768px]:w-[70%] max-[1024px]:w-[60%] max-[1536px]:w-[70%] max-[1280px]:items-center max-[1280px]:justify-center">
                        <input v-model="email" 
                            class="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            type="email" placeholder="Email" />
                        <input v-model="password" 
                            class="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                            type="password" placeholder="Password" />


                        <button @click="login" id="signin-button"
                            class="text-[18px] h-16 text-white flex justify-center items-center w-full transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline bg-primarycolor text-center p-4  mt-10 rounded-lg font-medium">
                            <div class="flex justify-center items-center gap-5">
                                <span id="signin-span">Sign In</span>
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
                        <p class="mt-6 text-xs text-gray-600 text-center">
                            <RouterLink to="/forgot-password" class="border-b border-gray-500 border-dotted">
                                Forget Password?
                            </RouterLink>
                        </p>
                    </div>

                </div>
                <div
                    class="w-[50%] dark:bg-darkmodebg bg-bgcolor shadow-lg max-[1024px]:hidden flex justify-center items-center">
                    <img src="/src/assets/images/Hospital building-bro.svg" alt="">
                </div>
            </div>
        </div>

        <div class="mt-52">
            <Footer />
        </div>
    </div>


</template>