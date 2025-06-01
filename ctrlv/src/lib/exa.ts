import { Exa } from 'exa-js';

// Initialize and export the Exa client
export const exaClient = new Exa(process.env.EXA_API_KEY!);
