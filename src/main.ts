import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './samples/node-api'

new Vue({
  router,
  render: h => h(App)
})
  .$mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
