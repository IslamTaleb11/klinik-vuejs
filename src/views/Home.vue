<script setup>
import Header from '../components/Header.vue'
import Hero from '../components/Hero.vue'
import AboutClinic from '../components/AboutClinic.vue'
import OurServices from '../components/OurServices.vue'
import RevolutionaryCare from '../components/RevolutionaryCare.vue'
import QualityCare from '../components/QualityCare.vue'
import ContactUs from '../components/ContactUs.vue'
import Team from '../components/Team.vue'
import Testimonials from '../components/Testimonials.vue'
import Faqs from '../components/Faqs.vue'
import ConnectWithUs from '../components/ConnectWithUs.vue'
import ReserveAppointment from '../components/ReserveAppointment.vue'
import Footer from '../components/Footer.vue'
import Reservation from '../components/Reservation.vue'

</script>

<template>
  <div class="overflow-x-hidden">
    <div class="bg-bgcolor h-fit dark:bg-darkmodebg">
      <Header />
      <Hero />
      <Reservation />
    </div>

    <AboutClinic />

    <div class="bg-bgcolor h-fit dark:bg-darkmodebg">
      <OurServices />
      <RevolutionaryCare />
    </div>

    <QualityCare />
    <ContactUs />
    <Team />

    <div class="bg-bgcolor h-fit dark:bg-darkmodebg">
      <Testimonials />
      <Faqs />
    </div>

    <ConnectWithUs />
    <ReserveAppointment />
    <Footer />

  </div>

</template>

<style scoped></style>
