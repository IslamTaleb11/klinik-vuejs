<script setup>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { ref } from 'vue';
import axios from 'axios';
import { Toaster, toast } from 'vue-sonner';
import { useRouter } from 'vue-router';


let pass = ref('')
let passConfirmation = ref('')
const name = ref('')
const email = ref('')

const showPass = ref(false)
const showConfirmPass = ref(false)
const showPassContainer = ref(false)


const togglePass = () => {
    showPass.value = !showPass.value
}

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

const toggleConfPass = () => {
    showConfirmPass.value = !showConfirmPass.value
}


/* Note from the developer: Your can avoid repitation in this function if you wanna write less code, 
I can do it in the short way, but I have choose this way to practise logic and burn my brain :D
*/
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


const router = useRouter()
const signUp = async () => {
    const signupSpan = document.getElementById('signup-span')
    signupSpan.innerHTML = signupSpan.innerHTML.replace('Sign Up', "<span class='loading h-16 loading-dots loading-lg'></span>");
    const signupButton = document.getElementById('signup-button')

    try {
        axios.get('/sanctum/csrf-cookie').then(response => {
            axios.post('/register', {
                name: name.value,
                email: email.value,
                password: pass.value,
                password_confirmation: passConfirmation.value
            })
                .then(async (response) => {
                    toast.success('Success', {
                        description: response.data.status,
                        duration: 5000,
                    });
                    localStorage.setItem('token', response.data.token);
                    localStorage.removeItem('isUserAuth')
                    
                    signupButton.classList.remove('bg-primarycolor')
                    signupButton.classList.add('bg-green-600')
                    signupSpan.innerHTML = signupSpan.innerHTML.replace('<span class="loading h-16 loading-dots loading-lg"></span>', '<span class="material-symbols-outlined">task_alt</span>')
                    await new Promise(resolve => setTimeout(resolve, 2000))
                    router.push('/')
                })
                .catch(async (err) => {
                    toast.error(err.response.data.message);
                    signupButton.classList.remove('bg-primarycolor')
                    signupButton.classList.add('bg-red-600')
                    signupSpan.innerHTML = signupSpan.innerHTML.replace('<span class="loading h-16 loading-dots loading-lg"></span>', '<span class="material-symbols-outlined">cancel</span>')
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    signupSpan.innerHTML = signupSpan.innerHTML.replace('<span class="material-symbols-outlined">cancel</span>', 'Sign Up')
                    signupButton.classList.remove('bg-red-600')
                    signupButton.classList.add('bg-primarycolor')
                });
        });
    } catch {
        console.log('error api call')
    }


}

const handleShowPassContainer = () => {
    showPassContainer.value = true
}

const removeShowPassContainer = () => {
    showPassContainer.value = false
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
                    <!-- <button
                        class="text-[18px] min-[1536px]:w-[90%] max-[500px]:w-full max-[768px]:w-[70%] max-[1024px]:w-[60%] max-[1536px]:w-[70%] text-white transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline bg-primarycolor text-center p-4 mt-10 rounded-lg font-medium font-semibold">
                        <div class="flex max-[350px]:flex-col justify-center items-center gap-5">
                            <div class="w-10 h-10 rounded-full bg-white flex justify-center items-center">
                                <img src="/src/assets/images/facebook.png" class="h-9 w-9" alt="">
                            </div>

                            <span class="max-[350px]:-order-1">Sign Up with Facebook</span>
                        </div>
                    </button> -->

                    <div class="my-12  text-center">
                        <div
                            class="dark:bg-transparent dark:text-gray-300 px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                            Sign Up with your E-mail
                        </div>
                    </div>

                    <div
                        class="flex flex-col min-[1536px]:w-[90%] max-[500px]:w-full max-[768px]:w-[70%] max-[1024px]:w-[60%] max-[1536px]:w-[70%]  ">
                        <input v-model="name"
                            class="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            type="text" placeholder="Name" />
                        <input v-model="email"
                            class="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                            type="email" placeholder="Email" />

                        <div class="flex items-center relative flex-col">
                            <input v-if="!showPass" v-model="pass" @input="checkPasswordStrenght"
                                @focus="handleShowPassContainer" @blur="removeShowPassContainer"
                                class="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                                type="password" placeholder="Password" />
                            <input v-else v-model="pass" @input="checkPasswordStrenght" @focus="handleShowPassContainer"
                                @blur="removeShowPassContainer"
                                class="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                                type="text" placeholder="Password" />
                            <div class="absolute right-5 cursor-pointer" @click="togglePass">
                                <span v-if="showPass" class="material-symbols-outlined">
                                    visibility
                                </span>
                                <span v-else class="material-symbols-outlined">
                                    visibility_off
                                </span>
                            </div>
                            <div id="pass-strenght" v-if="showPassContainer"
                                class="bg-white  w-full h-fit rounded text-base p-2 absolute z-10 top-[70px]">
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
                        </div>

                        <div class="flex items-center relative">
                            <input v-if="!showConfirmPass" v-model="passConfirmation"
                                class="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                                type="password" placeholder="Password Confirmation" />
                            <input v-else v-model="passConfirmation"
                                class="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                                type="text" placeholder="Password Confirmation" />
                            <div class="absolute right-5 cursor-pointer" @click="toggleConfPass">
                                <span v-if="showConfirmPass" class="material-symbols-outlined">
                                    visibility
                                </span>
                                <span v-else class="material-symbols-outlined">
                                    visibility_off
                                </span>
                            </div>
                        </div>

                        <button @click="signUp" id="signup-button"
                            class="text-[18px] h-16 text-white flex justify-center items-center w-full transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline bg-primarycolor text-center p-4  mt-10 rounded-lg font-medium">
                            <div class="flex justify-center items-center gap-5">
                                <span id="signup-span">Sign Up</span>
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
                            <RouterLink to="/login" class="border-b border-gray-500 border-dotted">
                                Or Login here
                            </RouterLink>
                        </p>
                    </div>

                </div>
                <div
                    class="w-[50%] dark:bg-darkmodebg bg-bgcolor shadow-lg max-[1024px]:hidden flex justify-center items-center">
                    <img src="/src/assets/images/Emails-amico.svg">
                </div>
            </div>
        </div>

        <div class="mt-52">
            <Footer />
        </div>
    </div>


</template>