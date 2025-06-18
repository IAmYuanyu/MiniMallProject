import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vant from 'vant'
import 'vant/lib/index.css'
import axios from 'axios'
import './mock' // 引入mock数据

import App from './App.vue'
import router from './router'

// 配置axios
axios.defaults.baseURL = '/api'
axios.defaults.timeout = 5000

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vant)
app.config.globalProperties.$axios = axios

app.mount('#app')
