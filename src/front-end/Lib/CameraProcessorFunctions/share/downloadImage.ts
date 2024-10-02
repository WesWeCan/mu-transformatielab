import { CameraProcessor } from "../../CameraProcessor";


export const downloadImage = async (context: CameraProcessor, isSharing = false) => {
    if (context.processingDownload) {
        return;
    }
    context.processingDownload = true;

    try {
        if (context.running) {
            // context.running = false;
            await context.loop();
            await context.draw();
            // Wait for the last draw to finish if necessary
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        if (!context.canvas_render) {
            console.error('No rendering canvas');
            context.processingDownload = false;
            return;
        }

        const canvas_render = context.canvas_render as HTMLCanvasElement;
        const dataUrl = canvas_render.toDataURL();

        const a = document.createElement('a');
        a.href = dataUrl;

        return dataUrl;
    } catch (error) {
        console.error('Error downloading or archiving image', error);
    } finally {
        context.processingDownload = false;
    }
}