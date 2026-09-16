import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class StorageAdapterService {
    private storageDir: string;

    constructor() {
        this.storageDir = path.join(process.cwd(), 'dist', 'uploads');
        if (!fs.existsSync(this.storageDir)) {
            fs.mkdirSync(this.storageDir, { recursive: true });
        }
    }

    public async saveOutput(data: string, type: 'text' | 'image' | 'video'): Promise<string | null> {
        try {
            const fileId = uuidv4();
            let ext = '.txt';
            let buffer: Buffer;

            if (type === 'image' && data.startsWith('data:image')) {
                const parts = data.split(',');
                if (parts.length !== 2) return null;
                const match = parts[0].match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
                if (match && match[1]) {
                    ext = '.' + match[1].split('/')[1];
                } else {
                    ext = '.png';
                }
                buffer = Buffer.from(parts[1], 'base64');
            } else if (type === 'video') {
                buffer = Buffer.from(data, 'utf-8'); // E.g. operation ID
                ext = '.txt';
            } else {
                buffer = Buffer.from(data, 'utf-8');
                ext = '.txt';
            }

            const fileName = `${fileId}${ext}`;
            const filePath = path.join(this.storageDir, fileName);
            fs.writeFileSync(filePath, buffer);

            const stats = fs.statSync(filePath);
            if (stats.size === 0) {
                fs.unlinkSync(filePath);
                return null;
            }

            // Return relative URL for static serving
            return `/uploads/${fileName}`;
        } catch (error) {
            console.error("StorageAdapter save error:", error);
            return null;
        }
    }
}

export const globalStorageAdapter = new StorageAdapterService();
