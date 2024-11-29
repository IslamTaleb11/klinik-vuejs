import axios from 'axios';
import { defineStore } from 'pinia';

export const useFetchOffers = defineStore({
    id: 'fetchOffers',
    state: () => ({
        data: null,
        currentPage: null,
        itemsPerPage: null,
        totalPages: null,
        page: 1,
        searchedOffers: null,
        searchQuery: null,
        services: null
    }),

    actions: {
        async fetchOffers(page) {
            try {
                await axios.get('/fetch-offers', {
                    params: { page }
                }).then((res) => {
                    this.currentPage = res.data.current_page;
                    this.itemsPerPage = res.data.per_page;
                    this.totalPages = res.data.last_page;
                    this.data = res.data.data;
                }).catch((err) => {
                    console.log(err);
                });
            } catch (error) {
                console.log(error);
            }
        },

        async fetchSearchedOffers(page, searchQuery) {
            try {
                await axios.get('/fetch-searched-offers', {
                    params: { search_query: searchQuery, page: page },
                }).then((res) => {
                    this.searchedOffers = res.data.data;
                    this.itemsPerPage = res.data.per_page;
                    this.currentPage = res.data.current_page;
                    this.totalPages = res.data.last_page;
                }).catch((err) => {
                    console.log(err);
                });
            } catch (error) {
                console.log(error);
            }
        },

        async fetchServices() {
            try {
                await axios.get('/fetch-services-in-offers').then((res) => {
                    this.services = res.data.services;
                }).catch((err) => {
                    console.log(err);
                });
            } catch (error) {
                console.log(error);
            }
        },
    }
});
