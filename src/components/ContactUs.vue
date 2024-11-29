<script setup>
</script>

<template>
    <div class="flex justify-center dark:bg-darkmodebg">
        <div v-motion-slide-visible-top class="w-[60%] max-[1024px]:w-[80%] max-[1536px]:w-[90%] bg-[#4A90E2] dark:bg-primarycardsbg text-center relative p-14 flex items-center flex-col mt-44">
            <img src="/src/assets/images/yellow-circle.svg" alt="" class="absolute bottom-0 right-40 max-[1280px]:hidden">
            <img src="/src/assets/images/blue-circle.svg" alt="" class="absolute top-0 left-44 max-[1280px]:hidden dark:opacity-0">
            <h3 class="font-recursive text-[#ffffff7f] tracking-widest z-10">Innovative Services</h3>
            <h1 class="font-recursive w-1/2 max-[1280px]:w-full font-bold text-5xl text-white mt-7 z-10 tracking-tight max-[1024px]:text-4xl">Curious About Our Services? Get in Touch! 
            </h1>
            <button class="bg-[#FAD149] font-recursive p-3 mt-10 rounded w-44 hover:brightness-95 hover:text-white font-bold">Contact Us</button>
        </div>
    </div>
</template>