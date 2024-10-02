<script setup lang="ts">


import { onMounted, ref } from 'vue';

import { CameraProcessor } from '../Lib/CameraProcessor';
const cp = new CameraProcessor();

const video_container = ref<HTMLDivElement | null>(null);
const div_process = ref<HTMLDivElement | null>(null);
const div_render = ref<HTMLDivElement | null>(null);

const emit = defineEmits(['newSlice', "updateList"]);

const loadingText = ref('Loading...');


const availableVideoDevices = ref<{ device: InputDeviceInfo, capabilities: MediaTrackCapabilities }[]>([]);
const currentVideoDeviceId = ref<string | undefined>(undefined);

const preview = ref<HTMLDivElement | null>(null);

onMounted(async () => {
    if (video_container.value && div_process.value && div_render.value) {
        await cp.init(video_container.value, div_process.value, div_render.value);
        availableVideoDevices.value = cp.availableVideoDevices;
        currentVideoDeviceId.value = cp.currentVideoDeviceId;
        requestAnimationFrame(loop);
    }
});

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
    dataUrl.value = await cp.takePhoto();

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
}

const downloadImage = () => {
    cp.downloadImage();
}

const shareImage = () => {
    cp.shareImage();
}


defineExpose({
    takePhoto,
    switchDevice,
    switchDeviceTo,
    availableVideoDevices,
    currentVideoDeviceId
});


</script>


<template>
    <div ref="video_container" class="video-container"></div>
    <div ref="div_process" class="div-process"></div>


    <h1>Scanning</h1>
    <div class="scanning">
        
        <div ref="div_render" class="div-render">
        <span class="loading">{{ loadingText }}</span>
        </div>
    </div>


    <button @click="takePhoto">Take Photo</button>

    <div class="preview" ref="imgPreview">
        <img :src="dataUrl" alt="Preview">

        <button>The image is readable!</button>
    </div>
    
</template>
