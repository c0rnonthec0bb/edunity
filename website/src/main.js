import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import ToastService from 'primevue/toastservice'

// Disable devtools
if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__.enabled = false
}

const app = createApp(App)
app.config.devtools = false
app.config.productionTip = false
app.use(ToastService)
app.use(PrimeVue, {
  // Default theme configuration
  theme: {
      preset: Aura,
      options: {
          prefix: 'p',
          darkModeSelector: 'system',
          cssLayer: false
      }
  }
});

// Add router before mounting
app.use(router)

// Mount the app
app.mount('#app')

// Debug log
console.log('App mounted with router:', router.currentRoute.value)
