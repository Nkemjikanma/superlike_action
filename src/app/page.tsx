import { fetchMetadata } from "frames.js/next";
import type { Metadata } from "next";

// forces refresh of next cache
export const dynamic = "force-dynamic";

// TODO: fix url to host
export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Tipmark Action",
        description: "Save casts to tip later!",
        other: {
            ...(await fetchMetadata(
                new URL("/frames", "https://superlike-action.vercel.app"),
            )),
        },
    };
}

export default function Home() {
    return <div>Tipmark ⚡️</div>;
}
