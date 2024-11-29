<script setup>
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' }); // Smooth scrolling
    }
}
</script>


<template>
    <div class="flex justify-center dark:bg-darkmodebg">
        <div v-motion-slide-visible-top
            class="w-[60%] max-[1536px]:w-[90%] bg-bgcolor dark:bg-primarycardsbg mt-36 p-10 flex max-[1024px]:flex-col max-[1024px]:text-center">
            <div
                class="w-[40%] flex flex-col justify-center max-[1024px]:-order-1 max-[1024px]:w-full  max-[1024px]:items-center">
                <h3 class="font-recursive text-[#A1A7B0] tracking-widest">Book Your Appointment</h3>
                <h1 class="font-recursive font-bold text-6xl max-[1024px]:text-2xl dark:text-white text-[#333333] mt-7">
                    Take Your First Step</h1>
                <button @click="scrollToSection('bookNow-section')"
                    class="bg-[#478CF7] rounded text-white font-recursive font-bold w-32 h-10 mt-10">Book Now</button>
            </div>
            <div class="w-[60%] max-[1024px]:mt-20 max-[1024px]:w-full">
                <img src="/src/assets/images/reserve-image.jpg" alt="">
            </div>
        </div>
    </div>
</template>