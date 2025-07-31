import { createRouter,createWebHashHistory } from 'vue-router';

import TreeTimeline from './components/view/TreeTimeline.vue';
import TreeCards from './components/view/TreeCards.vue';
import CalendarView from './components/view/CalendarView.vue';
import SourceCode from './components/view/SourceCode.vue';
import Plan from './components/view/Plan.vue';
const routes = [
  { path: '/', component: TreeTimeline },
  { path: '/plan/:fileId/:tabId', component: Plan },
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
