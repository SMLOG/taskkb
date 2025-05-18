import { createRouter,createWebHashHistory } from 'vue-router';

import TreeTimeline from './components/tree/TreeTimeline.vue';

const routes = [
  { path: '/', component: TreeTimeline },
];

const router = createRouter({
  history: createWebHashHistory('/'),
  routes
});
export default router;
