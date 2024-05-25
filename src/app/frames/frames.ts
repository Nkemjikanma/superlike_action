import { createFrames } from "frames.js/next";
import { farcasterHubContext } from "frames.js/middleware";

export const frames = createFrames({
    basePath: "/frames",
    middleware: [
        farcasterHubContext({
            hubHttpUrl: "https://nemes.farcaster.xyz:2281",
        }),
    ],
});
