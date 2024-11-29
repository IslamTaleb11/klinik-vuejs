<script setup>
import { onBeforeMount, onMounted, ref } from 'vue'
import { useNavBarToggle } from '../stores/navBar.js'
import { RouterLink } from 'vue-router';
import { Toaster, toast } from 'vue-sonner';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLogout } from '../stores/logout.js';
import { useBackendUrl } from '../stores/backendUrl.js';
import axios from 'axios';
import { useGetUserData } from '../stores/getUserData';

const backendUrl = useBackendUrl()
const router = useRouter()
const route = useRoute();
const isDark = ref(false);
const bgThemeKey = 'bgTheme';
let photo = ref('')
photo = route.meta.requiresHeaderPhoto

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

const setInitialTheme = () => {
  const theme = localStorage.getItem(bgThemeKey);
  const element = document.querySelector('html');
  if (theme === 'dark') {
    isDark.value = true;
    element.classList.add('dark');
  } else {
    isDark.value = false;
    element.classList.remove('dark');
  }
};



const isAuth = computed(() => {
  return route.meta.isAuth;
});


let isUserAuth = ref(false)
onBeforeMount(async () => {
  isUserAuth = isAuth.value
})


setInitialTheme();

let navBarToggle = useNavBarToggle()


const profileDropDown = ref(false)

const showProfileDropDown = () => {
  profileDropDown.value = !profileDropDown.value
}

const logoutState = useLogout()
const userDataState = useGetUserData()
const logout = () => {
  isUserAuth = false
  logoutState.logout()
  localStorage.removeItem('isUserAuth');
  localStorage.removeItem('token');
  toast.success('You have logged out successfully')
  router.push('/')
  localStorage.removeItem('userProfile')
  localStorage.removeItem('photo')
  userDataState.isAdmin = false
  userDataState.isNurse = false
  userDataState.isDoctor = false
  userDataState.isPharmacist = false
  userDataState.isLaboratorist = false
  userDataState.isPatient = false

  
}
const role = ref('')
onMounted(async () => {
  await axios.get('/fetch-user-role').then((res) => {
    if (res.data.data) {
      return role.value = res.data.data.role
    }
    return null
  })
})

</script>



