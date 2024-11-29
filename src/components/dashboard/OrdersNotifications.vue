<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { useOrderNotificationsStore } from '../../stores/ordersNotifications.js';

let eventSource = null
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(date);
};

const notificationsStore = useOrderNotificationsStore();
const notificationsToShow = ref(5)
// const hasMoreNotifications = computed(() => {
//     const filteredNotifications = notificationsStore.notifications
//         .filter(not => not.read_at === null)
//         .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//         console.log(filteredNotifications.length > notificationsToShow.value)
//     return filteredNotifications.length > notificationsToShow.value;
// });

const notifications = computed(() => {
    const filteredNotifications = notificationsStore.notifications
        .filter(not => not.read_at === null)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return filteredNotifications.slice(0, notificationsToShow.value)
})

const loadMoreNotifications = () => {
    notificationsToShow.value += 5
};

const showLessNotifications = () => {
    if (notificationsToShow.value > 5) {
        notificationsToShow.value -= 5;
    }
};
onBeforeMount(() => {
    if (eventSource) {
        eventSource.close();
    }
});
const notificationsLength = computed(() => {
    return notificationsStore.notifications.filter(not => not.read_at === null).length
});
const readNotifications = () => {
    notifications.value.forEach(not => {
        not.read_at = new Date().toISOString(); // ISO format: "YYYY-MM-DDTHH:mm:ss.sssZ"
    });

}
</script>


<template>
    <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
            <div class="indicator">
                <span class="material-symbols-outlined dark:text-gray-200">
                    notifications_active
                </span>
                <span v-if="notificationsLength > 0"
                    class="badge badge-sm indicator-item text-white h-5 w-5 bg-red-600">{{
                        notificationsLength }}</span>
            </div>
        </div>
        <div tabindex="0" class="card card-compact dropdown-content bg-base-100 z-[1] mt-3 w-52 shadow">
            <div v-if="notificationsLength === 0" class="card-body z-10">
                <div class="font-jakarta text-center">
                    No notifications
                </div>
            </div>
            <div v-else class="max-h-64 overflow-y-auto"> <!-- Added max height and scrollable overflow -->
                <div v-for="notification in notifications" :key="notification.id" class="card-body z-10">
                    <div v-if="!notification.read_at">
                        <RouterLink to="/orders" @click="readNotifications">
                            <div class="font-jakarta">
                                <i class="fa-solid fa-bell"></i>
                                New Order! <br>{{ formatDate(notification.created_at) }}
                            </div>
                            <hr>
                        </RouterLink>
                    </div>
                </div>
                <div>
                    <button @click="loadMoreNotifications" class="w-full mt-2">
                        Show More
                    </button>
                </div>
                <div>
                    <button @click="showLessNotifications" class="w-full mt-2 mb-3">
                        Show Less
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>