<script setup>

</script>

<template>
    <div class="flex justify-center">
        <div v-motion-slide-visible-top class="w-[60%] mb-10 mt-[140px] max-[1536px]:w-[90%] flex gap-5 max-[1536px]:gap-10 max-[1024px]:flex-col  max-[1024px]:w-full max-[1024px]:items-center max-[1024px]:justify-center">
            <div class="w-1/2 max-[1024px]:text-center max-[1024px]:w-[80%]">
                <h3 class="font-recursive text-[#A1A7B0] tracking-widest">Revolutionary Care</h3>
                <h1
                    class="font-recursive dark:text-white w-1/2 font-bold text-6xl max-[1024px]:w-full text-[#333333] mt-7 max-[1024px]:text-4xl">
                    Leading Healthcare Transformation Journey</h1>
                <p class="mt-10 dark:text-gray-400 font-recursive w-[85%] text-xl text-[#333333] tracking-wide max-[1024px]:w-full">
                    Experience a new era of
                    healthcare defined by cutting-edge technology, compassion, and personalized attention at Modern
                    Health Clinic.
                </p>
                <button
                    class="border mt-10 max-[768px]:hidden border-gray-300 w-36 py-2 rounded text-primarycolor font-recursive font-semibold hover:bg-primarycolor hover:text-white">Learn
                    More</button>
            </div>

            <div class="w-1/2 max-[1024px]:w-[80%]">
                <img src="/src/assets/images/revolutionary-section-image.jpg" alt="">
            </div>
        </div>
    </div>
</template>