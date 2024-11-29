import { createRouter, createWebHistory } from 'vue-router';
import { useNavBarToggle } from '../stores/navBar'
import { useCheckAuth } from '../stores/checkAuth'
import { useGetUserData } from '../stores/getUserData';
import axios, { all } from 'axios';
import { useFetchUsers } from '../stores/fetchUsers';
import { useFetchDoctors } from '../stores/fetchDoctors';
import { useFetchNurses } from '../stores/fetchNurses';
import { useFetchLaboratorists } from '../stores/fetchLaboratorists';
import { useFetchPharmacists } from '../stores/fetchPharmacists';
import { useFetchPatients } from '../stores/fetchPatients';
import { useFetchBloods } from '../stores/fetchBloodsBank';
import { useFetchBloodDonors } from '../stores/fetchBloodDonors';
import { useFetchOperationReports } from '../stores/fetchOperationReports';
import { useFetchBirthReports } from '../stores/fetchBirthReports';
import { useFetchDeathReports } from '../stores/fetchDeathReports';
import { useFetchMedicines } from '../stores/fetchMedicines';
import { useFetchVaccines } from '../stores/fetchVaccines';
import { useFetchServices } from '../stores/fetchServices';
import { useFetchOffers } from '../stores/fetchOffers';
import { useFetchOurOffers } from '../stores/fetchOurOffers';
import { useFetchOrders } from '../stores/fetchOrders';
import { useGetUserId } from '../stores/getUserId';
import { useFetchUserRole } from '../stores/fetchUserRole';
import { useDoctorSchedules } from '../stores/doctorSchedules';
import { useAppointmentsReservasion } from '../stores/appointmentsReservasion';
import { useFetchAppointments } from '../stores/fetchAppointments';
import { useFetchDoctorAppointments } from '../stores/fetchDoctorAppointments';
import { useCalendarEvents } from '../stores/CalendarEvents';
import { useDoctorDashboard } from '../stores/doctorDashboard';
import { useAdminDashboard } from '../stores/adminDashboard';
import { usePatientDashboard } from '../stores/patientDashboard';
import { useFetchPatientAppointments } from '../stores/fetchPatientAppointments';
import { useFetchPatientOrders } from '../stores/fetchPatientOrders';




const userGuest = (to, from, next) => {
    const auth = useCheckAuth()
    if (auth.isUserAuth) {
        return next('/')
    }
    else {
        next()
    }
}


// const isUserAuth = (to, from, next) => {
//     const auth = useCheckAuth()
//     if (auth.isUserAuth) {
//         next()
//     }
//     else{
//         return next('/')
//     }
// }



let role = ''
const fetchUserRole = async () => {
    await axios.get('/fetch-user-role').then((res)=>{
        if (res.data.data) {
            return role = res.data.data.role
        }
        return null
    })
}

const isUserAdmin = async (to, from, next) => {
    if (role === 'admin') {
        return next()
    }
    return next('/')
}

const isUserDoctor = async (to, from, next) => {
    if (role === 'doctor') {
        return next()
    }
    return next('/')
}

const isUserNurse = async (to, from, next) => {
    if (role === 'nurse') {
        return next()
    }
    return next('/')
}

const isUserPharmacist = async (to, from, next) => {
    if (role === 'pharmacist') {
        return next()
    }
    return next('/')
}

const isUserPatient = async (to, from, next) => {
    if (role === 'patient') {
        return next()
    }
    return next('/')
}

