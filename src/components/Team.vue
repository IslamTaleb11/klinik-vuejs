<script setup>
</script>


<template>
<div class="flex justify-center dark:bg-darkmodebg bg-bgcolor">
    <div v-motion-slide-visible-top class="w-[60%] mt-20 mb-20 max-[1536px]:w-[90%] max-[1024px]:text-center max-[1024px]:flex max-[1024px]:items-center max-[1024px]:flex-col">
        <h3 class="font-recursive text-[#A1A7B0] tracking-widest">Meet Our Experts</h3>
        <h1 class="font-recursive dark:text-white font-bold text-6xl max-[1024px]:text-4xl text-[#333333] mt-7">Our Team</h1>
        <div class="flex gap-7 mt-14 max-[1024px]:flex-col max-[1024px]:w-[90%]">
            <div class="flex flex-col w-1/4 max-[1024px]:w-full">
                <div>
                    <img src="/src/assets/images/doctor1.jpg" alt="" class="rounded">
                </div>
                <div class="bg-white dark:bg-primarycardsbg shadow-lg p-5 flex flex-col flex-grow">
                    <h1 class="font-recursive dark:text-white font-bold text-3xl max-[1024px]:text-4xl text-[#333333] mt-7">James Smith</h1>
                    <h3 class="font-recursive text-[#A1A7B0] tracking-widest mt-5">Head Doctor</h3>
                </div>
            </div>

            <div class="flex flex-col w-1/4 max-[1024px]:w-full">
                <div>
                    <img src="/src/assets/images/doctor2.jpg" alt="" class="rounded">
                </div>
                <div class="bg-white dark:bg-primarycardsbg shadow-lg p-5 flex flex-col flex-grow">
                    <h1 class="font-recursive dark:text-white font-bold text-3xl max-[1024px]:text-4xl text-[#333333] mt-7">Daniel Lee</h1>
                    <h3 class="font-recursive text-[#A1A7B0] tracking-widest mt-5">Primary Care</h3>
                </div>
            </div>

            <div class="flex flex-col w-1/4 max-[1024px]:w-full">
                <div>
                    <img src="/src/assets/images/doctor4.jpg" alt="" class="rounded">
                </div>
                <div class="bg-white dark:bg-primarycardsbg shadow-lg p-5 flex flex-col flex-grow">
                    <h1 class="font-recursive dark:text-white font-bold text-3xl max-[1024px]:text-4xl text-[#333333] mt-7">William Miller</h1>
                    <h3 class="font-recursive text-[#A1A7B0] tracking-widest mt-5">Surgical Expert</h3>
                </div>
            </div>

            <div class="flex flex-col w-1/4 max-[1024px]:w-full">
                <div>
                    <img src="/src/assets/images/doctor6.jpg" alt="" class="rounded">
                </div>
                <div class="bg-white dark:bg-primarycardsbg shadow-lg p-5 flex flex-col flex-grow">
                    <h1 class="font-recursive dark:text-white font-bold text-3xl max-[1024px]:text-4xl text-[#333333] mt-7">Charles Wilson</h1>
                    <h3 class="font-recursive text-[#A1A7B0] tracking-widest mt-5">Diagnostic Specialist</h3>
                </div>
            </div>
        </div>

        <!-- Navigation buttons (commented out) -->
        <!-- 
        <div class="flex justify-center mt-10 gap-6">
            <div class="w-[45%] flex justify-end">
                <div id="next" class="rounded-full border cursor-pointer border-gray-300 h-10 w-10 flex justify-center items-center">
                    <span @click="toggleTeam" class="material-symbols-outlined text-[#478CF7]">
                        chevron_left
                    </span>
                </div>
            </div>
            <div id="prev" class="w-[45%] flex justify-start">
                <div class="rounded-full h-10 w-10 border cursor-pointer border-gray-300 flex justify-center items-center">
                    <span @click="toggleTeam" class="material-symbols-outlined text-[#478CF7]">
                        chevron_right
                    </span>
                </div>
            </div>
        </div>
        -->
    </div>
