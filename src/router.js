import { createRouter, createWebHistory } from 'vue-router';

import GridTimeline from './components/GridTimeline.vue';
import Timeline from './components/Timeline.vue';
import GridList from './components/GridList.vue';

const routes = [
  { path: '/', component: GridList },
  { path: '/timeline', component: Timeline },
  { path: '/gtimeline', component: GridTimeline }
];

const router = createRouter({
  history: createWebHistory('/todo'),
  routes
});
export default router;
