import axios from 'axios';
import { defineStore } from 'pinia';

export const useGetUserId = defineStore({
    id:'userId',
    state: () => ({
        userId: null,
    }),
});
