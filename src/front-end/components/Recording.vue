<script setup lang="ts">

import { onMounted, ref } from 'vue';

onMounted(() => {
    console.log('Recording.vue mounted');
})

const recorder = ref<MediaRecorder | null>(null);
const playback = ref<HTMLAudioElement>(null);
const isRecording = ref<boolean>(false);
const recordedChunks = ref<Blob[]>([]);

const startRecording = async () => {
    console.log('startRecording');

    recordedChunks.value = [];

    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    recorder.value = new MediaRecorder(mediaStream);

    recorder.value.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.value.push(event.data);
        }
    };

    recorder.value.start();
    isRecording.value = true;
}

const stopRecording = async () => {
    console.log('stopRecording');

    if (recorder.value && recorder.value.state !== 'inactive') {
        recorder.value.stop();
    }

    isRecording.value = false;

    await new Promise((resolve) => setTimeout(resolve, 100)); // Ensures all data is available

    if (recordedChunks.value.length > 0) {
        const blob = new Blob(recordedChunks.value, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        playback.value.src = url;
    }

    if (recorder.value) {
        recorder.value.stream.getTracks().forEach(track => track.stop());
        recorder.value = null;
    }

    recordedChunks.value = [];
}

</script>

<template>
    <div>Recording</div>
    
    <button @click="startRecording" :disabled="isRecording">Start Recording</button>
    <button @click="stopRecording" :disabled="!isRecording">Stop Recording</button>

    <audio ref="playback" controls></audio>
</template>