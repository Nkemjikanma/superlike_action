import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import "dotenv/config";
import { prismadb } from "./prismadb";

export const getYesterdaysDate = () => {
    const yesterday = new Date();
    yesterday.setUTCHours(7, 35, 0, 0);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    return yesterday;
};

export const getTodaysDate = () => {
    const today = new Date();
    today.setUTCHours(7, 35, 0, 0);
    return today;
};

// if time of today has passed 7:35 AM, then we get date and time of today.
// if time of today has not passed 7:35 AM, then we get date and time of yesterday.

const now = new Date();
export const currentDateGreaterThan =
    now.getUTCHours() >= 7 && now.getUTCMinutes() > 35
        ? getTodaysDate()
        : getYesterdaysDate();

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