const isUserHaveAccessToDashboard = async (to, from, next) => {
    if (role === 'admin' || role === 'doctor' || role === 'nurse' || role === 'pharmacist' 
        || role === 'laboratorist' || role === 'patient'
    ) {
        return next()
    }
    return next('/')
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: () => import('/src/views/Home.vue'),
            meta: { requiresAuth: true, requiresHeaderPhoto: '', title: 'Klinik- Home' },

        },
        {
            path: '/login',
            component: () => import('/src/views/Login.vue'),
            beforeEnter: userGuest,
            meta: { title: 'Klinik - Login' }

        },
        {
            path: '/signup',
            component: () => import('/src/views/Signup.vue'),
            beforeEnter: userGuest,
            meta: { title: 'Klinik - Signup' }

        },
        {
            path: '/reserve-appointment',
            component: () => import('../views/ReserveAppointment.vue'),
            meta: { title: 'Klinik - Reserve Appointment' }

        },
        {
            path: '/forgot-password',
            component: () => import('../views/ForgetPassword.vue'),
            beforeEnter: userGuest,
            meta: { title: 'Klinik - Forget Password' }

        },
        {
            path: '/password-reset/:token',
            component: () => import('../views/ResetPassword.vue'),
            beforeEnter: userGuest,
            meta: { title: 'Klinik - Reset Password' }

        },
        {
            path: '/profile',
            component: () => import('../views/Profile.vue'),
            meta: {
                requiresName: '',
                requiresEmail: '',
                requiresPhoto: '',
                requiresIsAdmin: '',
                requiresIsDoctor: '',
                requiresIsNurse: '',
                requiresIsPharmacist: '',
                requiresIsLaboratorist: '',
                title: 'Klinik - Profile',
            },
        },
        // {
        //     path: '/dashboard',
        //     component: () => import('../views/dashboard/Dashboard.vue'),
        //     beforeEnter: isUserHaveAccessToDashboard,
        //     meta: {
        //         requiresName: '',
        //         requiresPhoto: '',
        //         requiresIsAdmin: '',
        //         requiresIsDoctor: '',
        //         requiresIsNurse: '',
        //         requiresIsPharmacist: '',
        //         requiresIsLaboratorist: '',
        //     }
        // },
        {
            path: '/users',
            component: () => import('../views/dashboard/AllUsers.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: {
                requiresCountAllUsers: '',
                requiresCountAdmins: '',
                requiresCountDoctors: '',
                requiresCountNurses: '',
                requiresCountPharmacists: '',
                requiresCountLaboratorists: '',
                requiresCountPatients: '',
                title: 'Klinik - AllUsers',
            },
        },
        {
            path: '/departments',
            component: () => import('../views/dashboard/Departments.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - Departments' }

        },
        {
            path: '/doctors',
            component: () => import('../views/dashboard/Doctors.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - Doctors' }

        },
        {
            path: '/nurses',
            component: () => import('../views/dashboard/Nurses.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - Nurses' }

        },
        {
            path: '/laboratorists',
            component: () => import('../views/dashboard/Laboratorists.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - Laboratorists' }

        },
        {
            path: '/pharmacists',
            component: () => import('../views/dashboard/Pharmacists.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - Pharmacists' }

        },
        {
            path: '/patients',
            component: () => import('../views/dashboard/Patients.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - Patients' }

        },
        {
            path: '/blood-bank',
            component: () => import('../views/dashboard/BloodBank.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - BloodBank' }

        },
        {
            path: '/blood-donors',
            component: () => import('../views/dashboard/BloodDonors.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - BloodDonors' }

        },
        {
            path: '/operation-reports',
            component: () => import('../views/dashboard/OperationReports.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - OperationReports' }

        },
        {
            path: '/birth-reports',
            component: () => import('../views/dashboard/BirthReports.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - BirthReports' }

        },
        {
            path: '/death-reports',
            component: () => import('../views/dashboard/DeathReports.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - DeathReports' }

        },
        {
            path: '/bed-allotments',
            component: () => import('../views/dashboard/BedAllotments.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - BedAllotments' }

        },
        {
            path: '/medicines',
            component: () => import('../views/dashboard/Medicines.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - Medicines' }

        },
        {
            path: '/vaccines',
            component: () => import('../views/dashboard/Vaccines.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - Vaccines' }

        },
        {
            path: '/services',
            component: () => import('../views/dashboard/Services.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - Services' }

        },
        {
            path: '/offers',
            component: () => import('../views/dashboard/Offers.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - Offers' }

        },
        {
            path: '/our-offers',
            component: () => import('../views/OurOffers.vue'),
            meta: { title: 'Klinik - OurOffers' }

        },
        {
            path: '/checkout/success',
            name: 'CheckoutSuccess',
            component: () => import('../views/CheckoutOrderSuccess.vue'),
            props: (route) => ({ sessionId: route.query.session_id }),
            meta: { title: 'Klinik - Checkout Order Success' }

        },
        {
            path: '/checkout/cancel',
            component: () => import('../views/CheckoutOrderCancel.vue'),
            meta: { title: 'Klinik - Checkout Order Cancel' }

        },
        {
            path: '/orders',
            component: () => import('../views/dashboard/Orders.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - Orders' }

        },
        {
            path: '/doctor-schedules',
            component: () => import('../views/dashboard/doctor/Schedules.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserDoctor],
            meta: { title: 'Klinik - Schedules' }

        },
        {
            path: '/appointment-checkout/success',
            component: () => import('../views/CheckoutAppointmentSuccess.vue'),
            props: (route) => ({ sessionId: route.query.session_id }),
            meta: { title: 'Klinik - Checkout Appointment Success' }

        },
        {
            path: '/appointment-checkout/cancel',
            component: () => import('../views/CheckoutAppointmentCancel.vue'),
            meta: { title: 'Klinik - Checkout Appointment Cancel' }

        },
        {
            path: '/appointments',
            component: () => import('../views/dashboard/Appointments.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - Appointments' }

        },
        {
            path: '/doctor-appointments',
            component: () => import('../views/dashboard/doctor/Appointments.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserDoctor],
            meta: { title: 'Klinik - Appointments' }

        },
        {
            path: '/doctor-calendar',
            component: () => import('../views/dashboard/doctor/Calendar.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserDoctor],
            meta: { title: 'Klinik - Calendar' }

        },
        {
            path: '/doctor-doctors',
            component: () => import('../views/dashboard/doctor/Doctors.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserDoctor],
            meta: { title: 'Klinik - Doctors' }

        },
        {
            path: '/doctor-patients',
            component: () => import('../views/dashboard/doctor/Patients.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserDoctor],
            meta: { title: 'Klinik - Patients' }

        },
        {
            path: '/doctor-bed-allotments',
            component: () => import('../views/dashboard/doctor/BedAllotments.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserDoctor],
            meta: { title: 'Klinik - BedAllotments' }

        },
        {
            path: '/doctor-dashboard',
            component: () => import('../views/dashboard/doctor/Dashboard.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserDoctor],
            meta: { title: 'Klinik - Dashboard' }

        },
        {
            path: '/admin-dashboard',
            component: () => import('../views/dashboard/Dashboard.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserAdmin],
            meta: { title: 'Klinik - Dashboard' }

        },
        {
            path: '/nurse-dashboard',
            component: () => import('../views/dashboard/nurse/Dashboard.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserNurse],
            meta: { title: 'Klinik - Dashboard' }

        },
        {
            path: '/nurse-blood-bank',
            component: () => import('../views/dashboard/nurse/BloodBanks.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserNurse],
            meta: { title: 'Klinik - BloodBanks' }

        },
        {
            path: '/nurse-blood-donors',
            component: () => import('../views/dashboard/nurse/BloodDonors.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserNurse],
            meta: { title: 'Klinik - BloodDonors' }

        },
        {
            path: '/nurse-operation-reports',
            component: () => import('../views/dashboard/nurse/OperationReports.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserNurse],
            meta: { title: 'Klinik - OperationReports' }

        },
        {
            path: '/nurse-birth-reports',
            component: () => import('../views/dashboard/nurse/BirthReports.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserNurse],
            meta: { title: 'Klinik - BirthReports' }

        },
        {
            path: '/nurse-death-reports',
            component: () => import('../views/dashboard/nurse/DeathReports.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserNurse],
            meta: { title: 'Klinik - DeathReports' }

        },
        {
            path: '/nurse-bed-allotments',
            component: () => import('../views/dashboard/nurse/BedAllotments.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserNurse],
            meta: { title: 'Klinik - BedAllotments' }

        },
        {
            path: '/nurse-medicines',
            component: () => import('../views/dashboard/nurse/Medicines.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserNurse],
            meta: { title: 'Klinik - Medicines' }

        },
        {
            path: '/nurse-vaccines',
            component: () => import('../views/dashboard/nurse/Vaccines.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserNurse],
            meta: { title: 'Klinik - Vaccines' }

        },
        {
            path: '/pharmacist-dashboard',
            component: () => import('../views/dashboard/Pharmacist/Dashboard.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserPharmacist],
            meta: { title: 'Klinik - Dashboard' }

        },
        {
            path: '/pharmacist-medicines',
            component: () => import('../views/dashboard/Pharmacist/Medicines.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserPharmacist],
            meta: { title: 'Klinik - Medicines' }
        },
        {
            path: '/patient-dashboard',
            component: () => import('../views/dashboard/Patient/Dashboard.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserPatient],
            meta: { title: 'Klinik - Dashboard' }
        },
        {
            path: '/patient-appointments',
            component: () => import('../views/dashboard/Patient/Appointments.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserPatient],
            meta: { title: 'Klinik - Appointments' }
        },
        {
            path: '/patient-orders',
            component: () => import('../views/dashboard/Patient/Orders.vue'),
            beforeEnter: [isUserHaveAccessToDashboard, isUserPatient],
            meta: { title: 'Klinik - Orders' }
        },
        {
            path: '/about',
            component: () => import('../views/About.vue'),
            meta: { title: 'Klinik - About' }
        },
    ],
});

router.beforeEach(async (to, from, next) => {

    document.title = to.meta.title || 'Klinik'; 

    await fetchUserRole()
    const userRole = useFetchUserRole()
    userRole.userRole = role

    const toggleNavBar = useNavBarToggle();
    toggleNavBar.isNavOpen = false;

    const checkUserIfAuth = useCheckAuth();
    await checkUserIfAuth.checkIfUserAuth();

    const isAuth = checkUserIfAuth.isUserAuth;
    to.meta.isAuth = isAuth;

    const userData = useGetUserData();
    try {
        const photo = await userData.getPhoto();
        to.meta.requiresHeaderPhoto = photo;
    } catch (error) {
        console.error('Error fetching user photo:', error);
        to.meta.requiresHeaderPhoto = null;
    }

    const routesThatRequiresAuth = ['/profile', '/dashboard', '/users'];
    if (routesThatRequiresAuth.includes(to.path) && !isAuth) {
        return next('/login');
    }

    if (to.fullPath === "/profile" || to.fullPath === "/dashboard" || to.fullPath === "/users") {
        await userData.getData()
        to.meta.requiresName = userData.name
        to.meta.requiresEmail = userData.email
        to.meta.requiresPhoto = userData.photo
        to.meta.requiresWebsite = userData.website
        to.meta.requiresFacebook = userData.facebook
        to.meta.requiresInstagram = userData.instagram
        to.meta.requiresTwitter = userData.twitter
        to.meta.requiresIsAdmin = userData.isAdmin
        to.meta.requiresIsDoctor = userData.isDoctor
        to.meta.requiresIsNurse = userData.isNurse
        to.meta.requiresIsPharmacist = userData.isPharmacist
        to.meta.requiresIsLaboratorist = userData.isLaboratorist
        console.log(userData.isAdmin)
    }
    if (to.fullPath === '/doctor-calendar') {
        const calendarEvents = useCalendarEvents()
        await calendarEvents.fetchEvents()
    }
    if (to.fullPath === '/doctor-dashboard') {
        const doctorDashboard = useDoctorDashboard()
        await doctorDashboard.getDoctorAppointments()
        await doctorDashboard.getDoctorUpcomingAppointments()
    }
    if (to.fullPath === '/admin-dashboard') {
        const adminDashboard = useAdminDashboard()
        await adminDashboard.getDoctorsAppointments()
    }
    if (to.fullPath === '/patient-dashboard') {
        const patientDashboard = usePatientDashboard()
        await patientDashboard.getPatientDashboardData()
    }
    next()
})
router.afterEach(async (to, from) => {
    

    if (to.fullPath === '/users') {
        const allUsers = useFetchUsers()
        await allUsers.fetchUsers()
        await allUsers.fetchUsersCount()
    }
    if (to.fullPath === '/doctors') {
        const allDoctors = useFetchDoctors()
        await allDoctors.fetchDepartments()
        await allDoctors.fetchDoctors()
    }
    if (to.fullPath === '/nurses') {
        const allNurses = useFetchNurses()
        await allNurses.fetchNurses()
    }
    if (to.fullPath === '/laboratorists') {
        const allLaboratorists = useFetchLaboratorists()
        await allLaboratorists.fetchLaboratorists()
    }
    if (to.fullPath === '/pharmacists') {
        const allPharmacists = useFetchPharmacists()
        await allPharmacists.fetchPharmacists()
    }
    if (to.fullPath === '/patients') {
        const allPatients = useFetchPatients()
        await allPatients.fetchPatients()
    }
    if (to.fullPath === '/blood-bank') {
        const allBloods = useFetchBloods()
        await allBloods.fetchBloods()
    }
    if (to.fullPath === '/blood-donors') {
        const allBloodDonors = useFetchBloodDonors()
        await allBloodDonors.fetchBloodDonors()
    }
    if (to.fullPath === '/operation-reports') {
        const allOperationReports = useFetchOperationReports()
        await allOperationReports.fetchDepartments()
        await allOperationReports.fetchOperationReports()
    }
    if (to.fullPath === '/birth-reports') {
        const allBirthReports = useFetchBirthReports()
        await allBirthReports.fetchBirthReports()
    }
    if (to.fullPath === '/death-reports') {
        const allDeathReports = useFetchDeathReports()
        await allDeathReports.fetchDeathReports()
    }
    if (to.fullPath === '/medicines') {
        const allMedicines = useFetchMedicines()
        await allMedicines.fetchMedicines()
    }
    if (to.fullPath === '/vaccines') {
        const allVaccines = useFetchVaccines()
        await allVaccines.fetchVaccines()
    }
    if (to.fullPath === '/services') {
        const allServices = useFetchServices()
        await allServices.fetchServices()
    }
    if (to.fullPath === '/offers') {
        const allOffers = useFetchOffers()
        await allOffers.fetchServices()
        await allOffers.fetchOffers()
    }
    if (to.fullPath === '/our-offers') {
        const allOurOffers = useFetchOurOffers()
        await allOurOffers.fetchOffers()
    }
    if (to.fullPath === '/orders') {
        const allOrders = useFetchOrders()
        await allOrders.fetchOrders()
        await allOrders.fetchOrdersCount()
    }
    if (to.fullPath === '/doctor-schedules') {
        const doctorSchedules = useDoctorSchedules()
        await doctorSchedules.fetchTimes()
        await doctorSchedules.fetchAvailability()
    }
    if (to.fullPath === '/') {
        const appointmentsReservasion = useAppointmentsReservasion()
        await appointmentsReservasion.fetchDepartments()
    }
    if (to.fullPath === '/appointments') {
        const allAppointments = useFetchAppointments()
        await allAppointments.fetchAppointments()
        await allAppointments.fetchAppointmentsCount()
    }
    if (to.fullPath === '/doctor-appointments') {
        const allDoctorAppointments = useFetchDoctorAppointments()
        await allDoctorAppointments.fetchDoctorAppointments()
        await allDoctorAppointments.fetchDoctorAppointmentsCount()
    }
    if (to.fullPath === '/doctor-doctors') {
        const allDoctors = useFetchDoctors()
        await allDoctors.fetchDepartments()
        await allDoctors.fetchDoctors()
    }
    if (to.fullPath === '/doctor-patients') {
        const allPatients = useFetchPatients()
        await allPatients.fetchPatients()
    }
    if (to.fullPath === '/nurse-blood-bank') {
        const allBloods = useFetchBloods()
        await allBloods.fetchBloods()
    }
    if (to.fullPath === '/nurse-blood-donors') {
        const allBloodDonors = useFetchBloodDonors()
        await allBloodDonors.fetchBloodDonors()
    }
    if (to.fullPath === '/nurse-birth-reports') {
        const allBirthReports = useFetchBirthReports()
        await allBirthReports.fetchBirthReports()
    }
    if (to.fullPath === '/nurse-death-reports') {
        const allDeathReports = useFetchDeathReports()
        await allDeathReports.fetchDeathReports()
    }
    if (to.fullPath === '/nurse-medicines') {
        const allMedicines = useFetchMedicines()
        await allMedicines.fetchMedicines()
    }
    if (to.fullPath === '/nurse-vaccines') {
        const allVaccines = useFetchVaccines()
        await allVaccines.fetchVaccines()
    }
    if (to.fullPath === '/pharmacist-medicines') {
        const allMedicines = useFetchMedicines()
        await allMedicines.fetchMedicines()
    }
    if (to.fullPath === '/patient-appointments') {
        const allPatientAppointments = useFetchPatientAppointments()
        await allPatientAppointments.fetchPatientAppointments()
        await allPatientAppointments.fetchPatientAppointmentsCount()
    }
    if (to.fullPath === '/patient-orders') {
        const allPatientOrders = useFetchPatientOrders()
        await allPatientOrders.fetchPatientOrders()
        await allPatientOrders.fetchPatientOrdersCount()
    }
});



export default router;
