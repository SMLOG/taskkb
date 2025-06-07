import { createRouter,createWebHashHistory } from 'vue-router';

import TreeTimeline from './components/tree/TreeTimeline.vue';
import TabsContainer from './components/TabsContainer.vue';

const routes = [
  { path: '/', component: TreeTimeline },
];

const router = createRouter({
  history: createWebHashHistory('/'),
  routes
});
export default router;
