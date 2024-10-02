import { CameraProcessor } from "../../CameraProcessor";



const preferedDeviceLabel = "HD Pro Webcam C920";

/**
 * Get the available video devices.
 *  
 * @param {CameraProcessor} context - The camera processor.
 * @returns {Promise<void>}
 */
export const getAvailableVideoDevices = async (context: CameraProcessor) => {
    try {
        // Ask for permission to use the camera first so enumeration goes correctly
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
    } catch (error) {
        console.error('Error accessing media devices.', error);
        return;
    }


    // On certain Apple devices, you must first enumerate devices to prompt permission for accessing media devices.
    // By doing this, you ensure that the browser can list available video devices (cameras) and prompt the user for access, 
    // if required, on the first permissions request.
    // This step is crucial, especially on Apple devices, to avoid issues with accessing video devices later.
    const devices = await navigator.mediaDevices.enumerateDevices();
    const availableVideoDevices = devices.filter(device => device.kind === 'videoinput') as InputDeviceInfo[];

    const withCapabilities = await Promise.all(availableVideoDevices.map(async (device) => {
        let capabilities;

        // Use a try to make sure it is working in Firefox
        try {
            // Create a temporary stream to access capabilities if not Firefox
            const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: device.deviceId } });
            const track = stream.getVideoTracks()[0];
            capabilities = track.getCapabilities ? track.getCapabilities() : {};
            track.stop();
        } catch (error) {
            console.error('Error getting capabilities for device:', device.label, error);
            capabilities = {};
        }
        return {
            device: device,
            capabilities: capabilities
        };
    }));

    console.log(withCapabilities);

    // // Find a device with the label or capability of facingMode of 'environment'
    // const environmentDevice = withCapabilities.find(device =>
    //     device.device.label.toLowerCase().includes('back') ||
    //     (device.capabilities.facingMode && device.capabilities.facingMode.includes('environment'))
    // ) || withCapabilities[0];

    // context.currentVideoDeviceId = environmentDevice.device.deviceId;

    // // Find a device with the label or capability of facingMode of 'user' (front-facing camera) and make it default
    const frontFacingDevice = withCapabilities.find(device =>
        device.device.label.toLowerCase().includes('front') ||
        (device.capabilities.facingMode && device.capabilities.facingMode.includes('user'))
    ) || withCapabilities[0];

    context.currentVideoDeviceId = frontFacingDevice.device.deviceId;

    
    context.availableVideoDevices = withCapabilities;
 

    // Update video permission in context
    context.videoPermission = true;
}

/**
 * Switch the video device.
 * 
 * This function switches the video device. Based on the current video device, it will switch to the next available video device.
 * 
 * @param {CameraProcessor} context - The camera processor.
 * @returns {Promise<void>}
 */
export const switchVideoDevice = async (context: CameraProcessor) => {

    if (!context.currentVideoDeviceId) {
        console.error('No current video device');
        return;
    }

    // const currentDevice = context.availableVideoDevices.find(device => device.device.deviceId === context.currentVideoDeviceId);

    console.log(context.availableVideoDevices);

    // get index of current device
    const currentIndex = context.availableVideoDevices.findIndex(device => device.device.deviceId === context.currentVideoDeviceId);

    // get next device
    const nextIndex = (currentIndex + 1) % context.availableVideoDevices.length;
    const nextDevice = context.availableVideoDevices[nextIndex];

    // set next device
    context.currentVideoDeviceId = nextDevice.device.deviceId;
    console.log('Switching video device to: ' + nextDevice.device.label);

    getMediaStream(context, context.div_video as HTMLDivElement);
    // createCanvasses(this, this.div_process as HTMLDivElement, this.div_render as HTMLDivElement);

}


export const switchToVideoDevice = async (context: CameraProcessor, deviceId: string) => {

    if (!context.availableVideoDevices) {
        console.error('No available video devices');
        return;
    }

    // set next device
    context.currentVideoDeviceId = deviceId;

    getMediaStream(context, context.div_video as HTMLDivElement);
    // createCanvasses(this, this.div_process as HTMLDivElement, this.div_render as HTMLDivElement);
}


/**
 * Get the media stream.
 * 
 * This function gets the media stream for the video element.
 * 
 * @param {CameraProcessor} context - The camera processor.
 * @param {HTMLDivElement} videoDiv - The video div.
 * @returns {Promise<void>}
 */
export const getMediaStream = async (context: CameraProcessor, videoDiv: HTMLDivElement) => {

    if (!videoDiv) {
        console.error('No video div');
        return;
    }

    // Stop existing video if any
    if (context.video) {
        const stream = context.video.srcObject as MediaStream;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        context.video.pause();
        context.video.srcObject = null;
        context.video = null;
        videoDiv.innerHTML = '';
    }

    // Assign new video div to context
    context.div_video = videoDiv;

    // Create new video element
    const video = document.createElement('video');
    video.width = 640;
    video.height = 480;
    video.muted = true;
    video.setAttribute('playsinline', 'true'); // Prevent fullscreen on iPhone
    video.style.objectFit = 'cover'; // Ensure the video covers the div area without stretching

    videoDiv.innerHTML = '';
    videoDiv.appendChild(video);

    console.log('Getting media stream');
    // console.log(context.availableVideoDevices);


    

    let devices = await navigator.mediaDevices.enumerateDevices();
    console.log(devices);
    let videoDevice = devices.find(device => device.label.includes(preferedDeviceLabel) && device.kind === 'videoinput');

    if (videoDevice) {
        context.currentVideoDeviceId = videoDevice.deviceId;
    } else {
        console.error('Preferred video device not found.');
        return;
    }

    // Set media constraints with the current video device
    const constraints = {
        video: {
            deviceId: { exact: context.currentVideoDeviceId },
            width: { ideal: 640 },
            height: { ideal: 480 }
        }
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
    } catch (error) {
        console.error('Error accessing media devices.', error);
        return;
    }

    await new Promise((resolve) => {
        video.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            resolve(true);
        };
    });

    video.play();

    if (!video) {
        console.error('No video element available');
        return;
    }

    context.video = video;

    await new Promise((resolve) => {
        video.addEventListener('loadeddata', () => {
            console.log('Video loaded');
            resolve(true);
        });
    });

    return new Promise((resolve) => {
        resolve(true);
    });

}