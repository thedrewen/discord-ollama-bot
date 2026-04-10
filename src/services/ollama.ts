import { Message, Ollama } from "ollama";
import { readFile, writeFile } from "fs/promises";
import { configDotenv } from "dotenv";

configDotenv();

class OllamaService {

    private ollama: Ollama;
    private history: Message[] = [];
    private queue: { id: string, content: string, authorName: string }[] = [];
    public isRunning: boolean = false;
    private pendingResult: {[key: string]: (c: string) => void} = {};
    private prompt: string = '';

    constructor() {
        this.ollama = new Ollama({ host: process.env.OLLAMA_URL });
        this.loadHistory();
        this.loadPrompt();
    }

    private async loadHistory() {
        this.history = JSON.parse(await readFile('data/history.json', 'utf-8'));
    }

    private async saveHistory() {
        await writeFile('data/history.json', JSON.stringify(this.history, null, 4), 'utf-8');
    }

    private async loadPrompt() {
        this.prompt = await readFile('data/prompt.md', 'utf-8');
    }

    public async ask(authorName: string, content: string, store: boolean = false, interactionId: string = '') {
        this.isRunning = true;

        this.history.push({
            role: 'user',
            content: `[${authorName}]: ${content}`
        });

        if(this.history.length > 50) this.history.splice(0, this.history.length - 50);

        const reply = await this.ollama.chat({
            model: process.env.OLLAMA_MODEL as string,
            options: {num_ctx: 8192},
            messages: [
                {role: 'system', content: this.prompt},
                ...this.history
            ]
        });

        this.history.push({role: 'assistant', content: reply.message.content});
        await this.saveHistory();

        if (this.queue.length == 0) {
            this.isRunning = false;
        } else {
            const next = this.queue.shift();
            if (next) {
                this.ask(next.authorName, next.content, true, next.id);
            }
        }

        if(!store) {
            return reply.message.content;
        }

        const res = this.pendingResult[interactionId];
        if(res) {
            res(reply.message.content); 
        }

        return null;
    }

    public async fetchResponse(id: string) {
        return new Promise((res) => {
            this.pendingResult[id] = res;
        }); 
    }

    public addInteractionId(id: string, authorName: string, content: string) {
        this.queue.push({ id, authorName, content });
    }

    public fetchPlaceToInteractionId(id: string) {
        return this.queue.findIndex((value) => value.id == id) + 1;
    }
}

export default new OllamaService();