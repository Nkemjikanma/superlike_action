import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import "dotenv/config";

export const currentDateGreaterThan = () => {
    const now = new Date();

    const today = new Date(now);
    today.setUTCHours(0, 0, 0, 0);

    return today;
};

// if time of today has passed 7:35 AM, then we get date and time of today.
// if time of today has not passed 7:35 AM, then we get date and time of yesterday.

const degenTime = new Date();
export const startTime = degenTime.setHours(7, 35, 0, 0); // 7:35 AM
export const endTime = degenTime.setHours(7, 59, 59, 999); // 7:59 AM

export class HttpError extends Error {
    constructor(public response: Response) {
        super(`HTTP error: ${response.status}`);
    }
}

export const airStackKey = process.env.AIRSTACK_KEY!;
export const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);
