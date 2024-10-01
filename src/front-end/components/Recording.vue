<script setup lang="ts">

import { onMounted, ref } from 'vue';

import { pipeline, env } from '@huggingface/transformers';
env.allowLocalModels = false;

let transcriber;

const isEnglish = ref<boolean>(false);

const loadingModel = ref<boolean>(false);

const selectedWords = ref<string[]>([]);
const availableWords = ref<string[]>([]);

onMounted(async () => {
    console.log('Recording.vue mounted');

    loadingModel.value = true;
    transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base', {
        dtype: {
            encoder_model: 'fp32',
            decoder_model_merged: 'fp32',
        },
        device: 'webgpu'
    });
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

    const start = performance.now();

    try {
        transcribeOutput.value = await transcriber(url, {
            language: isEnglish.value ? 'english' : 'dutch',
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


    const end = performance.now();

    console.log('transcribe', transcribeOutput.value.text);

    console.log('completed in', end - start, 'ms');
    availableWords.value = transcribeOutput.value.text.trim().split(' ');

    // from each word remove all reading signs like , . ! etc
    // also make each word lowercase

    for (let i = 0; i < availableWords.value.length; i++) {
        const word = availableWords.value[i];
        availableWords.value[i] = word.replace(/[.,!?]/g, '').toLowerCase();
    }


}


const toggleWordSelection = (word: string) => {
    if (selectedWords.value.includes(word)) {
        selectedWords.value = selectedWords.value.filter((selectedWord) => selectedWord !== word);
    } else {
        selectedWords.value.push(word);
    }
}

const newWord = ref<string>('');
const addCustomWord = () => {
    if (newWord.value.trim().length === 0) {
        return;
    }

    toggleWordSelection(newWord.value);
    newWord.value = '';
}



</script>

<template>



    <div>Recording</div>

    <div class="language">
        <button @click="isEnglish = true" :disabled="isEnglish">English</button>
        <button @click="isEnglish = false" :disabled="!isEnglish">Dutch</button>
    </div>

    <template v-if="loadingModel">
        <div>Loading Model...</div>
    </template>

    <template v-else>
        <button @click="startRecording" :disabled="isRecording">Start Recording</button>
        <button @click="stopRecording" :disabled="!isRecording">Stop Recording</button>

        <audio ref="playback" controls hidden></audio>

        <div v-if="transcribing">
            <div>Transcribing...</div>
        </div>

        <div v-else>
            {{ transcribeOutput }}
        </div>



        <template v-if="availableWords.length">
            <div class="words">
                <button v-for="word in availableWords" :key="word" @click="toggleWordSelection(word)">
                    <span v-if="selectedWords.includes(word)" style="font-weight: bold">{{ word }}</span>
                    <span v-else>{{ word }}</span>
                </button>

                <br><br>
                <span>Add Word</span>
                <input type="text" v-model="newWord" @keyup.enter="addCustomWord" />
            </div>

            <div class="selected-words">
                <button v-for="word in selectedWords" :key="word" @click="toggleWordSelection(word)">
                    <span style="font-weight: bold">{{ word }}</span>
                </button>
            </div>
        </template>

    </template>


</template>