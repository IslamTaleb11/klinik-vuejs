<script setup>
import OrdersNotifications from './OrdersNotifications.vue';
import { useSideBar } from '../../stores/sideBar.js';
import { useFetchUserRole } from '../../stores/fetchUserRole';
import AppointmentsNotifications from './AppointmentsNotifications.vue';
import { useGetUserData } from '../../stores/getUserData.js';
import { computed } from 'vue';
import { useBackendUrl } from '../../stores/backendUrl.js';
import { RouterLink } from 'vue-router';
import { useLogout } from '../../stores/logout.js';
import { toast, Toaster } from 'vue-sonner';
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';


const router = useRouter()
const backendUrl = useBackendUrl()
const sideBar = useSideBar()
const userRole = useFetchUserRole()
const userData = useGetUserData()
const photo = computed(() => userData.photo)


const logoutState = useLogout()
const logout = () => {
    logoutState.logout()
    localStorage.removeItem('isUserAuth');
    localStorage.removeItem('token');
    toast.success('You have logged out successfully')
    router.push('/')
    localStorage.removeItem('userProfile')
    localStorage.removeItem('photo')
}

const isDark = ref(false);
const bgThemeKey = 'bgTheme';

const toggle = () => {
    isDark.value = !isDark.value;

    const element = document.querySelector('html');
    element.classList.toggle('dark');

    if (localStorage.getItem(bgThemeKey)) {
        if (localStorage.getItem(bgThemeKey) === 'dark') {
            localStorage.setItem(bgThemeKey, 'light');
        } else {
            localStorage.setItem(bgThemeKey, 'dark');
        }
    } else {
        localStorage.setItem(bgThemeKey, 'dark');
    }
};

onMounted(() => {
    const savedTheme = localStorage.getItem(bgThemeKey);

    if (savedTheme === 'dark') {
        isDark.value = true;
        document.querySelector('html').classList.add('dark');
    } else {
        isDark.value = false;
        document.querySelector('html').classList.remove('dark');
    }
});
</script>



<template>
    <Toaster richColors position="top-right" />

    <div class="py-7 w-[90%] flex justify-center">
        <div class="navbar bg-base-100 h-fit rounded-2xl w-full dark:bg-darkmodebg">
            <div class="flex-1">
                <RouterLink to="/" class="btn btn-ghost text-xl max-[1024px]:hidden dark:text-white">Klinik</RouterLink>
                <div v-if="!sideBar.showSideBar" class="px-5 py-7 absolute flex items-center">
                    <svg @click="sideBar.toggleSideBar" xmlns="http://www.w3.org/2000/svg"
                        class="w-7 h-7 cursor-pointer min-[1025px]:hidden absolute"
                        :class="{ 'dark:fill-gray-200': true }" viewBox="0 0 448 512">
                        <path
                            d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z" />
                    </svg>

                </div>
            </div>
            <div class="flex-none">
                <label class="swap swap-rotate mr-3">
                    <!-- this hidden checkbox controls the state -->
                    <input type="checkbox" :checked="isDark" @change="toggle" />

                    <!-- sun icon -->
                    <svg class="swap-on h-7 w-7 fill-current dark:text-gray-200" xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24">
                        <path
                            d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                    </svg>

                    <!-- moon icon -->
                    <svg class="swap-off h-7 w-7 fill-current dark:text-gray-200" xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24">
                        <path
                            d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                    </svg>
                </label>

                <OrdersNotifications v-if="userRole.userRole === 'admin'" />
                <AppointmentsNotifications v-else-if="userRole.userRole === 'doctor'" />

                <div class="dropdown dropdown-end">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                        <div class="w-10 rounded-full">
                            <img alt="Tailwind CSS Navbar component" v-if="photo"
                                :src="backendUrl.backendUrl + photo" />
                            <img alt="Tailwind CSS Navbar component" v-else
                                src="/src/assets/images/unkown-profile-pic.png" />
                        </div>
                    </div>
                    <ul tabindex="0"
                        class="menu font-jakarta menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow">
                        <li>
                            <RouterLink to="/profile" class="justify-between">
                                Profile
                            </RouterLink>
                        </li>
                        <li><button @click="logout">Logout</button></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>