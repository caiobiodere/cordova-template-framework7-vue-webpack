// Import Vue
import Vue from 'vue'

// Import Framework7
import Framework7 from 'framework7/dist/framework7.esm.bundle.js';

// Import Framework7 Vue
import Framework7Vue from 'framework7-vue/dist/framework7-vue.esm.bundle.js';

// Import F7 Style
import Framework7CSS from 'framework7/dist/css/framework7.css'

// Import F7 iOS Theme Styles
import Framework7Theme from 'framework7/dist/css/framework7.ios.min.css'

// Import Fontawesome Theme Styles
import FontAwesome from 'font-awesome/css/font-awesome.css'

// Import App Custom Styles
// import AppStyles from './assets/sass/main.scss'

// Import App Component
import app from './main.vue'

// Import Routes
import routes from './routes.js'

// Install Plugin
Vue.use(Framework7Vue, Framework7);

let theme = 'auto';
if (document.location.search.indexOf('theme=') >= 0) {
  theme = document.location.search.split('theme=')[1].split('&')[0];
}

// Init Vue App
export default new Vue({
  // Root Element
  el: '#app',
  render: c => c('app'),
  components: {
    app,
  },
  framework7: {
    id: 'io.framework7.testapp',
    theme, // md or ios
  },
  routes,
});