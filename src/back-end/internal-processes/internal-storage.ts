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
        folder: "tickets",
         filename: "tickets.json",
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

export const getTickets = async () => {
    const tickets = await getInternalStorageFile(path.join('tickets', 'tickets.json'));
    return JSON.parse(tickets.toString());
}

export const getTicketByID = async (ticketID: string) => {
    const tickets = await getTickets();
    const ticket = tickets.find((ticket: any) => ticket.ticketID === ticketID);
    return ticket;
}

export const appendTicket = async (ticket: any) => {
    const tickets = await getTickets();

    const ticketExists = tickets.find((item: any) => item.ticketID === ticket.ticketID);

    if (ticketExists) {
        console.log('Ticket exists, replacing');

        const index = tickets.indexOf(ticketExists);
        tickets[index] = ticket;

        await setTickets(tickets);

        return;
    }

    tickets.push(ticket);

    await setTickets(tickets);
}

export const setTickets = async (tickets: any) => {
    const ticketsString = JSON.stringify(tickets);
    await fs.writeFileSync(getInternalStorageFilePath(path.join('tickets', 'tickets.json')), ticketsString);
}