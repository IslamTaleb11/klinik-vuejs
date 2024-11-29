<script setup>

</script>


<template>


<div class="flex justify-center flex-col items-center">
    <div v-motion-slide-visible-top class="w-[60%] mt-20 max-[1536px]:w-[90%] max-[1024px]:text-center">
        <h3 class="font-recursive text-[#A1A7B0] tracking-widest">Hear From Our Patients </h3>
        <h1 class="font-recursive font-bold text-6xl max-[1024px]:text-4xl text-[#333333] mt-7 dark:text-white">Testimonials</h1>

        <div class="flex gap-10 max-[1024px]:flex-col max-[1024px]:items-center">
            <div class="bg-white dark:bg-primarycardsbg shadow-lg w-1/3 max-[1024px]:w-[90%] p-10 mt-10 flex flex-col justify-between gap-[120px]">
                <div>
                    <p class="font-recursive dark:text-gray-300 text-[#333333] tracking-widest font-bold text-xl">
                        Modern Health Clinic has transformed my life. Their commitment to quality care is unmatched in the industry.
                    </p>
                </div>
                <div class="flex max-[1024px]:justify-center items-center gap-6 mt-10">
                    <div class="h-20 w-20 rounded-full border border-gray-300 overflow-hidden">
                        <img src="/src/assets/images/testimonials-image1.jpg" alt="" class="h-full w-full object-cover">
                    </div>
                    <div>
                        <h2 class="font-recursive text-[#333333] text-xl dark:text-gray-400">Jessica Brown</h2>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-primarycardsbg shadow-lg w-1/3 max-[1024px]:w-[90%] p-10 mt-10 flex flex-col justify-between gap-[120px]">
                <div>
                    <p class="font-recursive dark:text-gray-300 text-[#333333] tracking-widest font-bold text-xl">
                        Thanks to the Modern Health Clinic, I finally feel heard and cared for. Exceptional service!
                    </p>
                </div>
                <div class="flex max-[1024px]:justify-center items-center gap-6 mt-10">
                    <div class="h-20 w-20 rounded-full border border-gray-300 overflow-hidden">
                        <img src="/src/assets/images/testimonials-image2.jpg" alt="" class="h-full w-full object-cover">
                    </div>
                    <div>
                        <h2 class="font-recursive text-[#333333] text-xl dark:text-gray-400">David Johnson</h2>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-primarycardsbg shadow-lg w-1/3 max-[1024px]:w-[90%] p-10 mt-10 flex flex-col justify-between gap-[120px]">
                <div>
                    <p class="font-recursive dark:text-gray-300 text-[#333333] tracking-widest font-bold text-xl">
                        The best decision I made was visiting Modern Health Clinic. Top-notch care!
                    </p>
                </div>
                <div class="flex max-[1024px]:justify-center items-center gap-6 mt-10">
                    <div class="h-20 w-20 rounded-full border border-gray-300 overflow-hidden">
                        <img src="/src/assets/images/testimonials-image3.jpg" alt="" class="h-full w-full object-cover">
                    </div>
                    <div>
                        <h2 class="font-recursive text-[#333333] text-xl dark:text-gray-400">Karen Thomas</h2>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

</template>