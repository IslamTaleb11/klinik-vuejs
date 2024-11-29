import { defineStore } from 'pinia';
import { ref, onMounted } from 'vue';
import { useBackendUrl } from './backendUrl';

const backend = useBackendUrl()
const backendUrl = backend.backendUrl
export const useAppointmentsNotificationsStore = defineStore('appointmentNotifications', () => {
    const notifications = ref([]);
    const notificationsIds = ref([]);
    let eventSource = null;




    const initializeEventSource = async () => {
        const token = localStorage.getItem('token');
        eventSource = new EventSource(`${backendUrl}/backend/api/v1/sse?token=${token}`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);

            data.appointmentsNotifications.forEach(notification => {
                if (!notificationsIds.value.includes(notification.id)) {
                    notificationsIds.value.push(notification.id);
                    notifications.value.push(notification);
                }
            });
        };


        // Optionally handle errors
        // eventSource.onerror = (error) => {
        //     console.error("EventSource failed:", error);
        // };
    };


    onMounted(() => {
        initializeEventSource();
    });

    return {
        notifications,
        initializeEventSource,
    };
});
