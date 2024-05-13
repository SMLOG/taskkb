import { createRouter, createWebHistory } from 'vue-router';

import ExcelForm from './components/ExcelForm.vue';
import FixTimeline from './components/FixTableTimeline.vue';

const routes = [
  { path: '/', component: ExcelForm },
  { path: '/timeline', component: FixTimeline }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});
export default router;
