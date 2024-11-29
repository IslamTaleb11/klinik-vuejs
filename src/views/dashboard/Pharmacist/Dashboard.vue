<script setup>
import SideBar from '../../../components/dashboard/SideBar.vue';
import Header from '../../../components/dashboard/Header.vue';
import { ref, computed, onBeforeMount } from 'vue';
import axios from 'axios';

const medicineTypes = ref({
  antibiotic: 0,
  analgesic: 0,
  antipyretic: 0,
  antiseptic: 0,
  antiviral: 0,
  antifungal: 0,
  antihistamine: 0,
  antidepressant: 0,
  antidiabetic: 0,
  antimalarial: 0,
  antitussive: 0,
});

onBeforeMount(async () => {
    try {
        const res = await axios.get('/pharmacist-dashboard-data');
        medicineTypes.value = res.data.medicineTypes;
    } catch (err) {
        console.error(err);
    }
});

const stats = computed(() => [
    { title: 'Antibiotic', count: medicineTypes.value.antibiotic, icon: 'fa-solid fa-capsules', bgColor: 'bg-red-500' },
    { title: 'Analgesic', count: medicineTypes.value.analgesic, icon: 'fa-solid fa-capsules', bgColor: 'bg-blue-500' },
    { title: 'Antipyretic', count: medicineTypes.value.antipyretic, icon: 'fa-solid fa-capsules', bgColor: 'bg-green-500' },
    { title: 'Antiseptic', count: medicineTypes.value.antiseptic, icon: 'fa-solid fa-capsules', bgColor: 'bg-purple-500' },
    { title: 'Antiviral', count: medicineTypes.value.antiviral, icon: 'fa-solid fa-capsules', bgColor: 'bg-gray-800' },
    { title: 'Antifungal', count: medicineTypes.value.antifungal, icon: 'fa-solid fa-capsules', bgColor: 'bg-yellow-500' },
    { title: 'Antihistamine', count: medicineTypes.value.antihistamine, icon: 'fa-solid fa-capsules', bgColor: 'bg-orange-500' },
    { title: 'Antidepressant', count: medicineTypes.value.antidepressant, icon: 'fa-solid fa-capsules', bgColor: 'bg-pink-500' },
    { title: 'Antidiabetic', count: medicineTypes.value.antidiabetic, icon: 'fa-solid fa-capsules', bgColor: 'bg-teal-500' },
    { title: 'Antimalarial', count: medicineTypes.value.antimalarial, icon: 'fa-solid fa-capsules', bgColor: 'bg-indigo-500' },
    { title: 'Antitussive', count: medicineTypes.value.antitussive, icon: 'fa-solid fa-capsules', bgColor: 'bg-cyan-500' },
]);
</script>



<template>
    <div class="bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen">
        <Toaster richColors position="top-right" />
        <SideBar />
        <div class="flex flex-col items-center w-full min-[1024px]:w-[75%]">
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