</div>









    <!-- <div class="flex items-center justify-center w-full h-full py-24 sm:py-8 px-4">
            <div class="w-full relative flex items-center justify-center">
                <button aria-label="slide backward" class="absolute z-30 left-0 ml-10 focus:outline-none focus:bg-gray-400 focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 cursor-pointer" id="prev">
                    <svg class="dark:text-gray-900" width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 1L1 7L7 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
                <div class="w-full h-full mx-auto overflow-x-hidden overflow-y-hidden">
                    <div id="slider" class="h-full flex lg:gap-8 md:gap-6 gap-14 items-center justify-start transition ease-out duration-700">
                        <div class="flex flex-shrink-0 relative w-full sm:w-auto">
                            <img src="https://i.ibb.co/fDngH9G/carosel-1.png" alt="black chair and white table" class="object-cover object-center w-full" />
                            <div class="bg-gray-800 bg-opacity-30 absolute w-full h-full p-6">
                                <h2 class="lg:text-xl leading-4 text-base lg:leading-5 text-white dark:text-gray-900">Catalog 1</h2>
                                <div class="flex h-full items-end pb-6">
                                    <h3 class="text-xl lg:text-2xl font-semibold leading-5 lg:leading-6 text-white dark:text-gray-900">Minimal Interior</h3>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-shrink-0 relative w-full sm:w-auto">
                            <img src="https://i.ibb.co/DWrGxX6/carosel-2.png" alt="sitting area" class="object-cover object-center w-full" />
                            <div class="bg-gray-800 bg-opacity-30 absolute w-full h-full p-6">
                                <h2 class="lg:text-xl leading-4 text-base lg:leading-5 text-white dark:text-gray-900">Catalog 2</h2>
                                <div class="flex h-full items-end pb-6">
                                    <h3 class="text-xl lg:text-2xl font-semibold leading-5 lg:leading-6 text-white dark:text-gray-900">Minimal Interior</h3>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-shrink-0 relative w-full sm:w-auto">
                            <img src="https://i.ibb.co/tCfVky2/carosel-3.png" alt="sitting area" class="object-cover object-center w-full" />
                            <div class="bg-gray-800 bg-opacity-30 absolute w-full h-full p-6">
                                <h2 class="lg:text-xl leading-4 text-base lg:leading-5 text-white dark:text-gray-900">Catalog 2</h2>
                                <div class="flex h-full items-end pb-6">
                                    <h3 class="text-xl lg:text-2xl font-semibold leading-5 lg:leading-6 text-white dark:text-gray-900">Minimal Interior</h3>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-shrink-0 relative w-full sm:w-auto">
                            <img src="https://i.ibb.co/rFsGfr5/carosel-4.png" alt="sitting area" class="object-cover object-center w-full" />
                            <div class="bg-gray-800 bg-opacity-30 absolute w-full h-full p-6">
                                <h2 class="lg:text-xl leading-4 text-base lg:leading-5 text-white dark:text-gray-900">Catalog 2</h2>
                                <div class="flex h-full items-end pb-6">
                                    <h3 class="text-xl lg:text-2xl font-semibold leading-5 lg:leading-6 text-white dark:text-gray-900">Minimal Interior</h3>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-shrink-0 relative w-full sm:w-auto">
                            <img src="https://i.ibb.co/fDngH9G/carosel-1.png" alt="black chair and white table" class="object-cover object-center w-full" />
                            <div class="bg-gray-800 bg-opacity-30 absolute w-full h-full p-6">
                                <h2 class="lg:text-xl leading-4 text-base lg:leading-5 text-white dark:text-gray-900">Catalog 2</h2>
                                <div class="flex h-full items-end pb-6">
                                    <h3 class="text-xl lg:text-2xl font-semibold leading-5 lg:leading-6 text-white dark:text-gray-900">Minimal Interior</h3>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-shrink-0 relative w-full sm:w-auto">
                            <img src="https://i.ibb.co/DWrGxX6/carosel-2.png" alt="sitting area" class="object-cover object-center w-full" />
                            <div class="bg-gray-800 bg-opacity-30 absolute w-full h-full p-6">
                                <h2 class="lg:text-xl leading-4 text-base lg:leading-5 text-white dark:text-gray-900">Catalog 2</h2>
                                <div class="flex h-full items-end pb-6">
                                    <h3 class="text-xl lg:text-2xl font-semibold leading-5 lg:leading-6 text-white dark:text-gray-900">Minimal Interior</h3>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-shrink-0 relative w-full sm:w-auto">
                            <img src="https://i.ibb.co/tCfVky2/carosel-3.png" alt="sitting area" class="object-cover object-center w-full" />
                            <div class="bg-gray-800 bg-opacity-30 absolute w-full h-full p-6">
                                <h2 class="lg:text-xl leading-4 text-base lg:leading-5 text-white dark:text-gray-900">Catalog 2</h2>
                                <div class="flex h-full items-end pb-6">
                                    <h3 class="text-xl lg:text-2xl font-semibold leading-5 lg:leading-6 text-white dark:text-gray-900">Minimal Interior</h3>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-shrink-0 relative w-full sm:w-auto">
                            <img src="https://i.ibb.co/rFsGfr5/carosel-4.png" alt="sitting area" class="object-cover object-center w-full" />
                            <div class="bg-gray-800 bg-opacity-30 absolute w-full h-full p-6">
                                <h2 class="lg:text-xl leading-4 text-base lg:leading-5 text-white dark:text-gray-900">Catalog 2</h2>
                                <div class="flex h-full items-end pb-6">
                                    <h3 class="text-xl lg:text-2xl font-semibold leading-5 lg:leading-6 text-white dark:text-gray-900">Minimal Interior</h3>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-shrink-0 relative w-full sm:w-auto">
                            <img src="https://i.ibb.co/fDngH9G/carosel-1.png" alt="black chair and white table" class="object-cover object-center w-full" />
                            <div class="bg-gray-800 bg-opacity-30 absolute w-full h-full p-6">
                                <h2 class="lg:text-xl leading-4 text-base lg:leading-5 text-white dark:text-gray-900">Catalog 2</h2>
                                <div class="flex h-full items-end pb-6">
                                    <h3 class="text-xl lg:text-2xl font-semibold leading-5 lg:leading-6 text-white dark:text-gray-900">Minimal Interior</h3>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-shrink-0 relative w-full sm:w-auto">
                            <img src="https://i.ibb.co/DWrGxX6/carosel-2.png" alt="sitting area" class="object-cover object-center w-full" />
                            <div class="bg-gray-800 bg-opacity-30 absolute w-full h-full p-6">
                                <h2 class="lg:text-xl leading-4 text-base lg:leading-5 text-white dark:text-gray-900">Catalog 2</h2>
                                <div class="flex h-full items-end pb-6">
                                    <h3 class="text-xl lg:text-2xl font-semibold leading-5 lg:leading-6 text-white dark:text-gray-900">Minimal Interior</h3>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-shrink-0 relative w-full sm:w-auto">
                            <img src="https://i.ibb.co/tCfVky2/carosel-3.png" alt="sitting area" class="object-cover object-center w-full" />
                            <div class="bg-gray-800 bg-opacity-30 absolute w-full h-full p-6">
                                <h2 class="lg:text-xl leading-4 text-base lg:leading-5 text-white dark:text-gray-900">Catalog 2</h2>
                                <div class="flex h-full items-end pb-6">
                                    <h3 class="text-xl lg:text-2xl font-semibold leading-5 lg:leading-6 text-white dark:text-gray-900">Minimal Interior</h3>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-shrink-0 relative w-full sm:w-auto">
                            <img src="https://i.ibb.co/rFsGfr5/carosel-4.png" alt="sitting area" class="object-cover object-center w-full" />
                            <div class="bg-gray-800 bg-opacity-30 absolute w-full h-full p-6">
                                <h2 class="lg:text-xl leading-4 text-base lg:leading-5 text-white dark:text-gray-900">Catalog 2</h2>
                                <div class="flex h-full items-end pb-6">
                                    <h3 class="text-xl lg:text-2xl font-semibold leading-5 lg:leading-6 text-white dark:text-gray-900">Minimal Interior</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button aria-label="slide forward" class="absolute z-30 right-0 mr-10 focus:outline-none focus:bg-gray-400 focus:ring-2 focus:ring-offset-2 focus:ring-gray-400" id="next">
                    <svg class="dark:text-gray-900" width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L7 7L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
            </div>
        </div> -->
</template>

<style>

</style>