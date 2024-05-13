import './assets/main.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import ColumnResizableDirective from './ColumnResizableDirective.js';
import router from './router';

const pinia = createPinia();


const app = createApp(App);
app.use(ColumnResizableDirective);
app.use(pinia);
app.use(router);
app.mount('#app');
