import axios from 'axios';
import { defineStore } from 'pinia';

export const useFetchBloods = defineStore({
    id: 'fetchBloods',
    state: () => ({
        data: null,
        currentPage: null,
        itemsPerPage: null,
        totalPages: null,
        page: 1,
        searchedBloods: null,
        searchQuery: null,
    }),

    actions: {
        async fetchBloods(page) {
            try {
                await axios.get('/fetch-bloods', {
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

        async fetchSearchedBloods(page, searchQuery) {
            try {
                await axios.get('/fetch-searched-bloods', {
                    params: { search_query: searchQuery, page: page },
                }).then((res) => {
                    this.totalBloods = res.data.total;
                    this.searchedBloods = res.data.data;
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
    }
});
