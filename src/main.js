import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura';
import { createPinia } from 'pinia'
import router from './router'
import { MotionPlugin } from '@vueuse/motion'
import './axios'
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';

const pinia = createPinia()
createApp(App)
  .component('VueCal', VueCal)
  .use(pinia) 
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: Aura
    }
  })
  .use(MotionPlugin)
  .mount('#app')