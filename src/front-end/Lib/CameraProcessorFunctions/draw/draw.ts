import { CameraProcessor } from "../../CameraProcessor";
import { clearCanvas } from "./clearCanvas";
import { drawVideo } from "./drawVideo";



/**
 * Draw the camera processor.
 * 
 * @param {CameraProcessor} context - The camera processor.
 * @returns {Promise<void>}
 */
export const draw = async (context: CameraProcessor) => {
    // console.log('draw');
    await clearCanvas(context);

    if(context.videoPermission === false) {
        await drawNoPermission(context);
        return;
    }


    // Comment / uncomment the draw functions as needed for debugging
    await drawVideo(context);
    // await drawSegmentation(context);
    // await drawPose(context);
    // await drawObjects(context);
    // await drawBoundingBoxes(context);
    // await drawBoundingBoxesProcessed(context);

    // if ((context.inferenceData.poses?.length ?? 0) > 0) {
    //     await drawSheet(context, 1);
    //     await drawMorph(context);
    // }
    // else {
    //     await drawSheet(context, 1);
    //     drawNoPosesDetected(context);
    // }
}



/**
 * Draw a white sheet over the canvas with an opacity.
 * When the morphing mirror is not running, ( a picture is being taken ), the sheet is opaque.
 * When the morphing mirror is running, ( a picture is being morphed ), the sheet is transparent.
 * 
 * @param {CameraProcessor} context - The camera processor.
 * @param {number} opacity - The opacity of the sheet.
 * @returns {Promise<void>}
 */
const drawSheet = async (context: CameraProcessor, opacity: number) => {

    if(context.running === false) {
        opacity = 1;
    }


    // draw a transparent white sheet over the canvas
    const ctx_process = context.canvas_process?.getContext('2d');
    if (!ctx_process) {
        console.error('No context');
        return;
    }

    if (!context.canvas_process) {
        console.error('No canvas');
        return;
    }

    ctx_process.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx_process.fillRect(0, 0, context.canvas_process.width, context.canvas_process.height);
}


/**
 * Draw a message indicating that no poses were detected.
 * 
 * @param {CameraProcessor} context - The camera processor.
 * @returns {Promise<void>}
 */
const drawNoPosesDetected = async (context: CameraProcessor) => {

    const ctx_process = context.canvas_process?.getContext('2d');
    if (!ctx_process) {
        console.error('No context');
        return;
    }

    if (!context.canvas_process) {
        console.error('No canvas');
        return;
    }

    let fontSize = 18;
    ctx_process.font = `${fontSize}px Arial`;
    ctx_process.fillStyle = 'blue';

    const text = '[I do not see you]';
    const textWidth = ctx_process.measureText(text).width;
    const x = (context.canvas_process.width - textWidth) / 2;
    const y = context.canvas_process.height / 2;
    ctx_process.fillText(text, x, y);

}


/**
 * Draw a message indicating that no permission to use the camera was granted.
 * 
 * @param {CameraProcessor} context - The camera processor.
 * @returns {Promise<void>}
 */
const drawNoPermission = async (context: CameraProcessor) => {

    const ctx_process = context.canvas_process?.getContext('2d');
    if (!ctx_process) {
        console.error('No context');
        return;
    }

    if (!context.canvas_process) {
        console.error('No canvas');
        return;
    }

    let fontSize = 18;
    ctx_process.font = `${fontSize}px Arial`;
    ctx_process.fillStyle = 'blue';

    const text = '[No permission to use camera, check your browser settings]';
    const textWidth = ctx_process.measureText(text).width;
    const x = (context.canvas_process.width - textWidth) / 2;
    const y = context.canvas_process.height / 2;
    ctx_process.fillText(text, x, y);

}