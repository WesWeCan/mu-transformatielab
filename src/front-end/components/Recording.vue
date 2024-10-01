<script setup lang="ts">

import { onMounted, ref } from 'vue';

import { pipeline, env } from '@huggingface/transformers';
env.allowLocalModels = false;

let transcriber;

const loadingModel = ref<boolean>(false);

onMounted(async () => {
    console.log('Recording.vue mounted');

    loadingModel.value = true;
    transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small');
    loadingModel.value = false;

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

    transcribe();
}

const transcribing = ref<boolean>(false);
const transcribeOutput = ref<string>('');

const transcribe = async () => {
    transcribing.value = true;
    transcribeOutput.value = '';

    const url = playback.value.src;
    const duration = playback.value.duration;

    try {
        transcribeOutput.value = await transcriber(url, { 
            language: 'dutch', 
            task: 'transcribe',
            chunk_length_s: 30,
            stride_length_s: 5
        });
    } catch (error) {
        console.error('Error during transcription:', error);
        transcribeOutput.value = 'Transcription failed.';
    } finally {
        transcribing.value = false;
    }

    console.log('transcribe', transcribeOutput.value);
}






</script>

<template>



    <div>Recording</div>

    <template v-if="loadingModel">
        <div>Loading Model...</div>
    </template>
    
<template v-else>
    <button @click="startRecording" :disabled="isRecording">Start Recording</button>
    <button @click="stopRecording" :disabled="!isRecording">Stop Recording</button>

    <audio ref="playback" controls></audio>


    <div>Recorded Chunks: {{ recordedChunks.length }}</div>

    <div v-if="transcribing">
        <div>Transcribing...</div>
    </div>

    <div v-else>
        {{ transcribeOutput }}
    </div>

</template>


</template>