import { CameraProcessor } from "../../CameraProcessor";

/**
 * Clear the canvas. with a transparent background.
 * 
 * @param {CameraProcessor} context - The camera processor.
 * @returns {Promise<void>}
 */
export const clearCanvas = async (context: CameraProcessor) => {
    if (!context.canvas_process) {
        console.error('No canvas');
        return;
    }

    const canvas = context.canvas_process as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error('No context');
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

}