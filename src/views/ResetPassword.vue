<script setup>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { RouterLink } from 'vue-router'
import axios from 'axios'
import { Toaster, toast } from 'vue-sonner'
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'

const pass = ref('')
const passwordConfirmation = ref('')
const router = useRouter()
const route = useRoute()

const resetPassword = async () => {
    const resetPassSpan = document.getElementById('reset-pass-span');
    resetPassSpan.innerHTML = resetPassSpan.innerHTML.replace('Reset Password', "<span class='loading h-16 loading-dots loading-lg'></span>");
    const resetPassButton = document.getElementById('reset-pass-button');

    try {
        await axios.get('/sanctum/csrf-cookie');

        const response = await axios.post('/reset-password', {
            password: pass.value,
            password_confirmation: passwordConfirmation.value,
            token: route.params.token,
            email: route.query.email
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
        router.push('/login')
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
            console.error('Error:', error);
            toast.error('An error occurred.');
        }
    }
};

const numbersToCheck = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const lowercaseToCheck = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
    'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
];
const uppercaseToCheck = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];
const specialCharactersToCheck = [
    '!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/',
    ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~'
];

let itContainsNumber = ref(false)
let itContainsLowerCase = ref(false)
let itContainsUpperCase = ref(false)
let itContainsSpecialChar = ref(false)
let itContains8Letters = ref(false)

const checkPasswordStrenght = () => {

    const passToLetters = pass.value.split('')

    if (pass.value.length == 0) {
        itContainsNumber.value = false
        itContainsLowerCase.value = false
        itContainsUpperCase.value = false
        itContainsSpecialChar.value = false
        itContains8Letters.value = false
    }

    if (pass.value.length >= 1) {
        const passStrenghtContainer = document.getElementById('pass-strenght')
        passStrenghtContainer.classList.remove('hidden')

        numbersToCheck.forEach((number) => {
            for (let i = 0; i < passToLetters.length; i++) {
                const letter = passToLetters[i];
                if (letter != number) {
                    itContainsNumber.value = false
                    break
                }


            }

        })
        lowercaseToCheck.forEach((lowerCaseLetter) => {
            for (let i = 0; i < passToLetters.length; i++) {
                const letter = passToLetters[i];
                if (letter != lowerCaseLetter) {
                    itContainsLowerCase.value = false
                    break
                }
            }
        })

        uppercaseToCheck.forEach((upperCaseLetter) => {
            for (let i = 0; i < passToLetters.length; i++) {
                const letter = passToLetters[i];
                if (letter != upperCaseLetter) {
                    itContainsUpperCase.value = false
                    break
                }
            }
        })

        specialCharactersToCheck.forEach((specialChar) => {
            for (let i = 0; i < passToLetters.length; i++) {
                const letter = passToLetters[i];
                if (letter != specialChar) {
                    itContainsSpecialChar.value = false
                    break
                }
            }
        })

    }
    else {
        const passStrenghtContainer = document.getElementById('pass-strenght')
        passStrenghtContainer.classList.add('hidden')

    }


    if (pass.value.length >= 8) {
        itContains8Letters.value = true
    }
    else {
        itContains8Letters.value = false
    }

    numbersToCheck.forEach((number) => {
        for (let i = 0; i < passToLetters.length; i++) {
            const letter = passToLetters[i];
            if (letter == number) {
                itContainsNumber.value = true
                break
            }


        }

    })
    lowercaseToCheck.forEach((lowerCaseLetter) => {
        for (let i = 0; i < passToLetters.length; i++) {
            const letter = passToLetters[i];
            if (letter == lowerCaseLetter) {
                itContainsLowerCase.value = true
                break
            }
        }
    })

    uppercaseToCheck.forEach((upperCaseLetter) => {
        for (let i = 0; i < passToLetters.length; i++) {
            const letter = passToLetters[i];
            if (letter == upperCaseLetter) {
                itContainsUpperCase.value = true
                break
            }
        }
    })

    specialCharactersToCheck.forEach((specialChar) => {
        for (let i = 0; i < passToLetters.length; i++) {
            const letter = passToLetters[i];
            if (letter == specialChar) {
                itContainsSpecialChar.value = true
                break
            }
        }
    })

}

