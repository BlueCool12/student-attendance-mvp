import { createRouter, createWebHashHistory } from 'vue-router';
import Dashboard from './views/Dashboard.vue';

const routes = [
    { path: '/', component: Dashboard },
];

const router = createRouter({
    history: createWebHashHistory(), // Use Hash Mode for Electron
    routes,
});

export default router;
