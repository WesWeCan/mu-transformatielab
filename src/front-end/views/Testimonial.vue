<script setup lang="ts">
import { onMounted, ref } from 'vue';

import Recording from '../components/Recording.vue';

import Scanning from '../components/Scanning.vue';

const language = ref<string>('eng');

const currentStep = ref<number>(0);

const currentUuid = ref<string>('<UNSET>');

onMounted(() => {
    document.body.id = 'testimonial';
});


const start = () => {
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

    <pre>{{ currentStep }} -- {{ currentUuid }}</pre>

    <div class="intro" v-if="currentStep === 0">

        <h2>Kies je taal / Choose your language</h2>
        <button @click="language = 'dut'">Dutch</button>
        <button @click="language = 'eng'">English</button>


        <template v-if="language === 'dut'">
            <h1>Neem je testimonial op</h1>
            <p>Je hebt door de dilemma's gelopen. Het is nu tijd om je testimonial op te nemen.</p>
            
        </template>
       
        <template v-else>
            <h1>Take your testimonial</h1>
            <p>You have been through the dilemmas. It is now time to take your testimonial.</p>
        </template>

        <button @click="start">Start</button>
        
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
            <p>Je testimonial is opgeslagen. Je kunt dit venster nu sluiten.</p>
        </template>
        <template v-else>
            <h1>Thank you for your testimonial</h1>
            <p>Your testimonial has been saved. You can now close this window.</p>
        </template>
    </template>


</template>