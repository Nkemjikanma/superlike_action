import { fetchMetadata } from "frames.js/next";
import type { Metadata } from "next";

// forces refresh of next cache
export const dynamic = "force-dynamic";

// TODO: fix url to host
export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "PowerLike Action",
        description: "Don't just like, power like!",
        other: {
            ...(await fetchMetadata(
                new URL("/frames", "https://superlike-action.vercel.app"),
            )),
        },
    };
}

export default function Home() {
    return <div>Power like ⚡️</div>;
}
