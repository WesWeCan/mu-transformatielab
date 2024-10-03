
import { app, ipcMain } from 'electron';
import { shell } from 'electron';

import { storeTicketImg, storeTranscribe, storeTranscribed, storeWords } from './internal-storage';

export const registerInternalProcesses = async () => {

    ipcMain.on('openExternal', (event, arg) => {
        console.log('openExternal', arg);
        shell.openExternal(arg);
    });

    ipcMain.handle('getRandomNumber', async () => {
        console.log('getRandomNumber');
        // wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        const number = Math.floor(Math.random() * 100);
        return number;
    });


    ipcMain.handle('store-ticket', async (event, ticketBase64, uuid) => {
        console.log('store-ticket', uuid);

        await storeTicketImg(ticketBase64, uuid);

        return;
    });


    ipcMain.handle('store-transcribe', async (event, transcribeBase64, uuid) => {
        console.log('store-transcribe', uuid);

        await storeTranscribe(transcribeBase64, uuid);

        return;
    });


    ipcMain.handle('store-transcribed', async (event, transcription, uuid) => {
        console.log('store-transcribed', uuid);

        await storeTranscribed(transcription, uuid);

        return;
    });

    ipcMain.handle('store-words', async (event, words, uuid) => {
        console.log('store-words', uuid);

        await storeWords(words, uuid);

        return;
    });

}