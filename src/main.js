import './assets/main.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import ColumnResizableDirective from './ColumnResizableDirective.js';
import router from './router';
import { useHashStore } from './stores/hashStore';

const pinia = createPinia();


const app = createApp(App);

app.use(ColumnResizableDirective);
app.use(pinia);
app.use(router);

useHashStore();

app.mount('#app');
