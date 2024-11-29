import axios from 'axios';
import { defineStore } from 'pinia';

export const useFetchOurOffers = defineStore({
    id: 'fetchOffers',
    state: () => ({
        data: null,
    }),

    actions: {
        async fetchOffers() {
            try {
                await axios.get('/fetch-our-offers').then((res) => {
                    this.data = res.data.data;
                }).catch((err) => {
                    console.log(err);
                });
            } catch (error) {
                console.log(error);
            }
        },
    }
});
