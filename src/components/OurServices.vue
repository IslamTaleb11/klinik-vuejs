<script setup>

</script>


<template>
    <div class="flex items-center flex-col">
        <div v-motion-slide-visible-top class="w-[60%] mt-20">
            <div class="w-full text-center flex flex-col justify-center ">
                <h3 class="font-recursive text-[#A1A7B0] tracking-widest">Innovative Services</h3>
                <h1 class="font-recursive font-bold text-5xl text-[#333333] dark:text-white mt-7 tracking-tight max-[1024px]:text-4xl">Our Services 
                </h1>
                <p class="mt-10 font-recursive text-[#333333] dark:text-gray-400 tracking-wide max-[1024px]:w-full">Setting new standards in healthcare.</p>
            </div>
        </div>
        <div v-motion-slide-visible-top class="w-[60%] max-[1024px]:gap-y-10 max-[1024px]:w-[80%] max-[1536px]:w-[90%] flex gap-10 mt-10 max-[1024px]:flex-col">
                <div class="w-full">
                    <div class="bg-bgcolor dark:bg-primarycardsbg h-64 shadow-xl flex flex-col items-center justify-center py-10">
                        <img src="/src/assets/images/card-image1.svg" alt="">
                    </div>
                    <div class="bg-white dark:bg-primarycardsbg shadow-xl max-[1024px]:text-center">
                        <h2 class="font-recursive text-[#333333] tracking-tight text-2xl px-10 py-5 font-bold dark:text-white">Efficiency</h2>
                        <p class="px-10 font-recursive text-gray-400 tracking-wide pb-4">Streamlined services for your convenience. </p>
                    </div>
                </div>
                
                <div class="w-full">
                    <div class="bg-bgcolor dark:bg-primarycardsbg h-64 shadow-xl flex flex-col items-center justify-center py-10">
                        <img src="/src/assets/images/card-image2.svg" alt="">
                    </div>
                    <div class="bg-white dark:bg-primarycardsbg shadow-xl max-[1024px]:text-center">
                        <h2 class="font-recursive text-[#333333] tracking-tight text-2xl px-10 py-5 font-bold dark:text-white">Innovation</h2>
                        <p class="px-10 font-recursive text-gray-400 tracking-wide pb-4">Leading the way in healthcare innovation.</p>
                    </div>
                </div>

                <div class="w-full">
                    <div class="bg-bgcolor dark:bg-primarycardsbg h-64 shadow-xl flex flex-col items-center justify-center py-10">
                        <img src="/src/assets/images/card-image3.svg" alt="">
                    </div>
                    <div class="bg-white dark:bg-primarycardsbg shadow-xl max-[1024px]:text-center">
                        <h2 class="font-recursive text-[#333333] tracking-tight text-2xl px-10 py-5 font-bold dark:text-white">Compassion</h2>
                        <p class="px-10 font-recursive text-gray-400 tracking-wide pb-4">Dedicated to compassionate patient care.</p>
                    </div>
                </div>
            

            
            
        </div>
    </div>
</template>