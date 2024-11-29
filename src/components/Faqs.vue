<script setup>

</script>


<template>
    <div class="flex justify-center">
        <div v-motion-slide-visible-top class="w-[60%] mt-20 mb-20 flex max-[1024px]:flex-col max-[1024px]:w-[80%] max-[1536px]:w-[90%]">
            <div class="flex flex-col w-1/2 max-[1024px]:w-full max-[1024px]:text-center">
                <h3 class="font-recursive text-[#A1A7B0] tracking-widest">Your Questions Answered</h3>
                <h1 class="font-recursive font-bold dark:text-white text-6xl max-[1024px]:text-4xl text-[#333333] mt-7">FAQs</h1>
                <p class="font-recursive dark:text-gray-400 w-[80%] max-[1024px]:w-full text-[#333333] tracking-widest text-xl mt-10">
                    We have compiled answers to some common questions to help you understand our services better.
                </p>
            </div>
            <div class="w-1/2 max-[1024px]:w-full">
                <div class="max-w-screen-xl mx-auto px-5 bg-white dark:bg-primarycardsbg min-h-sceen">
                    <div class="grid divide-y divide-neutral-200 max-w-xl mx-auto mt-8">
                        <div class="py-5">
                            <details class="group">
                                <summary class="flex justify-between items-center font-recursive dark:text-gray-300 font-bold cursor-pointer list-none">
                                    <span>What services do you offer?</span>
                                    <span class="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shape-rendering="geometricPrecision"
                                            stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="1.5" viewBox="0 0 24 24" width="24">
                                            <path d="M6 9l6 6 6-6"></path>
                                        </svg>
                                    </span>
                                </summary>
                                <p class="text-neutral-600 dark:text-gray-400 font-recursive mt-3 group-open:animate-fadeIn">
                                    We provide comprehensive healthcare services, from primary care to specialized treatments and diagnostics. 
                                </p>
                            </details>
                        </div>
                        <div class="py-5">
                            <details class="group">
                                <summary class="flex justify-between items-center dark:text-gray-300 font-recursive font-bold cursor-pointer list-none">
                                    <span> How can I make appointments?</span>
                                    <span class="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shape-rendering="geometricPrecision"
                                            stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="1.5" viewBox="0 0 24 24" width="24">
                                            <path d="M6 9l6 6 6-6"></path>
                                        </svg>
                                    </span>
                                </summary>
                                <p class="text-neutral-600 mt-3 dark:text-gray-400 group-open:animate-fadeIn font-recursive">
                                    You can conveniently schedule appointments through our website or by calling our clinic. 
                                </p>
                            </details>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>

</template>