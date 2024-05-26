import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import "dotenv/config";

// export const getYesterdaysDate = () => {
//     console.log("yesterday");

//     return yesterday;
// };

// export const getTodaysDate = () => {
//     console.log("today");
//     return today;
// };

export const currentDateGreaterThan = () => {
    const now = new Date();

    const today = new Date(now);
    today.setUTCHours(7, 35, 0, 0);

    const yesterday = new Date(today);
    yesterday.setUTCDate(today.getUTCDate() - 1);

    // Check if the current time is past 7:35 AM UTC today
    if (now >= today) {
        console.log("today");

        return today;
    } else {
        console.log("yesterday");
        return yesterday;
    }
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
