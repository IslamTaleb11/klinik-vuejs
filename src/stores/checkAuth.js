import { ref } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';

export const useCheckAuth = defineStore({
    id: 'checkAuth',
    state: () => ({
        isUserAuth: false,
        photo: ''
    }),
    getters: {
        
    },
    actions: {
        async checkIfUserAuth() {
            
            // Check if cached auth status exists in localStorage
            const cachedAuth = localStorage.getItem('isUserAuth');
            if (cachedAuth !== null) {
                const cachedData = JSON.parse(cachedAuth);
                this.isUserAuth = cachedData
                return;
            }
            
            // If not cached, fetch from server
            try {
                const response = await axios.get('/check-user-auth');
                if (response.data) {
                    
                    this.isUserAuth = true;
                    localStorage.getItem('isUserAuth');
                    localStorage.setItem('isUserAuth', true);
                } else {
                    localStorage.getItem('isUserAuth');
                    localStorage.setItem('isUserAuth', false);
                    this.isUserAuth = false;
                }
                // Cache the auth status in localStorage
                localStorage.setItem('isUserAuth', this.isUserAuth);
            } catch (error) {
                 console.error('Error fetching auth status:', error);
            }
        }
    }

});

