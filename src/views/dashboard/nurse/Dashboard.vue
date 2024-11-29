<script setup>
import SideBar from '../../../components/dashboard/SideBar.vue';
import Header from '../../../components/dashboard/Header.vue';
import { ref, computed, onBeforeMount } from 'vue';
import axios from 'axios';

const bloods = ref(0);
const bloodDonors = ref(0);
const operationReports = ref(0);
const birthReports = ref(0);
const deathReports = ref(0);
const bedAllotments = ref(0);
const medicines = ref(0);
const vaccines = ref(0);

onBeforeMount(async () => {
    try {
        const res = await axios.get('/nurse-dashboard-data');
        bloods.value = res.data.bloods;
        bloodDonors.value = res.data.bloodDonors;
        operationReports.value = res.data.operationReports;
        birthReports.value = res.data.birthReports;
        deathReports.value = res.data.deathReports;
        bedAllotments.value = res.data.bedAllotments;
        medicines.value = res.data.medicines;
        vaccines.value = res.data.vaccines;
    } catch (err) {
        console.error(err);
    }
});

const stats = computed(() => [
    { title: 'Bloods', count: bloods.value, icon: 'fa-solid fa-droplet', bgColor: 'bg-red-500' },
    { title: 'Blood Donations', count: bloodDonors.value, icon: 'fa-solid fa-hand-holding-droplet', bgColor: 'bg-blue-500' },
    { title: 'Operation Reports', count: operationReports.value, icon: 'fa-solid fa-bed-pulse', bgColor: 'bg-green-500' },
    { title: 'Birth Reports', count: birthReports.value, icon: 'fa-solid fa-person-pregnant', bgColor: 'bg-purple-500' },
    { title: 'Death Reports', count: deathReports.value, icon: 'fa-solid fa-skull-crossbones', bgColor: 'bg-gray-800' },
    { title: 'Bed Allotments', count: bedAllotments.value, icon: 'fa-solid fa-bed', bgColor: 'bg-yellow-500' },
    { title: 'Medicines', count: medicines.value, icon: 'fa-solid fa-capsules', bgColor: 'bg-orange-500' },
    { title: 'Vaccines', count: vaccines.value, icon: 'fa-solid fa-syringe', bgColor: 'bg-pink-500' },
]);
</script>


<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen">
        <Toaster richColors position="top-right" />
        <SideBar />
        <div class="flex flex-col items-center w-full min-[1025px]:w-[75%]">
            <Header />
            <div class="w-full max-w-7xl p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div v-for="stat in stats" :key="stat.title" :class="`p-6 rounded-lg shadow-lg ${stat.bgColor} text-white flex flex-col justify-between h-64`">
                    <i :class="`${stat.icon} text-4xl mb-4`"></i>
                    <div class="text-3xl font-bold">{{ stat.count }}</div>
                    <div class="text-lg font-jakarta">{{ stat.title }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
