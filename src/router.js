import { createRouter,createWebHashHistory } from 'vue-router';

import TreeTimeline from './components/tree/TreeTimeline.vue';
import TreeCards from './components/tree/TreeCards.vue';
import CalendarView from './CalendarView.vue';
import SourceCode from './components/tree/SourceCode.vue';
const routes = [
  { path: '/', component: TreeTimeline },
  { path: '/cards/:fileId/:tabId', component: TreeCards },
  { path: '/tree/:fileId/:tabId', component: TreeTimeline },
  { path: '/calendar/:fileId/:tabId', component: CalendarView },
  { path: '/code/:fileId/:tabId', component: SourceCode },
  { path: '/:pathMatch(.*)*', component: TreeTimeline },
];

const router = createRouter({
  history: createWebHashHistory('/'),
  routes
});
export default router;
