import { ref } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';
import { useCheckAuth } from './checkAuth';

export const useLogout = defineStore({
    id: 'logout',
    state: () => ({

    }),
    getters: {

    },
    actions: {
        async logout() {
            const auth = useCheckAuth()
            try {
                await axios.post('/logout').then((response) => {
                    console.log(response.data)
                })
                localStorage.getItem('isUserAuth');
                localStorage.setItem('isUserAuth', false);
                auth.isUserAuth = false
            } catch (error) {
                console.error('Error fetching auth status:', error);
            }
        }
    }

});

