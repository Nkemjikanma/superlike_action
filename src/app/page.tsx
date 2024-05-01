import { fetchMetadata } from "frames.js/next";
import type { Metadata } from "next";

// forces refresh of next cache
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "SuperLike Action",
        description: "Don't just like, super like!",
        other: {
            ...(await fetchMetadata(
                new URL("/frames", "https://superlike-action.vercel.app"),
            )),
        },
    };
}

export default function Home() {
    return <div>Super like</div>;
}