<template>

  <Toaster richColors position="top-right" />

  <div class="flex justify-center dark:bg-darkmodebg">
    <div
      class="w-[60%] flex justify-between items-center py-10 max-[1280px]:w-[80%] max-[1536px]:w-[90%] max-[1024px]:w-full max-[1024px]:px-10 max-[1024px]:justify-center">
      <nav class="flex items-center gap-[50px] w-full max-[768px]:justify-between">
        <h1 class="font-recursive font-bold text-4xl self-start text-[#333333] dark:text-white">
          <RouterLink to="/">Klinik</RouterLink>
        </h1>
        <div class="flex max-[1024px]:hidden gap-20">
          <RouterLink to="/" class="font-recursive hover:text-primarycolor dark:text-white">Home</RouterLink>
          <RouterLink to="/about" class="font-recursive hover:text-primarycolor dark:text-white">About</RouterLink>
          <!-- <RouterLink to="" class="font-recursive hover:text-primarycolor dark:text-white">Features</RouterLink> -->
          <!-- <RouterLink to="" class="font-recursive hover:text-primarycolor dark:text-white">Services</RouterLink> -->
          <RouterLink to="/our-offers" class="font-recursive hover:text-primarycolor dark:text-white">Offers
          </RouterLink>

        </div>


      </nav>
      <div class="flex items-center max-[1280px]:hidden gap-5">
        <label class="flex cursor-pointer gap-2 text-primarycolor dark:text-white" @click="toggle">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5" />
            <path
              d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
          </svg>
          <input type="checkbox" value="synthwave" class="toggle theme-controller text-primarycolor"
            :checked="isDark" />
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </label>
        <RouterLink v-if="!isUserAuth" to="/signup"
          class="border text-center max-[768px]:hidden dark:text-white border-gray-500 w-36 py-2 rounded text-primarycolor font-recursive font-semibold hover:bg-primarycolor hover:text-white">
          Signup</RouterLink>


        <div class="w-12 relative h-12" v-if="isUserAuth" @click="showProfileDropDown">
          <img v-if="!photo" alt="tania andrew" src="/src/assets/images/unkown-profile-pic.png"
            class="relative inline-block object-cover object-center w-12 h-12 rounded-full cursor-pointer" />
          <img v-else alt="tania andrew" :src="backendUrl.backendUrl + photo"
            class="relative inline-block object-cover object-center w-12 h-12 rounded-full cursor-pointer" />
          <div v-if="profileDropDown"
            class="absolute z-10 bg-white rounded-xl dark:bg-gray-200 shadow-md mt-2 w-48 top-11 right-0">
            <RouterLink to="/profile" class="flex items-center px-4 py-2 text-gray-800 font-jakarta">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5.121 17.804A9.937 9.937 0 0112 15c1.956 0 3.784.586 5.121 1.804M9 13a3 3 0 106 0 3 3 0 00-6 0zM21 12h-1m-4.222 4.222L15 15M9 15l-1.778 1.778M4 12H3">
                </path>
              </svg>
              Profile
            </RouterLink>
            <RouterLink :to="role === 'admin' ? '/admin-dashboard' : role === 'doctor' ? '/doctor-dashboard' : role === 'nurse' ? '/nurse-dashboard' : 
            role === 'pharmacist' ? '/pharmacist-dashboard' : role === 'patient' ? '/patient-dashboard' : '/'"
            class="flex items-center px-4 py-2 text-gray-800 font-jakarta">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 13h4v8H3v-8zm6-4h4v12h-4V9zm6-6h4v18h-4V3z"></path>
              </svg>
              Dashboard
            </RouterLink>

            <button @click="logout" class="flex items-center px-4 py-2 text-gray-800 font-jakarta">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H4a3 3 0 01-3-3v-1m6-4v-1a3 3 0 00-3-3H1a3 3 0 00-3 3v1">
                </path>
              </svg>
              Logout
            </button>
          </div>
        </div>



        <RouterLink v-else to="/login"
          class="border bg-primarycolor text-center max-[768px]:hidden hover:bg-transparent hover: border-gray-500 w-28 py-2 rounded text-white font-recursive font-semibold hover:text-primarycolor">
          Login</RouterLink>

        <!-- <button
          class="border bg-primarycolor max-[768px]:hidden hover:bg-transparent border-gray-300 w-28 py-2 rounded text-white font-recursive font-semibold hover:text-primarycolor">Sign
          Up</button> -->
      </div>

      <div id="burger" class="min-[1281px]:hidden">
        <label class="btn btn-circle swap swap-rotate z-50">
          <!-- this hidden checkbox controls the state -->
          <input type="checkbox" @click="navBarToggle.toggleNav()" />
          <!-- hamburger icon -->
          <svg class="swap-off fill-current" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
            viewBox="0 0 512 512">
            <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
          </svg>
          <!-- close icon -->
          <svg class="swap-on fill-current" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
            viewBox="0 0 512 512">
            <polygon
              points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
          </svg>

        </label>
      </div>

    </div>
    <div id="mobile-nav"
      class="bg-white z-30 dark:bg-darkmodebg top-0 h-screen fixed flex min-[1281px]:hidden flex-col justify-center drop-shadow-lg hidden items-center gap-7 py-5 w-full">
      <RouterLink to="/" class="font-recursive hover:text-primarycolor text-xl dark:text-white">Home</RouterLink>
      <RouterLink to="/about" class="font-recursive hover:text-primarycolor text-xl dark:text-white">About</RouterLink>
      <!-- <RouterLink to="" class="font-recursive hover:text-primarycolor text-xl dark:text-white">Features</RouterLink> -->
      <!-- <RouterLink to="" class="font-recursive hover:text-primarycolor text-xl dark:text-white">Services</RouterLink> -->
      <RouterLink to="/our-offers" class="font-recursive hover:text-primarycolor text-xl dark:text-white">Offers
      </RouterLink>
      <RouterLink v-if="!isUserAuth" to='/login' class="font-recursive hover:text-primarycolor text-xl dark:text-white">
        Login</RouterLink>
      <RouterLink v-if="!isUserAuth" to='/signup'
        class="font-recursive hover:text-primarycolor text-xl dark:text-white">Signup</RouterLink>

      <label class="flex cursor-pointer gap-2 text-primarycolor dark:text-gray-500" @click="toggle">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5" />
          <path
            d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
        <input type="checkbox" value="synthwave" class="toggle theme-controller text-primarycolor" :checked="isDark" />
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </label>

      <div class="w-12 relative h-12" v-if="isUserAuth" @click="showProfileDropDown">
        <img v-if="!photo" alt="tania andrew" src="/src/assets/images/unkown-profile-pic.png"
          class="relative inline-block object-cover object-center w-12 h-12 rounded-full cursor-pointer" />
        <img v-else alt="tania andrew" :src="backendUrl.backendUrl + photo"
          class="relative inline-block object-cover object-center w-12 h-12 rounded-full cursor-pointer" />
        <div v-if="profileDropDown"
          class="absolute z-10 bg-white rounded-xl font-jakarta dark:bg-gray-200 shadow-md mt-2 w-48 top-11 left-[-70px]">
          <RouterLink to="/profile" class="flex items-center px-4 py-2 text-gray-800">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M5.121 17.804A9.937 9.937 0 0112 15c1.956 0 3.784.586 5.121 1.804M9 13a3 3 0 106 0 3 3 0 00-6 0zM21 12h-1m-4.222 4.222L15 15M9 15l-1.778 1.778M4 12H3">
              </path>
            </svg>
            Profile
          </RouterLink>
          <RouterLink :to="role === 'admin' ? '/admin-dashboard' : role === 'doctor' ? '/doctor-dashboard' : role === 'nurse' ? '/nurse-dashboard' : 
            role === 'pharmacist' ? '/pharmacist-dashboard' : role === 'patient' ? '/patient-dashboard' : '/'" class="flex items-center px-4 py-2 text-gray-800 font-jakarta">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 13h4v8H3v-8zm6-4h4v12h-4V9zm6-6h4v18h-4V3z"></path>
            </svg>
            Dashboard
          </RouterLink>
          <button @click="logout" class="flex items-center px-4 py-2 text-gray-800">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H4a3 3 0 01-3-3v-1m6-4v-1a3 3 0 00-3-3H1a3 3 0 00-3 3v1">
              </path>
            </svg>
            Logout
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
