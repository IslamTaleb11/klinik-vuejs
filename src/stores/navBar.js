import { ref } from 'vue';
import { defineStore } from 'pinia';
export const useNavBarToggle = defineStore({
  id: 'toggle',
  state: () => ({ 
    isNavOpen: ref(false)
  }),

  actions: {
    toggleNav() {
        const nav = document.getElementById('mobile-nav')
        this.isNavOpen = !this.isNavOpen
        if (this.isNavOpen) {
          nav.classList.remove('hidden')
        }
        else {
          nav.classList.add('hidden')
        }
    }
}
  
});