const showPassContainer = ref(false)

const handleShowPassContainer = () => {
    showPassContainer.value = true
}

const removeShowPassContainer = () => {
    showPassContainer.value = false
}

const showPass = ref(false)
const showConfirmPass = ref(false)

const togglePass = () => {
    showPass.value = !showPass.value
}

const toggleConfPass = () => {
    showConfirmPass.value = !showConfirmPass.value
}

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
                        class="flex relative flex-col min-[1536px]:w-[90%] max-[500px]:w-full max-[768px]:w-[70%] max-[1024px]:w-[60%] max-[1536px]:w-[70%] max-[1280px]:items-center max-[1280px]:justify-center">
                        <input v-if="!showPass" v-model="pass" @input="checkPasswordStrenght"
                            @focus="handleShowPassContainer" @blur="removeShowPassContainer"
                            class="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            type="password" placeholder="Password" />
                        <input v-else v-model="pass" @input="checkPasswordStrenght" @focus="handleShowPassContainer"
                            @blur="removeShowPassContainer"
                            class="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            type="text" placeholder="Password" />
                        <input v-if="!showConfirmPass" v-model="passwordConfirmation"
                            class="w-full mt-5 px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            type="password" placeholder="Password Confirmation" required />
                        <input v-else v-model="passwordConfirmation"
                            class="w-full mt-5 px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            type="text" placeholder="Password Confirmation" required />

                        <div class="absolute -top-4 right-5 cursor-pointer" @click="togglePass">
                            <span v-if="showPass" class="material-symbols-outlined">
                                visibility
                            </span>
                            <span v-else class="material-symbols-outlined">
                                visibility_off
                            </span>
                        </div>

                        <div class="absolute top-14 right-5 cursor-pointer" @click="toggleConfPass">
                            <span v-if="showConfirmPass" class="material-symbols-outlined">
                                visibility
                            </span>
                            <span v-else class="material-symbols-outlined">
                                visibility_off
                            </span>
                        </div>

                        <div id="pass-strenght" v-if="showPassContainer"
                            class="bg-white  w-full h-fit text-base p-2 absolute z-10 top-[50px]">
                            <h3 class="mt-2">Password Should Be</h3>
                            <div class="flex gap-2 mt-3">
                                <span v-if="itContains8Letters" class="material-symbols-outlined text-green-600">
                                    task_alt
                                </span>
                                <span v-else class="material-symbols-outlined text-red-600">
                                    close
                                </span>
                                <span class="font-recursive">At least 8 characted long</span>
                            </div>
                            <div class="flex gap-2">
                                <span v-if="itContainsNumber" class="material-symbols-outlined text-green-600">
                                    task_alt
                                </span>
                                <span v-else class="material-symbols-outlined text-red-600">
                                    close
                                </span>

                                <span class="font-recursive">At least 1 number</span>
                            </div>
                            <div class="flex gap-2">
                                <span v-if="itContainsLowerCase" class="material-symbols-outlined text-green-600">
                                    task_alt
                                </span>
                                <span v-else class="material-symbols-outlined text-red-600">
                                    close
                                </span>
                                <span class="font-recursive">At least 1 lowercase letter</span>
                            </div>
                            <div class="flex gap-2">
                                <span v-if="itContainsUpperCase" class="material-symbols-outlined text-green-600">
                                    task_alt
                                </span>
                                <span v-else class="material-symbols-outlined text-red-600">
                                    close
                                </span>
                                <span class="font-recursive">At least 1 uppercase letter</span>
                            </div>
                            <div class="flex gap-2">
                                <span v-if="itContainsSpecialChar" class="material-symbols-outlined text-green-600">
                                    task_alt
                                </span>
                                <span v-else class="material-symbols-outlined text-red-600">
                                    close
                                </span>
                                <span class="font-recursive">At least 1 special character</span>
                            </div>
                        </div>

                        <button @click="resetPassword" id="reset-pass-button"
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