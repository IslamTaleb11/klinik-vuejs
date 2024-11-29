<script setup>

</script>


<template>
    <div class="flex justify-center dark:bg-darkmodebg">
        <div v-motion-slide-visible-top class="w-[60%] mt-20 flex gap-20 max-[1024px]:flex-col max-[1536px]:w-[90%] max-[1024px]:text-center">
            <div class="w-1/2 max-[1024px]:w-full max-[1024px]:flex max-[1024px]:justify-center">
                <img src="/src/assets/images/map.svg" alt="">
            </div>
            <div class="w-1/2 max-[1024px]:w-full ">
                <h3 class="font-recursive text-[#A1A7B0] tracking-widest">Connect Now</h3>
                <h1 class="font-recursive font-bold text-6xl max-[1024px]:text-4xl text-[#333333] mt-7 dark:text-white">Get In Touch
                    Today</h1>
                <div class="flex mt-10 gap-5 max-[1024px]:flex-col max-[1024px]:items-center">
                    <div class="w-16 h-16 bg-bgcolor rounded-full text-primarycolor flex justify-center items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="m9 1.842l6.074 3.544L22 2.5v15.574l-7 4.084l-6.074-3.544L2 21.5V5.926l7-4.084Zm1 15.084l4 2.333V7.074l-4-2.333v12.185ZM8 4.74L4 7.074V18.5l4-1.667V4.741Zm8 2.426v12.092l4-2.333V5.5l-4 1.667Z" />
                        </svg>
                    </div>
                    <div>
                        <span class="font-recursive text-[#A1A7B0]">Address</span>
                        <h2 class="font-recursive text-[#333333] text-xl dark:text-gray-300">123 Wellness Ave, City</h2>
                    </div>
                </div>

                <div class="flex mt-10 gap-5 max-[1024px]:flex-col max-[1024px]:items-center">
                    <div class="w-16 h-16 bg-bgcolor rounded-full text-primarycolor flex justify-center items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"
                                d="M10.554 6.24L7.171 2.335c-.39-.45-1.105-.448-1.558.006L2.831 5.128c-.828.829-1.065 2.06-.586 3.047a29.207 29.207 0 0 0 13.561 13.58c.986.479 2.216.242 3.044-.587l2.808-2.813c.455-.455.456-1.174.002-1.564l-3.92-3.365c-.41-.352-1.047-.306-1.458.106l-1.364 1.366a.462.462 0 0 1-.553.088a14.557 14.557 0 0 1-5.36-5.367a.463.463 0 0 1 .088-.554l1.36-1.361c.412-.414.457-1.054.101-1.465Z" />
                        </svg>
                    </div>
                    <div>
                        <span class="font-recursive text-[#A1A7B0]">Phone</span>
                        <h2 class="font-recursive text-[#333333] text-xl dark:text-gray-300">123-456-7890</h2>
                    </div>
                </div>

                <div class="flex mt-10 gap-5 max-[1024px]:flex-col max-[1024px]:items-center">
                    <div class="w-16 h-16 bg-bgcolor rounded-full text-primarycolor flex justify-center items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 56 56">
                            <path fill="currentColor"
                                d="M9.484 54.848h37.032c4.898 0 7.36-2.438 7.36-7.266v-23.32c0-3.375-.704-4.875-2.93-6.633L32.851 3.379C31.14 2.019 29.734 1.152 28 1.152c-1.711 0-3.14.867-4.828 2.227L5.078 17.629c-2.226 1.758-2.953 3.258-2.953 6.633v23.32c0 4.852 2.484 7.266 7.36 7.266M32.922 32.37c-1.64-1.64-3.235-2.297-4.875-2.297c-1.664 0-3.235.656-4.875 2.297l-1.524 1.5L7.61 19.996l17.578-13.71c1.149-.891 1.805-1.384 2.813-1.384c1.031 0 1.664.492 2.812 1.383l17.626 13.758l-13.993 13.828ZM5.71 47.582V23.629c0-.235.023-.445.023-.633l13.453 13.29l-13.195 12.96c-.187-.469-.281-1.031-.281-1.664m44.578-23.953v23.953c0 .61-.07 1.148-.234 1.617L36.906 36.285l13.36-13.219c.023.165.023.352.023.563M9.367 51.262c-.164 0-.328 0-.492-.024L25.21 35.137c1.008-1.008 1.898-1.453 2.836-1.453c.937 0 1.828.445 2.836 1.453l16.335 16.101c-.187.024-.374.024-.562.024Z" />
                        </svg>
                    </div>
                    <div>
                        <span class="font-recursive text-[#A1A7B0]">Mail</span>
                        <h2 class="font-recursive text-[#333333] text-xl dark:text-gray-300">info@klinik.com</h2>
                    </div>
                </div>

            </div>
        </div>

    </div>
</template>