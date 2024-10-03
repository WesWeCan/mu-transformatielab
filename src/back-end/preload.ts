// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { getWords } from './internal-processes/internal-storage';




declare global {
  interface Window {
    electronAPI: {
      openExternal: (url: string) => void;
      getRandomNumber: () => Promise<number>;
      onUpdateMenuCounter: (callback: (value: number) => void) => void;
      counterMenuValue: (value: number) => void;
      transcribe: (file: string, options: any) => Promise<string>;
      storeTicket: (ticketBase64: string, uuid: string) => void;
      storeTranscribe: (transcribeBase64: string, uuid: string) => void;
      storeTranscribed: (transcription: string, uuid: string) => void;
      storeWords: (words: string[], uuid: string) => void;
      getWords: () => Promise<string[]>;
      onBecomeMain: (callback: () => void) => void;
      onBecomeCloud: (callback: () => void) => void;
      onUpdateCloud: (callback: () => void) => void;
      updateCloud: () => void;
    };
  }
}



contextBridge.exposeInMainWorld('electronAPI', {

    openExternal: (url: string) => { ipcRenderer.send('openExternal', url); },

    // NOTE: This is not a annonymous function, it is a function that returns a promise
    getRandomNumber: () => ipcRenderer.invoke('getRandomNumber') , 

    onUpdateMenuCounter: (callback : (value: number) => void) => {
        ipcRenderer.on('update-counter', (event, value) => {
            callback(value);
        });
      },

    counterMenuValue: (value : number) => {
        ipcRenderer.send('update-counter', value);
    },
    

    onBecomeMain: (callback : () => void) => {
      ipcRenderer.on('become-main', (event) => {
          callback();
      });
    },

    onBecomeCloud: (callback : () => void) => {
      ipcRenderer.on('become-cloud', (event) => {
          callback();
      });
    },


    onUpdateCloud: (callback : () => void) => {
      ipcRenderer.on('update-cloud', (event) => {
          callback();
      });
    },

    updateCloud : () => {
        ipcRenderer.invoke('update-cloud');
    },



    storeTicket : (ticketBase64 : string, uuid : string) => {
        return ipcRenderer.invoke('store-ticket', ticketBase64, uuid);
    },

    storeTranscribe : (transcribeBase64 : string, uuid : string) => {
        return ipcRenderer.invoke('store-transcribe', transcribeBase64, uuid);
    },

    storeTranscribed : (transcription : string, uuid : string) => {
        return ipcRenderer.invoke('store-transcribed', transcription, uuid);
    },

    storeWords : (words : string[], uuid : string) => {
        return ipcRenderer.invoke('store-words', words, uuid);
    },

    getWords: () => {
      return ipcRenderer.invoke('get-words');
    }
});