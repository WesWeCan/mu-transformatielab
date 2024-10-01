import { createRouter, createWebHashHistory } from "vue-router";

import Home from "../views/Home.vue";
import Testimonial from "../views/Testimonial.vue";
import Wordcloud from "../views/Wordcloud.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/testimonial",
    name: "testimonial",
    component: Testimonial,
  },
  {
    path: "/wordcloud",
    name: "wordcloud",
    component: Wordcloud,
  }

];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
