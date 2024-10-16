<script setup lang="ts">
import { onMounted, ref } from 'vue';

import Recording from '../components/Recording.vue';

import Scanning from '../components/Scanning.vue';

// @ts-ignore
import MU_DTL_Zwart from '../assets/MU_DTL_Zwart.svg';

const language = ref<string>('eng');

const currentStep = ref<number>(0);

const currentUuid = ref<string>('<UNSET>');

onMounted(() => {
    document.body.id = 'testimonial';
});


const start = (lang: string) => {

    language.value = lang;


    currentStep.value = 1;
    currentUuid.value = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const cancelStep = () => {
    currentStep.value = 0;
    currentUuid.value = '<UNSET>';
}

const continueToRecording = () => {
    currentStep.value = 2;
}

const finish = () => {
    currentStep.value = 3;

    setTimeout(() => {
        currentStep.value = 0;
        currentUuid.value = '<UNSET>';

        window.electronAPI.updateCloud();
    }, 5000);
}

</script>

<template>

    <!-- <pre>{{ currentStep }} -- {{ currentUuid }}</pre> -->

  

    <div class="intro" v-if="currentStep === 0">


        <img :src="MU_DTL_Zwart" alt="MU DTL Zwart" class="mudtlzwart">

        <h1>Kies je taal /<br/> Choose your language</h1>
        <br/>
        <div class="buttons">
        <button @click="start('dut')">Dutch</button>
        <button @click="start('eng')">English</button>
        </div>
        
    </div>

    <template v-if="currentStep === 1">
        <Scanning :language="language" :uuid="currentUuid" @cancel-step="cancelStep" @continue-step="continueToRecording"></Scanning>
    </template>


    <template v-if="currentStep === 2">
        <Recording :language="language" :uuid="currentUuid" @cancel="cancelStep" @finish="finish"></Recording>
    </template>

    <template v-if="currentStep === 3">
        <template v-if="language === 'dut'">
            <h1>Bedankt voor je testimonial</h1>
            <h2>Je testimonial wordt nu opgeslagen... </h2>
        </template>
        <template v-else>
            <h1>Thank you for your testimonial</h1>
            <h2>Your testimonial is been saved...</h2>
        </template>
    </template>


</template>