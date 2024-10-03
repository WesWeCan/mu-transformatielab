

import { getAvailableVideoDevices, getMediaStream, switchVideoDevice } from './CameraProcessorFunctions/setup/setupVideo'
import { createCanvasses } from './CameraProcessorFunctions/setup/setupCanvasses'
import { process } from './CameraProcessorFunctions/process/process';
import { draw } from './CameraProcessorFunctions/draw/draw';


import { downloadImage } from './CameraProcessorFunctions/share/downloadImage';
import { shareImage } from './CameraProcessorFunctions/share/shareImage';
import { archiveImage } from './CameraProcessorFunctions/share/archiveImage';

import { switchToVideoDevice } from './CameraProcessorFunctions/setup/setupVideo';


export class CameraProcessor {

    running: boolean = true;

    canvasses: HTMLCanvasElement | null = null;

    div_video: HTMLDivElement | null = null;
    video: HTMLVideoElement | null = null;
    videoPermission: boolean = true;

    div_process: HTMLDivElement | null = null;
    canvas_process: HTMLCanvasElement | null = null;

    div_render: HTMLDivElement | null = null;
    canvas_render: HTMLCanvasElement | null = null;

    mousePos: { x: number, y: number } = { x: 0, y: 0 };

    availableVideoDevices: {
        device: InputDeviceInfo,
        capabilities: MediaTrackCapabilities
    }[] = [];

    currentVideoDeviceId: string | undefined = undefined;

    resolutionScaling: number = 2;
    processingDownload: boolean = false;

    constructor() {
        console.log("CameraProcessor constructed");
    }


    /**
     * Initialize the camera processor.
     * 
     * @param {HTMLDivElement} videoDiv - The video div element.
     * @param {HTMLDivElement} div_process - The div process element.
     * @param {HTMLDivElement} div_render - The div render element.
     * @param {CorpsesObject} corpse - The corpse object.
     * @returns {Promise<void>}
     */
    async init(videoDiv: HTMLDivElement, div_process: HTMLDivElement, div_render: HTMLDivElement) {
        console.info("Initializing camera processor");

        // await getAvailableVideoDevices(this);
        // console.info('Got available video devices');


        if (this.videoPermission === false) {
            console.error('No video permission');
            return;
        }

        await getMediaStream(this, videoDiv);
        console.info('Got media stream');

        await createCanvasses(this, div_process, div_render);
        console.info('Canvasses created');

        return new Promise<boolean>((resolve, reject) => {
            resolve(true);
        });
    }

    /**
     * Switch the video device.
     * 
     * @returns {Promise<void>}
     */
    async switchVideoDevice() {
        await switchVideoDevice(this);
    }

    async switchToVideoDevice(deviceId: string) {
        await switchToVideoDevice(this, deviceId);
    }


    // --------------------------------------------------

    /**
     * Loop the camera processor.
     * 
     * @returns {Promise<void>}
     */
    async loop() {

        if (!this.running) {
            return;
        }


        if (!this.video || !this.canvas_process) {
            console.error('No video or canvas');
            return;
        }

        await process(this);
        await this.draw();
        await this.render();
    }

    // --------------------------------------------------



    // --------------------------------------------------

    /**
     * Draw the canvas.
     * 
     * @returns {Promise<void>}
     */
    async draw() {
        await draw(this);
    }

    /**
     * Render the canvas, in a responsive way.
     * the processing canvas is scaled to fit the rendering canvas.
     * 
     * @returns {Promise<void>}
     */
    async render() {

        // console.log('render');

        // render the processed canvas to the rendering canvas
        // fill the rendering canvas with the processed canvas, make it responsive
        if (!this.canvas_process || !this.canvas_render) {
            console.error('No canvas or rendering canvas');
            return;
        }

        const canvas_process = this.canvas_process as HTMLCanvasElement;
        const canvas_render = this.canvas_render as HTMLCanvasElement;

        const ctx_render = canvas_render.getContext('2d');
        const ctx_process = canvas_process.getContext('2d');

        if (!ctx_render || !ctx_process) {
            console.error('No context');
            return;
        }

        // draw processed canvas, make it responsive and scale proportionally, but cover the whole rendering canvas
        const aspectRatio = canvas_process.width / canvas_process.height;

        const renderHeight = canvas_render.height;
        const renderWidth = renderHeight * aspectRatio;

        const renderX = (canvas_render.width - renderWidth) / 2;
        const renderY = 0;

        ctx_render.drawImage(canvas_process, renderX, renderY, renderWidth, renderHeight);

    }

    /**
     * Toggle the picture taken state.
     * 
     * @returns {Promise<void>}
     */
    async togglePicture() {
        this.running = !this.running;
        this.loop();
    }


    async takePhoto() {
        
        console.log('take photo');
        return await downloadImage(this);

    }


    /**
     * Get the current time in the format YYYY_MM_DD_HH_MM_SS.
     * 
     * @returns {string} The current time in the format YYYY_MM_DD_HH_MM_SS.
     */
    getCurrentTime() {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hour12: false };
        const currentTime: string = new Intl.DateTimeFormat('en-GB', options).format(new Date()).replace(/[:\s]/g, '_');
        return currentTime;

    }

    async downloadImage(isSharing = false) {
        await downloadImage(this, isSharing);
    }

    /**
     * Share the user generated corpse.
     * 
     * @returns {Promise<void>}
     */
    async shareImage() {
        await shareImage(this);
    }

    /**
     * Archive the user generated corpse.
     * 
     * @param  {string} dataUrl - The data URL of the image to be archived.
     * @returns {Promise<void>}
     */
    async archiveImage(dataUrl: string) {
        await archiveImage(this,dataUrl);
    }



}