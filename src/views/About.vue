<script setup>
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
</script>

<template>
    <div class="overflow-x-hidden">
        <Toaster richColors position="top-right" />
        <div class="bg-bgcolor h-fit dark:bg-darkmodebg">
            <Header />
        </div>

        <section class="py-24 px-5 bg-bgcolor h-fit dark:bg-darkmodebg flex justify-center">
            <div class="max-w-2xl text-center">
                <h1 class="text-3xl font-bold mb-4 dark:text-gray-100">About Our Clinic</h1>
                <p class="text-lg mb-6 dark:text-gray-300">
                    Welcome to our clinic, where we prioritize your health and well-being. Our dedicated team of healthcare professionals is committed to providing high-quality medical services in a compassionate environment.
                </p>
                <p class="text-lg mb-6 dark:text-gray-300">
                    We offer a wide range of services, including general health check-ups, specialized treatments, and preventative care. Our state-of-the-art facilities and advanced medical technology ensure that you receive the best possible care.
                </p>
                <p class="text-lg dark:text-gray-300">
                    Thank you for choosing our clinic. We look forward to serving you and helping you achieve your health goals!
                </p>
            </div>
        </section>

        <Footer />
    </div>
</template>

<style>
/* Ensure the recursive font is applied */
body {
    font-family: 'Recursive', sans-serif; /* Adjust the font family to your needs */
}
</style>
