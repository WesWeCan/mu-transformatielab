import { CameraProcessor } from "../../CameraProcessor";

/**
 * Draw the video on the canvas.
 * 
 * @param {CameraProcessor} context - The camera processor.
 * @returns {Promise<void>}
 */
export const drawVideo = async (context: CameraProcessor) => {
    if (!context.canvas_process || !context.video) {
        console.error('No canvas or video');
        return;
    }

    const canvas = context.canvas_process as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error('No context');
        return;
    }

    ctx.drawImage(context.video, 0, 0, canvas.width, canvas.height);

}