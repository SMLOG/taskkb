import { createRouter,createWebHashHistory } from 'vue-router';

import GridList from './components/GridList.vue';
import TreeTimeline from './components/treelist/TreeTimeline.vue';
import Timeline from './components/Timeline.vue';
import TreeList from './components/treelist/index.vue';

const routes = [
  { path: '/', component: TreeList },
  { path: '/grid', component: GridList },
  { path: '/timeline', component: Timeline },
  { path: '/tree', component: TreeTimeline }
];

const router = createRouter({
  history: createWebHashHistory('/grid'),
  routes
});
export default router;
