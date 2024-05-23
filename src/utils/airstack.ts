import { init, fetchQuery } from "@airstack/node";
import { airStackKey, currentDateGreaterThan } from "./constants";

init(airStackKey);

type QueryResponse = {
    data: Data;
    error: Error;
};

type DegenQueryResponse = {
    data: DegenQueryData;
    error: Error;
};

interface DegenQueryData {
    FarcasterReplies: {
        Reply: ReplyItem[];
    };
}

interface ReplyItem {
    castedAtTimestamp: string;
    url: string;
    text: string;
    hash: string;
}

interface Data {
    Socials: {
        Social: {
            profileName: string;
        }[];
    };
}

const query = (fid: string) => `query MyQuery {
       Socials(input: {filter: {dappName: { _eq: farcaster }, identity: { _eq: "fc_fid:${fid}" } }
           blockchain: ethereum}) {
       Social {
         profileName
       }
     }
   }`;

const degenQuery = (fid: string) => `query MyQuery {
       FarcasterReplies(
        input: {
          filter: {
             repliedBy: {_eq: "fc_fid:${fid}"}
          },
          blockchain: ALL
        }
      ) {
        Reply{
        castedAtTimestamp
          url
          hash
          text
        }
      }
    }`;

export const getQuery = async (castId: number) => {
    const { data, error }: QueryResponse = await fetchQuery(
        query(castId.toString()),
    );

    return { data, error };
};

export const getDegenQuery = async (fid: string) => {
    let totalUsed = 0;

    const { data, error }: DegenQueryResponse = await fetchQuery(
        degenQuery(fid),
    );

    const replyData = data.FarcasterReplies.Reply;

    const filteredCasts = replyData
        .filter((cast) => cast.text.toLowerCase().includes("$degen"))
        .filter(
            (cast) =>
                new Date(cast.castedAtTimestamp).toUTCString() >=
                currentDateGreaterThan.toUTCString(),
        );

    console.log(filteredCasts);

    filteredCasts.forEach((cast) => {
        const degenMatch = cast.text.match(/\b\d+\b\s\$degen/gi);
        const degenValue = degenMatch ? degenMatch[0] : "0 $degen";

        totalUsed += parseInt(degenValue);
    });

    console.log("totalUsed -->", totalUsed);

    return { totalUsed, error };
};
