<script setup lang="ts">


import { onMounted, ref } from 'vue';

import { CameraProcessor } from '../Lib/CameraProcessor';
const cp = new CameraProcessor();

const video_container = ref<HTMLDivElement | null>(null);
const div_process = ref<HTMLDivElement | null>(null);
const div_render = ref<HTMLDivElement | null>(null);

const emit = defineEmits(['cancelStep', 'continueStep']);

const loadingText = ref('Loading...');




const availableVideoDevices = ref<{ device: InputDeviceInfo, capabilities: MediaTrackCapabilities }[]>([]);
const currentVideoDeviceId = ref<string | undefined>(undefined);

const preview = ref<HTMLDivElement | null>(null);

const props = defineProps<{
    language: string,
    uuid: string
}>();

const isScanning = ref<boolean>(true);
const processingPhoto = ref<boolean>(false);



onMounted(async () => {
    startScanning();
});


const startScanning = async () => {
    if (video_container.value && div_process.value && div_render.value) {
        await cp.init(video_container.value, div_process.value, div_render.value);
        availableVideoDevices.value = cp.availableVideoDevices;
        currentVideoDeviceId.value = cp.currentVideoDeviceId;
        requestAnimationFrame(loop);
    }
}




/**
 * Main loop that runs the camera processor.
 */
const loop = async () => {
    if (video_container.value && div_process.value) {

        if (!cp.videoPermission) {
            loadingText.value = 'No permission to use camera, check your settings and refresh the page.';
            console.error('No video permission');
            return;
        }

        await cp.loop();

        requestAnimationFrame(loop);
    }
}

const switchDevice = () => {
    cp.switchVideoDevice();
    availableVideoDevices.value = cp.availableVideoDevices;
    currentVideoDeviceId.value = cp.currentVideoDeviceId;
}

const switchDeviceTo = (deviceId: string) => {
    cp.switchToVideoDevice(deviceId);
    availableVideoDevices.value = cp.availableVideoDevices;
    currentVideoDeviceId.value = cp.currentVideoDeviceId;
}

const dataUrl = ref<string | null>(null);
const imgPreview = ref<HTMLImageElement | null>(null);

const takePhoto = async () => {
    console.log('take photo');
    processingPhoto.value = true;
    dataUrl.value = await cp.takePhoto();
    processingPhoto.value = false;
    console.log('dataUrl', dataUrl.value);

    if (dataUrl.value) {
        if (imgPreview.value) {
            imgPreview.value.src = dataUrl.value;
        } else {
            imgPreview.value = document.createElement('img');
            imgPreview.value.src = dataUrl.value;
            div_render.value?.appendChild(imgPreview.value);
        }
    }

    isScanning.value = false;
}


defineExpose({
    takePhoto,
    switchDevice,
    switchDeviceTo,
    availableVideoDevices,
    currentVideoDeviceId
});


const startOver = () => {
    isScanning.value = true;
}

const continueStep = async () => {


    const fixedDataUrl = dataUrl.value.replace('data:image/png;base64,', '');

    // save image to storage
    window.electronAPI.storeTicket(fixedDataUrl, props.uuid);

    emit('continueStep');
}

const cancel = () => {
    emit('cancelStep');
}

</script>


<template>
    <div ref="video_container" class="video-container"></div>
    <div ref="div_process" class="div-process"></div>


    <h1>{{ language === 'dut' ? 'Scannen' : 'Scanning' }}</h1>
    <span>{{ language === 'dut' ? 'Leg je ticket klaar en druk op scan ticket' : 'Please put your ticket and press scan ticket' }}</span>

    <button @click="cancel">{{ language === 'dut' ? 'Annuleer' : 'Cancel' }}</button>
   
    <div class="scanning" :class="{ hidden: !isScanning, processing: processingPhoto }">
        <div ref="div_render" class="div-render">
        <span class="loading">{{ loadingText }}</span>
        </div>
    </div>


    <button @click="takePhoto" :class="{ hidden: !isScanning }" :disabled="processingPhoto">{{ language === 'dut' ? 'Neem foto' : 'Take Photo' }}</button>


    <div class="preview" ref="imgPreview" :class="{ hidden: isScanning }">
        <img :src="dataUrl" alt="Preview">

        <button @click="continueStep">{{ language === 'dut' ? 'Foto is goed leesbaar, ga door' : 'The image is readable, go on' }}</button>

        <br/>
        <button @click="startOver">{{ language === 'dut' ? 'Maak nieuwe foto' : 'Take New Photo' }}</button>
    </div>

    
</template>
