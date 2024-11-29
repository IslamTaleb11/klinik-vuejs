<script setup>
import { onBeforeMount } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useSideBar } from '../../stores/sideBar.js';
import { useFetchUserRole } from '../../stores/fetchUserRole.js';

const sideBar = useSideBar()



const route = useRoute()
// const showSideBar = ref(true)
onBeforeMount(() => {
    if (window.innerWidth <= 1024) {
        sideBar.showSideBar = false
    }
})
// const toggleSideBar = () => {
//     showSideBar.value = !showSideBar.value
// }

const role = useFetchUserRole()
</script>



<template>
    <div
        class="py-5 z-10 px-5 w-[20%] relative  max-[1024px]:fixed max-[1024px]:px-2 max-[400px]:w-[85%] max-[580px]:w-[65%] max-[800px]:w-[40%] max-[900px]:w-[30%] max-[1024px]:w-[35%] max-[1280px]:w-[40%] max-[1536px]:w-[30%] max-[1024px]:py-0">

        <transition name="slide">
            <div v-if="sideBar.showSideBar"
                class="bg-white dark:bg-darkmodebg custom-scrollbar overflow-y-auto z-10 h-screen shadow-lg fixed rounded-[35px] w-60 py-7 ">
                <div @click="sideBar.toggleSideBar"
                    class="bg-primarycolor min-[1025px]:hidden cursor-pointer rounded-full right-1 absolute h-10 w-10 text-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 512 512">
                        <!-- !Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc -->
                        <path fill="#ffffff"
                            d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-128 128z" />
                    </svg>
                </div>
                <div class="flex justify-start px-7">
                    <RouterLink to="/" class="text-3xl font-recursive font-bold dark:text-gray-200">Klinik</RouterLink>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="flex items-center w-[75%] justify-start mt-10 px-7">
                        <p class="text-gray-400 font-jakarta text-sm">HOME</p>
                    </div>

                    <div
                        class="relative flex items-center w-[75%] justify-start px-7 transform transition duration-300 group py-3">
                        <RouterLink
                            :to="role.userRole === 'doctor' ? '/doctor-dashboard' : role.userRole === 'nurse' ? '/nurse-dashboard' :
                                role.userRole === 'pharmacist' ? '/pharmacist-dashboard' : role.userRole === 'patient' ? '/patient-dashboard' : '/admin-dashboard'">
                            <div :class="{
                                'text-primarycolor items-center hover:text-white font-jakarta font-semibold flex gap-5 relative z-10 group-hover:text-white cursor-pointer': route.path !== '/admin-dashboard' && route.path !== '/doctor-dashboard' && route.path !== '/nurse-dashboard' && route.path !== '/patient-dashboard',
                                'text-white items-center font-jakarta font-semibold flex gap-5 relative z-10 cursor-pointer': route.path === '/admin-dashboard' || route.path === '/doctor-dashboard' || route.path === '/nurse-dashboard' || route.path === '/pharmacist-dashboard' || route.path === '/patient-dashboard'
                            }">
                                <i :class="{
                                    'fa-solid fa-gauge text-primarycolor group-hover:text-white': route.path !== '/admin-dashboard' && route.path !== '/doctor-dashboard' && route.path !== '/nurse-dashboard' && route.path !== '/pharmacist-dashboard' && route.path !== '/patient-dashboard',
                                    'fa-solid fa-gauge text-white': route.path === '/admin-dashboard' || route.path === '/doctor-dashboard' || route.path === '/nurse-dashboard' || route.path === '/pharmacist-dashboard' || route.path === '/patient-dashboard'
                                }"></i>
                                Dashboard
                            </div>

                            <div v-if="route.path === '/admin-dashboard' || route.path === '/doctor-dashboard' || route.path === '/nurse-dashboard' || route.path === '/pharmacist-dashboard' || route.path === '/patient-dashboard'"
                                class="absolute inset-0 bg-primarycolor transform origin-left rounded-r-full">
                            </div>

                            <div :class="{
                                'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/admin-dashboard' || route.path === '/doctor-dashboard' || route.path === '/nurse-dashboard' || route.path === '/pharmacist-dashboard' || route.path === '/patient-dashboard',
                                'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/admin-dashboard' && route.path !== '/doctor-dashboard' && route.path !== '/nurse-dashboard' && route.path !== '/pharmacist-dashboard' && route.path !== '/patient-dashboard'
                            }"></div>
                        </RouterLink>
                    </div>

                    <div class="flex items-center w-[75%] justify-start px-7">
                        <p class="text-gray-400 font-jakarta text-sm">General Management</p>
                    </div>



                    <!-- Patient Appointments -->
                    <div v-if="role.userRole === 'patient'" class="group relative flex items-center w-full px-7 py-3">
                        <RouterLink to="/patient-appointments">
                            <div :class="{
                                'text-primarycolor font-jakarta font-semibold flex gap-3 relative z-10 group-hover:text-white items-center': route.path !== '/patient-appointments',
                                'text-white font-jakarta font-semibold flex gap-3 relative z-10 items-center': route.path === '/patient-appointments'
                            }">
                                <i class="fa-solid fa-calendar-check"></i>                                                 
                                Appointments
                            </div>
                            <div :class="{
                                'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/patient-appointments',
                                'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/patient-appointments'
                            }"></div>
                        </RouterLink>
                    </div>


                    <!-- Patient Orders -->
                    <div v-if="role.userRole === 'patient'" class="group relative flex items-center w-full px-7 py-3">
                        <RouterLink to="/patient-orders">
                            <div :class="{
                                'text-primarycolor font-jakarta font-semibold flex gap-3 relative z-10 group-hover:text-white items-center': route.path !== '/patient-orders',
                                'text-white font-jakarta font-semibold flex gap-3 relative z-10 items-center': route.path === '/patient-orders'
                            }">
                                <i class="fa-solid fa-shopping-cart"></i>                                                 
                                Orders
                            </div>
                            <div :class="{
                                'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/patient-orders',
                                'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/patient-orders'
                            }"></div>
                        </RouterLink>
                    </div>


                    <!-- Human Resources Start -->
                    <div v-if="role.userRole === 'admin'"
                        class="relative flex flex-col w-fit justify-start transform transition duration-300  cursor-pointer gap-2">
                        <!-- Resources Group -->
                        <div @click="sideBar.toggleResourcesExpan"
                            class="group relative flex items-center w-full px-7 py-3 cursor-pointer">
                            <div
                                class="text-primarycolor font-jakarta font-semibold flex gap-5 relative z-10 group-hover:text-white items-center">
                                <i class="fa-solid fa-people-group text-primarycolor group-hover:text-white"></i>
                                Resources
                                <span id="arrow" class="material-symbols-outlined">keyboard_arrow_down</span>
                            </div>
                            <div
                                class="absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full">
                            </div>
                        </div>
                        <!-- child container -->
                        <div id="container"
                            :class="{ 'max-h-0 overflow-hidden': !sideBar.isResourcesExpanded, 'max-h-[1000px]': sideBar.isResourcesExpanded }"
                            class="duration-500 ease-in-out gap-3 flex flex-col">

                            <div class="group relative flex items-center w-full px-7 py-3">
                                <RouterLink to="/users">
                                    <div :class="{
                                        'text-primarycolor font-jakarta font-semibold flex gap-3 relative z-10 group-hover:text-white items-center': route.path !== '/users',
                                        'text-white font-jakarta font-semibold flex gap-3 relative z-10 items-center': route.path === '/users'
                                    }">
                                        <i class="fa-solid fa-users"></i>
                                        All Users
                                    </div>
                                    <div :class="{
                                        'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/users',
                                        'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/users'
                                    }"></div>
                                </RouterLink>
                            </div>

                            <!-- Doctors Group -->
                            <div class="group relative flex items-center w-full px-7 py-3">
                                <RouterLink to="/doctors">
                                    <div :class="{
                                        'text-primarycolor font-jakarta font-semibold flex gap-3 relative z-10 group-hover:text-white items-center': route.path !== '/doctors',
                                        'text-white font-jakarta font-semibold flex gap-3 relative z-10 items-center': route.path === '/doctors'
                                    }">
                                        <i class="fa-solid fa-user-doctor"></i>
                                        Doctors
                                    </div>
                                    <div :class="{
                                        'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/doctors',
                                        'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/doctors'
                                    }"></div>
                                </RouterLink>
                            </div>

                            <div class="group relative flex items-center w-full px-7 py-3">
                                <RouterLink to="/nurses">
                                    <div :class="{
                                        'text-primarycolor font-jakarta font-semibold flex gap-3 relative z-10 group-hover:text-white items-center': route.path !== '/nurses',
                                        'text-white font-jakarta font-semibold flex gap-3 relative z-10 items-center': route.path === '/nurses'
                                    }">
                                        <i class="fa-solid fa-user-nurse"></i>
                                        Nurses
                                    </div>
                                    <div :class="{
                                        'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/nurses',
                                        'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/nurses'
                                    }"></div>
                                </RouterLink>
                            </div>

                            <div class="group relative flex items-center w-full px-7 py-3">
                                <RouterLink to="/laboratorists">
                                    <div :class="{
                                        'text-primarycolor font-jakarta font-semibold flex gap-3 relative z-10 group-hover:text-white items-center': route.path !== '/laboratorists',
                                        'text-white font-jakarta font-semibold flex gap-3 relative z-10 items-center': route.path === '/laboratorists'
                                    }">
                                        <i class="fa-solid fa-vial-virus"></i>
                                        Laboratorists
                                    </div>
                                    <div :class="{
                                        'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/laboratorists',
                                        'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/laboratorists'
                                    }"></div>
                                </RouterLink>
                            </div>

                            <div class="group relative flex items-center w-full px-7 py-3">
                                <RouterLink to="/pharmacists">
                                    <div :class="{
                                        'text-primarycolor font-jakarta font-semibold flex gap-3 relative z-10 group-hover:text-white items-center': route.path !== '/pharmacists',
                                        'text-white font-jakarta font-semibold flex gap-3 relative z-10 items-center': route.path === '/pharmacists'
                                    }">
                                        <i class="fa-solid fa-prescription-bottle"></i>
                                        Pharmacists
                                    </div>
                                    <div :class="{
                                        'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/pharmacists',
                                        'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/pharmacists'
                                    }"></div>
                                </RouterLink>
                            </div>

                            <div class="group relative flex items-center w-full px-7 py-3">
                                <RouterLink to="/patients">
                                    <div :class="{
                                        'text-primarycolor font-jakarta font-semibold flex gap-3 relative z-10 group-hover:text-white items-center': route.path !== '/patients',
                                        'text-white font-jakarta font-semibold flex gap-3 relative z-10 items-center': route.path === '/patients'
                                    }">
                                        <i class="fa-solid fa-bed-pulse"></i>
                                        Patients
                                    </div>
                                    <div :class="{
                                        'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/patients',
                                        'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/patients'
                                    }"></div>
                                </RouterLink>
                            </div>
                        </div>
                    </div>
                    <!-- Human Resources End -->

                    <!-- Services Start -->
                    <div v-if="role.userRole === 'doctor'"
                        class="relative flex items-center w-[85%] justify-start px-7 transform transition duration-300 group py-3">
                        <RouterLink to="/doctor-schedules">
                            <div :class="{
                                'text-primarycolor items-center hover:text-white font-jakarta font-semibold flex gap-5 relative z-10 group-hover:text-white cursor-pointer': route.path !== '/doctor-schedules',
                                'text-white items-center font-jakarta font-semibold flex gap-5 relative z-10 cursor-pointer': route.path === '/doctor-schedules'
                            }">
                                <i :class="{
                                    'fa-solid fa-calendar-days text-primarycolor group-hover:text-white': route.path !== '/doctor-schedules',
                                    'fa-solid fa-calendar-days text-white': route.path === '/doctor-schedules'
                                }"></i>
                                Schedules
                            </div>

                            <div v-if="route.path === '/doctor-schedules'"
                                class="absolute inset-0 bg-primarycolor transform origin-left rounded-r-full">
                            </div>

                            <div :class="{
                                'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/doctor-schedules',
                                'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/doctor-schedules'
                            }"></div>
                        </RouterLink>
                    </div>
                    <!-- Services End -->

                    <!-- Monitor Hospital Start -->
                    <div v-if="role.userRole === 'admin' || role.userRole === 'nurse' || role.userRole === 'pharmacist'"
                        class="relative flex flex-col w-fit justify-start transform transition duration-300  cursor-pointer gap-2">
                        <!-- Monitor Hospital Group -->
                        <div @click="sideBar.toggleMonitorExpan"
                            class="group relative flex items-center w-full px-7 py-3 cursor-pointer">
                            <div
                                class="text-primarycolor font-jakarta font-semibold flex gap-5 relative z-10 group-hover:text-white items-center">
                                <i class="fa-solid fa-square-h text-primarycolor group-hover:text-white"></i>
                                Monitor Hospital
                                <span id="monitor-arrow" class="material-symbols-outlined">keyboard_arrow_down</span>
                            </div>
                            <div
                                class="absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full">
                            </div>
                        </div>
                        <!-- child container -->
                        <div id="container"
                            v-if="role.userRole === 'admin' || role.userRole === 'nurse' || role.userRole === 'pharmacist'"
                            :class="{ 'max-h-0 overflow-hidden': !sideBar.isMonitorExpanded, 'max-h-[1000px]': sideBar.isMonitorExpanded }"
                            class="duration-500 ease-in-out gap-3 flex flex-col">

                            <div class="group relative flex items-center w-full px-7 py-3"
                                v-if="role.userRole === 'admin' || role.userRole === 'nurse'">
                                <RouterLink :to="role.userRole === 'admin' ? '/blood-bank' : '/nurse-blood-bank'">
                                    <div :class="{
                                        'text-primarycolor font-jakarta font-semibold flex gap-3 relative z-10 group-hover:text-white items-center': route.path !== '/blood-bank' || route.path !== '/nurse-blood-bank',
                                        'text-white font-jakarta font-semibold flex gap-3 relative z-10 items-center': route.path === '/blood-bank' || route.path === '/nurse-blood-bank'
                                    }">
                                        <i class="fa-solid fa-truck-droplet"></i>
                                        Blood Bank
                                    </div>
                                    <div :class="{
                                        'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/blood-bank' || route.path === '/nurse-blood-bank',
                                        'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/blood-bank' && route.path !== '/nurse-blood-bank'
                                    }"></div>
                                </RouterLink>
                            </div>

                            <div class="group relative flex items-center w-full px-7 py-3"
                                v-if="role.userRole === 'admin' || role.userRole === 'nurse'">
                                <RouterLink :to="role.userRole === 'admin' ? '/blood-donors' : '/nurse-blood-donors'">
                                    <div :class="{
                                        'text-primarycolor font-jakarta font-semibold flex gap-3 relative z-10 group-hover:text-white items-center': route.path !== '/blood-donors' && route.path !== '/nurse-blood-donors',
                                        'text-white font-jakarta font-semibold flex gap-3 relative z-10 items-center': route.path === '/blood-donors' || route.path === '/nurse-blood-donors'
                                    }">
                                        <i class="fa-solid fa-hand-holding-droplet"></i>
                                        Blood Donors
                                    </div>
                                    <div :class="{
                                        'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/blood-donors' || route.path === '/nurse-blood-donors',
                                        'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/blood-donors' && route.path !== '/nurse-blood-donors'
                                    }"></div>
                                </RouterLink>
                            </div>


                            <div class="group relative flex items-center w-full px-7 py-3"
                                v-if="role.userRole === 'admin' || role.userRole === 'nurse' || role.userRole === 'doctor'">
                                <RouterLink
                                    :to="role.userRole === 'admin' ? '/operation-reports' : '/nurse-operation-reports'">
                                    <div :class="{
                                        'text-primarycolor font-jakarta font-semibold flex gap-3 relative z-10 group-hover:text-white items-center': route.path !== '/operation-reports' && route.path !== '/nurse-operation-reports',
                                        'text-white font-jakarta font-semibold flex gap-3 relative z-10 items-center': route.path === '/operation-reports' || route.path === '/nurse-operation-reports'
                                    }">
                                        <i class="fa-solid fa-bed-pulse"></i>
                                        Operations Reports
                                    </div>
                                    <div :class="{
                                        'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/operation-reports' || route.path === '/nurse-operation-reports',
                                        'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/operation-reports' && route.path !== '/nurse-operation-reports'
                                    }"></div>
                                </RouterLink>
                            </div>

                            <div class="group relative flex items-center w-full px-7 py-3"
                                v-if="role.userRole === 'admin' || role.userRole === 'nurse' || role.userRole === 'doctor'">
                                <RouterLink :to="role.userRole === 'admin' ? '/birth-reports' : '/nurse-birth-reports'">
                                    <div :class="{
                                        'text-primarycolor font-jakarta font-semibold flex gap-3 relative z-10 group-hover:text-white items-center': route.path !== '/birth-reports' && route.path !== '/nurse-birth-reports',
                                        'text-white font-jakarta font-semibold flex gap-3 relative z-10 items-center': route.path === '/birth-reports' || route.path === '/nurse-birth-reports'
                                    }">
                                        <i class="fa-solid fa-person-pregnant"></i>
                                        Birth Reports
                                    </div>
                                    <div :class="{
                                        'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/birth-reports' || route.path === '/nurse-birth-reports',
                                        'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/birth-reports' && route.path !== '/nurse-birth-reports'
                                    }"></div>
                                </RouterLink>
                            </div>

                            <div class="group relative flex items-center w-full px-7 py-3"
                                v-if="role.userRole === 'admin' || role.userRole === 'nurse' || role.userRole === 'doctor'">
                                <RouterLink :to="role.userRole === 'admin' ? '/death-reports' : '/nurse-death-reports'">
                                    <div :class="{
                                        'text-primarycolor font-jakarta font-semibold flex gap-3 relative z-10 group-hover:text-white items-center': route.path !== '/death-reports' && route.path !== '/nurse-death-reports',
                                        'text-white font-jakarta font-semibold flex gap-3 relative z-10 items-center': route.path === '/death-reports' || route.path === '/nurse-death-reports'
                                    }">
                                        <i class="fa-solid fa-skull-crossbones"></i>
                                        Death Reports
                                    </div>
                                    <div :class="{
                                        'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/death-reports' || route.path === '/nurse-death-reports',
                                        'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/death-reports' && route.path !== '/nurse-death-reports'
                                    }"></div>
                                </RouterLink>
                            </div>

                            <div class="group relative flex items-center w-full px-7 py-3"
                                v-if="role.userRole === 'admin' || role.userRole === 'nurse'">
                                <RouterLink
                                    :to="role.userRole === 'admin' ? '/bed-allotments' : '/nurse-bed-allotments'">
                                    <div :class="{
                                        'text-primarycolor font-jakarta font-semibold flex gap-3 relative z-10 group-hover:text-white items-center': route.path !== '/bed-allotments' && route.path !== '/nurse-bed-allotments',
                                        'text-white font-jakarta font-semibold flex gap-3 relative z-10 items-center': route.path === '/bed-allotments' || route.path === '/nurse-bed-allotments'
                                    }">
                                        <i class="fa-solid fa-bed-pulse"></i>
                                        Bed Allotments
                                    </div>
                                    <div :class="{
                                        'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/bed-allotments' || route.path === '/nurse-bed-allotments',
                                        'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/bed-allotments' && route.path !== '/nurse-bed-allotments'
                                    }"></div>
                                </RouterLink>
                            </div>

                            <!-- Medicines -->
                            <div class="group relative flex items-center w-full px-7 py-3"
                                v-if="role.userRole === 'admin' || role.userRole === 'nurse' || role.userRole === 'pharmacist' || role.userRole === 'doctor'">
                                <RouterLink
                                    :to="role.userRole === 'admin' ? '/medicines' : role.userRole === 'nurse' ? '/nurse-medicines' : role.userRole === 'pharmacist' ? '/pharmacist-medicines' : '/doctor-medicines'">
                                    <div :class="{
                                        'text-primarycolor font-jakarta font-semibold flex gap-3 relative z-10 group-hover:text-white items-center': route.path !== '/medicines' && route.path !== '/nurse-medicines' && route.path !== '/pharmacist-medicines' && route.path !== '/doctor-medicines',
                                        'text-white font-jakarta font-semibold flex gap-3 relative z-10 items-center': route.path === '/medicines' || route.path === '/nurse-medicines' || route.path === '/pharmacist-medicines' || route.path === '/doctor-medicines'
                                    }">
                                        <i class="fa-solid fa-capsules"></i>
                                        Medicines
                                    </div>
                                    <div :class="{
                                        'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/medicines' || route.path === '/nurse-medicines' || route.path === '/pharmacist-medicines' || route.path === '/doctor-medicines',
                                        'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/medicines' && route.path !== '/nurse-medicines' && route.path !== '/pharmacist-medicines' && route.path !== '/doctor-medicines'
                                    }"></div>
                                </RouterLink>
                            </div>

                            <!-- Vaccinations -->
                            <div class="group relative flex items-center w-full px-7 py-3"
                                v-if="role.userRole === 'admin' || role.userRole === 'nurse' || role.userRole === 'doctor'">
                                <RouterLink
                                    :to="role.userRole === 'admin' ? '/vaccines' : role.userRole === 'nurse' ? '/nurse-vaccines' : '/doctor-vaccines'">
                                    <div :class="{
                                        'text-primarycolor font-jakarta font-semibold flex gap-3 relative z-10 group-hover:text-white items-center': route.path !== '/vaccines' && route.path !== '/nurse-vaccines' && route.path !== '/doctor-vaccines',
                                        'text-white font-jakarta font-semibold flex gap-3 relative z-10 items-center': route.path === '/vaccines' || route.path === '/nurse-vaccines' || route.path === '/doctor-vaccines'
                                    }">
                                        <i class="fa-solid fa-syringe"></i>
                                        Vaccinations
                                    </div>
                                    <div :class="{
                                        'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/vaccines' || route.path === '/nurse-vaccines' || route.path === '/doctor-vaccines',
                                        'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/vaccines' && route.path !== '/nurse-vaccines' && route.path !== '/doctor-vaccines'
                                    }"></div>
                                </RouterLink>
                            </div>


                            <div class="group relative flex items-center w-full px-7 py-3"
                                v-if="role.userRole === 'admin'">
                                <RouterLink to="/departments">
                                    <div :class="{
                                        'text-primarycolor font-jakarta font-semibold flex gap-3 relative z-10 group-hover:text-white items-center': route.path !== '/departments',
                                        'text-white font-jakarta font-semibold flex gap-3 relative z-10 items-center': route.path === '/departments'
                                    }">
                                        <i class="fa-solid fa-building"></i>
                                        Departments
                                    </div>
                                    <div :class="{
                                        'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/departments',
                                        'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/departments'
                                    }"></div>
                                </RouterLink>
                            </div>
                        </div>
                    </div>
                    <!-- Monitor Hospital End -->


                    <!-- Services Start -->
                    <div v-if="role.userRole === 'admin'"
                        class="relative flex items-center w-[75%] justify-start px-7 transform transition duration-300 group py-3">
                        <RouterLink to="/services">
                            <div :class="{
                                'text-primarycolor items-center hover:text-white font-jakarta font-semibold flex gap-5 relative z-10 group-hover:text-white cursor-pointer': route.path !== '/services',
                                'text-white items-center font-jakarta font-semibold flex gap-5 relative z-10 cursor-pointer': route.path === '/services'
                            }">
                                <i :class="{
                                    'fa-solid fa-tools text-primarycolor group-hover:text-white': route.path !== '/services',
                                    'fa-solid fa-tools text-white': route.path === '/services'
                                }"></i>
                                Services
                            </div>

                            <div v-if="route.path === '/services'"
                                class="absolute inset-0 bg-primarycolor transform origin-left rounded-r-full">
                            </div>

                            <div :class="{
                                'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/services',
                                'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/services'
                            }"></div>
                        </RouterLink>
                    </div>
                    <!-- Services End -->


                    <!-- Offers Start -->
                    <div v-if="role.userRole === 'admin'"
                        class="relative flex items-center w-[75%] justify-start px-7 transform transition duration-300 group py-3">
                        <RouterLink to="/offers">
                            <div :class="{
                                'text-primarycolor items-center hover:text-white font-jakarta font-semibold flex gap-5 relative z-10 group-hover:text-white cursor-pointer': route.path !== '/offers',
                                'text-white items-center font-jakarta font-semibold flex gap-5 relative z-10 cursor-pointer': route.path === '/offers'
                            }">
                                <i :class="{
                                    'fa-solid fa-tags text-primarycolor group-hover:text-white': route.path !== '/offers',
                                    'fa-solid fa-tags text-white': route.path === '/offers'
                                }"></i>
                                Offers
                            </div>

                            <div v-if="route.path === '/offers'"
                                class="absolute inset-0 bg-primarycolor transform origin-left rounded-r-full">
                            </div>

                            <div :class="{
                                'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/offers',
                                'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/offers'
                            }"></div>
                        </RouterLink>
                    </div>
                    <!-- Offers End -->


                    <!-- Orders Start -->
                    <div v-if="role.userRole === 'admin'"
                        class="relative flex items-center w-[75%] justify-start px-7 transform transition duration-300 group py-3">
                        <RouterLink to="/orders">
                            <div :class="{
                                'text-primarycolor items-center hover:text-white font-jakarta font-semibold flex gap-5 relative z-10 group-hover:text-white cursor-pointer': route.path !== '/orders',
                                'text-white items-center font-jakarta font-semibold flex gap-5 relative z-10 cursor-pointer': route.path === '/orders'
                            }">
                                <i :class="{
                                    'fa-solid fa-shopping-cart text-primarycolor group-hover:text-white': route.path !== '/orders',
                                    'fa-solid fa-shopping-cart text-white': route.path === '/orders'
                                }"></i>
                                Orders
                            </div>

                            <div v-if="route.path === '/orders'"
                                class="absolute inset-0 bg-primarycolor transform origin-left rounded-r-full">
                            </div>

                            <div :class="{
                                'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/orders',
                                'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/orders'
                            }"></div>
                        </RouterLink>
                    </div>
                    <!-- Orders End -->


                    <!-- Appointments Start -->
                    <div v-if="role.userRole === 'admin'"
                        class="relative flex items-center w-[85%] justify-start px-7 transform transition duration-300 group py-3">
                        <RouterLink to="/appointments">
                            <div :class="{
                                'text-primarycolor items-center hover:text-white font-jakarta font-semibold flex gap-5 relative z-10 group-hover:text-white cursor-pointer': route.path !== '/appointments',
                                'text-white items-center font-jakarta font-semibold flex gap-5 relative z-10 cursor-pointer': route.path === '/appointments'
                            }">
                                <i :class="{
                                    'fa-solid fa-calendar-check text-primarycolor group-hover:text-white': route.path !== '/appointments',
                                    'fa-solid fa-calendar-check text-white': route.path === '/appointments'
                                }"></i>
                                Appointments
                            </div>

                            <div v-if="route.path === '/appointments'"
                                class="absolute inset-0 bg-primarycolor transform origin-left rounded-r-full">
                            </div>

                            <div :class="{
                                'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/appointments',
                                'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/appointments'
                            }"></div>
                        </RouterLink>
                    </div>
                    <!-- Appointments End -->


                    <!-- My Appointments Start -->
                    <div v-if="role.userRole === 'doctor'"
                        class="relative flex items-center w-[85%] justify-start px-7 transform transition duration-300 group py-3">
                        <RouterLink to="/doctor-appointments">
                            <div :class="{
                                'text-primarycolor items-center hover:text-white font-jakarta font-semibold flex gap-5 relative z-10 group-hover:text-white cursor-pointer': route.path !== '/doctor-appointments',
                                'text-white items-center font-jakarta font-semibold flex gap-5 relative z-10 cursor-pointer': route.path === '/doctor-appointments'
                            }">
                                <i :class="{
                                    'fa-solid fa-calendar-check text-primarycolor group-hover:text-white': route.path !== '/doctor-appointments',
                                    'fa-solid fa-calendar-check text-white': route.path === '/doctor-appointments'
                                }"></i>
                                Appointments
                            </div>

                            <div v-if="route.path === '/doctor-appointments'"
                                class="absolute inset-0 bg-primarycolor transform origin-left rounded-r-full">
                            </div>

                            <div :class="{
                                'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/doctor-appointments',
                                'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/doctor-appointments'
                            }"></div>
                        </RouterLink>
                    </div>
                    <!-- My Appointments End -->


                    <!-- Doctor Calendar Start -->
                    <div v-if="role.userRole === 'doctor'"
                        class="relative flex items-center w-[85%] justify-start px-7 transform transition duration-300 group py-3">
                        <RouterLink to="/doctor-calendar">
                            <div :class="{
                                'text-primarycolor items-center hover:text-white font-jakarta font-semibold flex gap-5 relative z-10 group-hover:text-white cursor-pointer': route.path !== '/doctor-calendar',
                                'text-white items-center font-jakarta font-semibold flex gap-5 relative z-10 cursor-pointer': route.path === '/doctor-calendar'
                            }">
                                <i :class="{
                                    'fa-regular fa-calendar-days text-primarycolor group-hover:text-white': route.path !== '/doctor-calendar',
                                    'fa-regular fa-calendar-days text-white': route.path === '/doctor-calendar'
                                }"></i>
                                Calendar
                            </div>

                            <div v-if="route.path === '/doctor-calendar'"
                                class="absolute inset-0 bg-primarycolor transform origin-left rounded-r-full">
                            </div>

                            <div :class="{
                                'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/ddoctor-calendar',
                                'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/doctor-calendar'
                            }"></div>
                        </RouterLink>
                    </div>
                    <!-- Doctor Calendar End -->


                    <!-- Doctors Start -->
                    <div v-if="role.userRole === 'doctor'"
                        class="relative flex items-center w-[85%] justify-start px-7 transform transition duration-300 group py-3">
                        <RouterLink to="/doctor-doctors">
                            <div :class="{
                                'text-primarycolor items-center hover:text-white font-jakarta font-semibold flex gap-5 relative z-10 group-hover:text-white cursor-pointer': route.path !== '/doctor-doctors',
                                'text-white items-center font-jakarta font-semibold flex gap-5 relative z-10 cursor-pointer': route.path === '/doctor-doctors'
                            }">
                                <i :class="{
                                    'fa-solid fa-user-doctor text-primarycolor group-hover:text-white': route.path !== '/doctor-doctors',
                                    'fa-solid fa-user-doctor text-white': route.path === '/doctor-doctors'
                                }"></i>
                                Doctors
                            </div>

                            <div v-if="route.path === '/doctor-doctors'"
                                class="absolute inset-0 bg-primarycolor transform origin-left rounded-r-full">
                            </div>

                            <div :class="{
                                'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/ddoctor-doctors',
                                'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/doctor-doctors'
                            }"></div>
                        </RouterLink>
                    </div>
                    <!-- Doctors End -->


                    <!-- Patients Start -->
                    <div v-if="role.userRole === 'doctor'"
                        class="relative flex items-center w-[85%] justify-start px-7 transform transition duration-300 group py-3">
                        <RouterLink to="/doctor-patients">
                            <div :class="{
                                'text-primarycolor items-center hover:text-white font-jakarta font-semibold flex gap-5 relative z-10 group-hover:text-white cursor-pointer': route.path !== '/doctor-patients',
                                'text-white items-center font-jakarta font-semibold flex gap-5 relative z-10 cursor-pointer': route.path === '/doctor-patients'
                            }">
                                <i :class="{
                                    'fa-solid fa-bed-pulse text-primarycolor group-hover:text-white': route.path !== '/doctor-patients',
                                    'fa-solid fa-bed-pulse text-white': route.path === '/doctor-patients'
                                }"></i>
                                Patients
                            </div>

                            <div v-if="route.path === '/doctor-patients'"
                                class="absolute inset-0 bg-primarycolor transform origin-left rounded-r-full">
                            </div>

                            <div :class="{
                                'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/doctor-patients',
                                'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/doctor-patients'
                            }"></div>
                        </RouterLink>
                    </div>
                    <!-- Patients End -->

                    <!-- Doctor Bed Allotments Start -->
                    <div v-if="role.userRole === 'doctor'"
                        class="relative flex items-center w-[85%] justify-start px-7 transform transition duration-300 group py-3">
                        <RouterLink to="/doctor-bed-allotments">
                            <div :class="{
                                'text-primarycolor items-center hover:text-white font-jakarta font-semibold flex gap-5 relative z-10 group-hover:text-white cursor-pointer': route.path !== '/doctor-bed-allotments',
                                'text-white items-center font-jakarta font-semibold flex gap-5 relative z-10 cursor-pointer': route.path === '/doctor-bed-allotments'
                            }">
                                <i :class="{
                                    'fas fa-bed text-primarycolor group-hover:text-white': route.path !== '/doctor-bed-allotments',
                                    'fas fa-bed text-white': route.path === '/doctor-bed-allotments'
                                }"></i>
                                Bed Allotments
                            </div>

                            <div v-if="route.path === '/doctor-bed-allotments'"
                                class="absolute inset-0 bg-primarycolor transform origin-left rounded-r-full">
                            </div>

                            <div :class="{
                                'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/doctor-bed-allotments',
                                'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/doctor-bed-allotments'
                            }"></div>
                        </RouterLink>
                    </div>
                    <!-- Doctor Bed Allotments End -->

                    <!-- Settings Start -->
                    <!-- <div v-if="role.userRole === 'admin'"
                        class="relative flex items-center w-[75%] justify-start px-7 transform transition duration-300 group py-3">
                        <RouterLink to="/dashboard">
                            <div :class="{
                                'text-primarycolor items-center hover:text-white font-jakarta font-semibold flex gap-5 relative z-10 group-hover:text-white cursor-pointer': route.path !== '/settings',
                                'text-white items-center font-jakarta font-semibold flex gap-5 relative z-10 cursor-pointer': route.path === '/settings'
                            }">
                                <i :class="{
                                    'fa-solid fa-gears text-primarycolor group-hover:text-white': route.path !== '/settings',
                                    'fa-solid fa-gears text-white': route.path === '/settings'
                                }"></i>
                                Settings
                            </div>

                            <div v-if="route.path === '/settings'"
                                class="absolute inset-0 bg-primarycolor transform origin-left rounded-r-full">
                            </div>

                            <div :class="{
                                'absolute inset-0 bg-primarycolor transform origin-left rounded-r-full': route.path === '/settings',
                                'absolute inset-0 bg-primarycolor transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-r-full': route.path !== '/settings'
                            }"></div>
                        </RouterLink>
                    </div> -->
                    <!-- Settings End -->
                </div>
            </div>
        </transition>
    </div>
</template>


<style scoped>
.slide-enter-active {
    transition: transform 0.5s ease;
}

@media (max-width: 1024px) {
    .slide-enter-from {
        transform: translateX(-200%);
    }
}

.slide-enter-to {
    transform: translateX(0);
}

.slide-leave-active {
    transition: transform 0.5s ease;
}

.slide-leave-from {
    transform: translateX(0);
}

.slide-leave-to {
    transform: translateX(-200%);
}

.custom-scrollbar {
    scrollbar-width: thin;
    /* For Firefox */
    scrollbar-color: #c5c2c2 #f1f1f1;
    /* For Firefox */
}

/* For Webkit browsers (Chrome, Safari) */
.custom-scrollbar::-webkit-scrollbar {
    width: 12px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 10px;
    border: 3px solid #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>