import { defineStore } from 'pinia';


export const useSideBar = defineStore({
    id: 'sideBar',
    state: () => ({
        showSideBar: true,
        isResourcesExpanded: false,
        isMonitorExpanded: false,
    }),

    actions: {
        toggleSideBar() {
            this.showSideBar = !this.showSideBar
        },

        async toggleResourcesExpan() {
            const arrow = document.getElementById('arrow')
            this.isResourcesExpanded = !this.isResourcesExpanded
            if (this.isResourcesExpanded) {
                arrow.innerHTML = 'keyboard_arrow_up'
                return
            }
            return arrow.innerHTML = 'keyboard_arrow_down'
        },

        toggleMonitorExpan() {
            const arrow = document.getElementById('monitor-arrow')
            this.isMonitorExpanded = !this.isMonitorExpanded
            if (this.isMonitorExpanded) {
                arrow.innerHTML = 'keyboard_arrow_up'
                return
            }
            return arrow.innerHTML = 'keyboard_arrow_down'
        }
    }

});

