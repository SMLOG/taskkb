import { createRouter, createWebHistory,createWebHashHistory } from 'vue-router';

import GridTimeline from './components/GridTimeline.vue';
import GridList from './components/GridList.vue';
import Timeline from './components/Timeline.vue';
import TreeList from './components/treelist/index.vue';

const routes = [
  { path: '/', component: TreeList },
  { path: '/grid', component: GridList },
  { path: '/timeline', component: Timeline },
  { path: '/gtimeline', component: GridTimeline }
];

const router = createRouter({
  history: createWebHashHistory('/grid'),
  routes
});
export default router;
