<script setup lang="ts">
import { onMounted, ref } from 'vue';


const openExternal = (url: string) => {

     console.log('openExternal', url);
     window.electronAPI.openExternal(url);
 }


 const luckyNumber = ref(-1);
 const menuCounter = ref(0);

onMounted(async () => {
    getLuckyNumber();
    
    
    window.electronAPI.onUpdateMenuCounter((value) => {
        menuCounter.value += value;
    });

});


const getLuckyNumber = async () => {
    const number = await window.electronAPI.getRandomNumber();
    luckyNumber.value = number;
}



</script>

<template>

    
    <RouterView></RouterView>

</template>