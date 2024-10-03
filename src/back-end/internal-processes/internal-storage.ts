import { app, shell } from 'electron';
import path from 'path';
import fs from 'fs';

const schema = [
    {
       folder: "testimonials",
        filename: "testimonials.json",
        defaultValue: [] as any[],
        
    },
    {
        folder: "words",
         filename: "words.json",
         defaultValue: [] as any[],
         
     },
    {
        folder: "config",
            filename: "config.json",
            defaultValue: {
                "version": 1,
            }
        
    },
]


export const getInternalStoragePath = () => {
    return path.join(app.getPath('userData'), 'internal-storage');
}

export const getInternalStorageFilePath = (fileName: string) => {
    return path.join(getInternalStoragePath(), fileName);
}

export const getInternalStorageFile = (fileName: string) => {
    return fs.readFileSync(getInternalStorageFilePath(fileName));
}


export const openInternalStorageFolder = () => {
    const storagePath = getInternalStoragePath();
    shell.openPath(storagePath);
}

export const initStorage = async () => {

    const storagePath = getInternalStoragePath();

    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath);
        console.log('Created folder:', storagePath);
    }

    for (const folder of schema) {
        const folderPath = getInternalStorageFilePath(folder.folder);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
            console.log('Created folder:', folderPath);
        }

        const filePath = getInternalStorageFilePath(path.join(folder.folder, folder.filename));
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(folder.defaultValue));
            console.log('Created file:', filePath);
        }
    }

    return new Promise<void>((resolve, reject) => {
        resolve();
    });
    
}







// ----- custom functions -----

export const getConfig = async () => {
    const config = await getInternalStorageFile(path.join('config', 'config.json'));
    return JSON.parse(config.toString());
}

export const setConfig = async (config: any) => {
    const configString = JSON.stringify(config);
    await fs.writeFileSync(getInternalStorageFilePath(path.join('config', 'config.json')), configString);
}

export const getTestimonials = async () => {
    const testimonials = await getInternalStorageFile(path.join('testimonials', 'testimonials.json'));
    return JSON.parse(testimonials.toString());
}

export const getTestimonialByID = async (testimonialID: string) => {
    const testimonials = await getTestimonials();
    const testimonial = testimonials.find((testimonial: any) => testimonial.testimonialID === testimonialID);
    return testimonial;
}

export const appendTestimonial = async (testimonial: any) => {
    const testimonials = await getTestimonials();

    const testimonialExists = testimonials.find((item: any) => item.testimonialID === testimonial.testimonialID);

    if (testimonialExists) {
        console.log('Testimonial exists, replacing');

        const index = testimonials.indexOf(testimonialExists);
        testimonials[index] = testimonial;

        await setTestimonials(testimonials);

        return;
    }

    testimonials.push(testimonial);

    await setTestimonials(testimonials);
}

export const setTestimonials = async (testimonials: any) => {
    const testimonialsString = JSON.stringify(testimonials);
    await fs.writeFileSync(getInternalStorageFilePath(path.join('testimonials', 'testimonials.json')), testimonialsString);
}

export const getWords = async () => {
    const words = await getInternalStorageFile(path.join('words', 'words.json'));
    return JSON.parse(words.toString());
}

export const getTicketByID = async (ticketID: string) => {
    const words = await getWords();
    const ticket = words.find((ticket: any) => ticket.ticketID === ticketID);
    return ticket;
}

export const appendTicket = async (ticket: any) => {
    const words = await getWords();

    const ticketExists = words.find((item: any) => item.ticketID === ticket.ticketID);

    if (ticketExists) {
        console.log('Ticket exists, replacing');

        const index = words.indexOf(ticketExists);
        words[index] = ticket;

        await setWords(words);

        return;
    }

    words.push(ticket);

    await setWords(words);
}

export const setWords = async (words: any) => {
    const wordsString = JSON.stringify(words);
    await fs.writeFileSync(getInternalStorageFilePath(path.join('words', 'words.json')), wordsString);
}


export const storeTicketImg = async (ticketBase64: string, uuid: string) => {

    // store the ticketimage as <uuid>.png in the 'testimonials' folder
    const filePath = path.join(getInternalStoragePath(), 'testimonials', `${uuid}.png`);
    fs.writeFileSync(filePath, Buffer.from(ticketBase64, 'base64'));

    console.log('Ticket image stored at', filePath);

}


export const storeTranscribe = async (transcribeBase64: string, uuid: string) => {

    // store the transcribe as <uuid>.mp3 in the 'testimonials' folder
    const filePath = path.join(getInternalStoragePath(), 'testimonials', `${uuid}.webm`);
    fs.writeFileSync(filePath, Buffer.from(transcribeBase64, 'base64'));

    console.log('Transcribe stored at', filePath);

}

export const storeTranscribed = async (transcription: string, uuid: string) => {

    // store the transcribe as <uuid>.txt in the 'testimonials' folder
    const filePath = path.join(getInternalStoragePath(), 'testimonials', `${uuid}_transcribed.txt`);
    fs.writeFileSync(filePath, transcription);

    console.log('Transcribe stored at', filePath);

}





export const storeWords = async (words: string[], uuid: string) => {
    const filePath = path.join(getInternalStoragePath(), 'testimonials', `${uuid}_words.txt`);
    fs.writeFileSync(filePath, words.join('\n'));


    // get the words from the file in words.json
    const wordsFromFile = await getWords();

    // append the new words to the existing words in words.json
    wordsFromFile.push(...words);

    // store the new words in words.json
    await setWords(wordsFromFile);

    console.log('Words stored at', filePath);

}