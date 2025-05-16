import { createRouter,createWebHashHistory } from 'vue-router';

import GridList from './components/GridList.vue';
import TreeTimeline from './components/tree/TreeTimeline.vue';
import Timeline from './components/Timeline.vue';
//import tree from './components/tree/grid.vue';

const routes = [
  { path: '/', component: TreeTimeline },
  { path: '/grid', component: GridList },
  { path: '/timeline', component: Timeline },
];

const router = createRouter({
  history: createWebHashHistory('/grid'),
  routes
});
export default router;
