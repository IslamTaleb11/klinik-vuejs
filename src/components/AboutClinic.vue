<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const counterForOne = ref(0)
const counterForTwo = ref(0)

let observer; 

const startCounting = () => {
  const counterOne = document.getElementById('counterOne')
  const counterTwo = document.getElementById('counterTwo')

  const updateCounterOne = setInterval(() => {
    counterForOne.value++;
    counterOne.textContent = `${counterForOne.value}%`
    if (counterForOne.value === 90) {
      clearInterval(updateCounterOne)
    }
  }, 10); 

  const updateCounterTwo = setInterval(() => {
    counterForTwo.value++;
    counterTwo.textContent = `${counterForTwo.value}+`
    if (counterForTwo.value === 20) {
      clearInterval(updateCounterTwo)
    }
  }, 100); 
};

onMounted(() => {
  const counterContainer = document.getElementById('counterContainer');
  
  if (counterContainer) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCounting()
          observer.unobserve(entry.target);
        }
      });
    });
    observer.observe(counterContainer)
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
});
</script>

<template>
  <div class="flex flex-col items-center dark:bg-darkmodebg bg-bgcolor">
    <div id="counterContainer" class="w-[60%] mt-20 max-[768px]:mt-[300px] max-[1024px]:mt-[150px] py-32 
    max-[1024px]:py-20 flex max-[1024px]:gap-[50px] gap-[150px] 
    max-[1024px]:flex-col max-[1024px]:w-full max-[1280px]:w-[80%] max-[1536px]:w-[90%] 
    max-[1024px]:text-center max-[1024px]:items-center max-[1024px]:justify-center">
      <div class="w-[45%] max-[1024px]:w-[80%]">
        <h1 class="font-recursive text-4xl font-bold max-[1024px]:text-2xl dark:text-white text-[#333333]">Our Impact</h1>
        <p class="font-recursive text-gray-400 tracking-wide mt-7 max-[1024px]:mt-4">Medicine is the field of health and healing. It includes nurses, doctors, and various specialists.</p>
      </div>
      <div class="w-[55%] flex items-center max-[1024px]:gap-12 gap-28 max-[1024px]:flex-col max-[1024px]:w-full">
        <div>
          <h1 id="counterOne" class="font-epilogue text-5xl font-bold text-[#333333] dark:text-white">0%</h1>
          <span class="font-recursive text-[20px] mt-7 text-[#333333] dark:text-gray-500">Patient Satisfaction</span>
          <p class="font-recursive text-gray-400 tracking-wide">Unmatched patient care</p>
        </div>
        <div>
          <h1 id="counterTwo" class="font-epilogue text-5xl font-bold text-[#333333] dark:text-white">0+</h1>
          <span class="font-recursive text-[20px] mt-7 text-[#333333] dark:text-gray-500">Expert Doctors</span>
          <p class="font-recursive text-gray-400 tracking-wide">Specialized in care</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any scoped styles here if needed */
</style>
