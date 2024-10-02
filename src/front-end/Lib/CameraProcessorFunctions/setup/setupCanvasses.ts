import { CameraProcessor } from "../../CameraProcessor";

/**
 * Create the canvasses.
 * 
 * This function creates the canvasses for the process and render.
 * 
 * @param {CameraProcessor} context - The camera processor.
 * @param {HTMLDivElement} div_process - The div for the process.
 * @param {HTMLDivElement} div_render - The div for the render.
 * @returns {Promise<void>}
 */
export const createCanvasses = async (context: CameraProcessor, div_process: HTMLDivElement, div_render: HTMLDivElement) => {

    if (!div_process) {
        console.error('No div process');
        return;
    }

    context.div_process = div_process  ;

    const canvas_process = document.createElement('canvas');
    canvas_process.id = 'canvas_process';

    if (!context.video?.videoWidth || !context.video?.videoHeight) {
        console.error('No video width or height');
        return;
    }

    canvas_process.width = context.video.videoWidth;
    canvas_process.height = context.video.videoHeight;

    context.canvas_process = canvas_process;

    context.div_process.appendChild(canvas_process);

    if (!div_render) {
        console.error('No div render');
        return;
    }

    context.div_render = div_render;

    const canvas_render = document.createElement('canvas');
    canvas_render.id = 'canvas_render';

    canvas_render.width = context.div_render.clientWidth;
    canvas_render.height = context.div_render.clientHeight;

    context.canvas_render = canvas_render;

    context.div_render.appendChild(canvas_render);



    // put in the center "loading..." of the canvas
    const ctx_process = canvas_render.getContext('2d');
    if (!ctx_process) {
        console.error('No context');
        return;
    }

    window.addEventListener('resize', () => { resizeCanvases(context); });

    return new Promise((resolve) => {
        resolve(true);
    });


}


/**
 * Resize the canvasses.
 * 
 * This function resizes the canvasses for the process and render.
 * 
 * @param {CameraProcessor} context - The camera processor.
 * @returns {Promise<void>}
 */
const resizeCanvases = async (context: CameraProcessor) => {
    if (!context.canvas_render || !context.div_render) {
        console.error('No canvas render or div render');
        return;
    }

    context.canvas_render.width = context.div_render.clientWidth ;
    context.canvas_render.height = context.div_render.clientHeight ;
    context.canvas_render.style.width = `${context.div_render.clientWidth}px`;
    context.canvas_render.style.height = `${context.div_render.clientHeight}px`;

    if (!context.canvas_process || !context.div_process) {
        console.error('No canvas process or div process');
        return;
    }

    context.canvas_process.width = (context.video?.videoWidth || 0);
    context.canvas_process.height = (context.video?.videoHeight || 0);
    context.canvas_process.style.width = `${(context.video?.videoWidth || 0)}px`;
    context.canvas_process.style.height = `${(context.video?.videoHeight || 0)}px`;

    const ctx_process = context.canvas_process.getContext('2d');
    if (!ctx_process) {
        console.error('No context');
        return;
    }

    ctx_process.fillStyle = `rgba(255, 255, 255, 1)`;
    ctx_process.fillRect(0, 0, context.canvas_process.width, context.canvas_process.height);

    const ctx_render = context.canvas_render.getContext('2d');
    if (!ctx_render) {
        console.error('No context');
        return;
    }

    ctx_render.fillStyle = `rgba(255, 255, 255, 1)`;
    ctx_render.fillRect(0, 0, context.canvas_render.width, context.canvas_render.height);

    // drawNoPosesDetected(context);

    return new Promise((resolve) => {
        resolve(true);
    });
};