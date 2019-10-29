import Vue from 'vue'
import App from './App'
import VueRouter from 'vue-router'
import routes from './router/index'
//灰常重要，知会 webpack 允许此模块的热更新
if (module.hot) {
    module.hot.accept();
}
const router = new VueRouter({
    // mode: 'history',
    routes
});

Vue.use(VueRouter);

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
