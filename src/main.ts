import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.directive('click-outside', {
    mounted: function (el, binding) {
        el.clickOutsideEvent = function (event: MouseEvent) {
            if (!(el == event.target || el.contains(event.target))) {
                binding.value(event);
            }
        };
        document.body.addEventListener('click', el.clickOutsideEvent)
    },
    beforeUnmount: function (el) {
        document.body.removeEventListener('click', el.clickOutsideEvent)
    },
});

app.mount('#app');