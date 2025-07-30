<script setup>

</script>



<template>
    <div class="flex justify-center flex-col items-center dark:bg-darkmodebg bg-bgcolor">
        <div v-motion-slide-visible-top class="w-[60%] flex flex-col justify-center items-center text-center mt-[120px]">
            <h3 class="font-recursive text-[#A1A7B0] tracking-widest">Quality Care</h3>
            <h1 class="font-recursive dark:text-white font-bold text-6xl max-[1024px]:text-4xl text-[#333333] mt-7">
                Comprehensive Healthcare Solutions</h1>
        </div>


        <div v-motion-slide-visible-top class="w-[60%] gap-20 max-[1024px]:w-[80%] max-[1536px]:w-[90%] flex-wrap flex max-[1024px]:flex-col mt-10 gap-y-20 ">
            <div class="w-[45%] flex max-[1024px]:flex-col max-[1024px]:w-full">
                <div class="bg-bgcolor dark:bg-primarycardsbg h-64 shadow-xl w-96 max-[1024px]:w-full flex items-center justify-center py-10">
                    <img src="/src/assets/images/health-care-solutions-image1.svg" alt="">
                </div>
                <div class="bg-white flex flex-col justify-center dark:bg-primarycardsbg shadow-lg max-[1024px]:text-center">
                    <h2 class="font-recursive dark:text-white text-[#333333] w-1/2 max-[1024px]:w-full tracking-tight text-2xl px-10 py-5 font-bold">Primary Care 
                    </h2>
                    <p class="px-10 font-recursive text-gray-400 tracking-wide pb-4">Primary healthcare excellence</p>
                </div>
            </div>

            <div class="w-[45%] flex max-[1024px]:flex-col max-[1024px]:w-full">
                <div class="bg-bgcolor dark:bg-primarycardsbg h-64 shadow-xl w-96 max-[1024px]:w-full flex items-center justify-center py-10">
                    <img src="/src/assets/images/health-care-solutions-image2.svg" alt="">
                </div>
                <div class="bg-white flex dark:bg-primarycardsbg flex-col justify-center shadow-lg max-[1024px]:text-center">
                    <h2 class="font-recursive dark:text-white text-[#333333] w-1/2 max-[1024px]:w-full tracking-tight text-2xl px-10 py-5 font-bold">Diagnostics 
                    </h2>
                    <p class="px-10 font-recursive text-gray-400 tracking-wide pb-4">Advanced Diagnostic Services</p>
                </div>
            </div>

            <div class="w-[45%] flex max-[1024px]:flex-col max-[1024px]:w-full">
                <div class="bg-bgcolor dark:bg-primarycardsbg h-64 shadow-xl w-96 max-[1024px]:w-full flex items-center justify-center py-10">
                    <img src="/src/assets/images/health-care-solutions-image3.svg" alt="">
                </div>
                <div class="bg-white dark:bg-primarycardsbg flex flex-col justify-center shadow-lg max-[1024px]:text-center">
                    <h2 class="font-recursive dark:text-white text-[#333333] w-1/2 max-[1024px]:w-full tracking-tight text-2xl px-10 py-5 font-bold">Surgery 
                    </h2>
                    <p class="px-10 font-recursive text-gray-400 tracking-wide pb-4">Surgical expertise offered</p>
                </div>
            </div>

            <div class="w-[45%] flex max-[1024px]:flex-col max-[1024px]:w-full">
                <div class="bg-bgcolor dark:bg-primarycardsbg h-64 shadow-xl w-96 max-[1024px]:w-full flex items-center justify-center py-10">
                    <img src="/src/assets/images/health-care-solutions-image4.svg" alt="">
                </div>
                <div class="bg-white dark:bg-primarycardsbg flex flex-col justify-center shadow-lg max-[1024px]:text-center">
                    <h2 class="font-recursive dark:text-white text-[#333333] w-1/2 max-[1024px]:w-full tracking-tight text-2xl px-10 py-5 font-bold">Cosmetic Care 
                    </h2>
                    <p class="px-10 font-recursive text-gray-400 tracking-wide pb-4">Cutting-edge cosmetic treatments</p>
                </div>
            </div>




        </div>
    </div>
</template>