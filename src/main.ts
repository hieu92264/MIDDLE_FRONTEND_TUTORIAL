import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import 'vue-sonner/style.css'
import './style.css'
import { setupVueQuery } from '@/configs/vue-query.config.ts'
import { setupAxiosInterceptors } from '@/configs/axios.config'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

setupAxiosInterceptors(pinia)

app.config.errorHandler = (error) => {
  console.error('An error occurred:', error)
}

app.use(pinia)
app.use(router)
setupVueQuery(app)

app.mount('#app')
