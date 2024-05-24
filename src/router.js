import { createRouter, createWebHistory } from 'vue-router';

import ExcelForm from './components/ExcelForm.vue';
import GridTimeline from './components/GridTimeline.vue';
import GridList from './components/GridList.vue';

const routes = [
  { path: '/excel', component: ExcelForm },
  { path: '/', component: GridList },
  { path: '/timeline', component: GridTimeline }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});
export default router;
