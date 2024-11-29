import { defineStore } from 'pinia';

export const useFetchUserRole = defineStore({
    id: 'FetchUserRole ',
    state: () => ({
        userRole: null,
    }),
});
