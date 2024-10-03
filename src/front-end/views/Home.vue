<script setup lang="ts">

import ExampleCounter from '../components/ExampleCounter.vue';


import router from '../router';
import { onMounted } from 'vue';

onMounted(() => {
    // router.push('/testimonial');
    router.push('/wordcloud');
});

</script>

<template>
  <div>Hello World! From Home.vue</div>

  <ExampleCounter></ExampleCounter>
</template>

