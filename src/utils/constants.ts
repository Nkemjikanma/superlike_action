import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import "dotenv/config";

const degenTime = new Date();
export const startTime = degenTime.setHours(0, 0, 0, 0);
export const endTime = degenTime.setHours(23, 59, 59, 999);

export class HttpError extends Error {
    constructor(public response: Response) {
        super(`HTTP error: ${response.status}`);
    }
}

export const airStackKey = process.env.AIRSTACK_KEY!;
export const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);
