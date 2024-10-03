<script setup lang="ts">

import { onMounted, ref } from 'vue';

import { pipeline, env } from '@huggingface/transformers';
env.allowLocalModels = false;

let transcriber : any;

const loadingModel = ref<boolean>(false);

const selectedWords = ref<string[]>([]);
const availableWords = ref<string[]>([]);
const numTranscribed = ref<number>(0);

const props = defineProps<{
    language: string,
    uuid: string
}>();

const emit = defineEmits(['finish', 'cancel']);

onMounted(async () => {
    numTranscribed.value = 0;
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
        let tempOutput = await transcriber(url, {
            language: props.language == 'dut' ? 'dutch' : 'english',
            task: 'transcribe',
            chunk_length_s: 30,
            stride_length_s: 5
        });

        transcribeOutput.value = tempOutput.text;
    } catch (error) {
        console.error('Error during transcription:', error);
        transcribeOutput.value = 'Transcription failed.';
    } finally {
        transcribing.value = false;
    }


    const end = performance.now();

    console.log('transcribe', transcribeOutput.value);
    numTranscribed.value++;


    // store transcribed
    window.electronAPI.storeTranscribed(transcribeOutput.value, `${props.uuid}_${numTranscribed.value}`);

    // Use the blob URL to create the file and store as mp3

  
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64data = reader.result as string;
                const audioDataUrl = base64data
                    .replace(/^data:audio\/webm;base64,/, ''); // Maintain regex to match the new type

                window.electronAPI.storeTranscribe(audioDataUrl, `${props.uuid}_${numTranscribed.value}`);
            };

            reader.readAsDataURL(blob);
        })
        .catch(error => console.error('Error converting to blob:', error));


    console.log('completed in', end - start, 'ms');
    availableWords.value = transcribeOutput.value.trim().split(' ');

    // from each word remove all reading signs like , . ! etc
    // also make each word lowercase

    for (let i = 0; i < availableWords.value.length; i++) {
        const word = availableWords.value[i];
        availableWords.value[i] = word.replace(/[;:.!?()\[\]{},"'’”\-—]+$/g, '').toLowerCase();
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



const finish = () => {

    // store words
    window.electronAPI.storeWords(JSON.parse(JSON.stringify(selectedWords.value)), props.uuid);




    emit('finish');
}


</script>

<template>


<h1>Record your testimonial</h1>
    <div>Recording</div>
    <button>{{ language === 'dut' ? 'Annuleer' : 'Cancel' }}</button>

    <span>{{ language === 'dut' ? 'Vat je gesprek samen in een korte testimonial, druk op opnemen' : 'Record your conversation in a short testimonial, press record' }}</span>

    <template v-if="loadingModel">
        <div>{{ language === 'dut' ? 'Model wordt geladen...' : 'Loading model...' }}</div>
    </template>

    <template v-else>
        <button @click="startRecording" :disabled="isRecording">{{ language === 'dut' ? 'Opnemen' : 'Take Recording' }}</button>
        <button @click="stopRecording" :disabled="!isRecording">{{ language === 'dut' ? 'Stop opnemen' : 'Stop Recording' }}</button>

        <audio ref="playback" controls hidden></audio>

        <div v-if="transcribing">
            <div>{{ language === 'dut' ? 'Transcriben...' : 'Transcribing...' }}</div>
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
                <span>Add Word</span><br>
                <input type="text" v-model="newWord" @keyup.enter="addCustomWord" />
                <button @click="addCustomWord">{{ language === 'dut' ? 'Voeg woord toe' : 'Add Word' }}</button>
            </div>

            <div class="selected-words">
                <span>{{ language === 'dut' ? 'Geselecteerde woorden' : 'Selected Words' }}</span><br>
                <button v-for="word in selectedWords" :key="word" @click="toggleWordSelection(word)">
                    <span style="font-weight: bold">{{ word }}</span>
                </button>


                <br/><br/>
                <button @click="finish">{{ language === 'dut' ? 'Klaar' : 'Done' }}</button>
            </div>
        </template>

    </template>


</template>