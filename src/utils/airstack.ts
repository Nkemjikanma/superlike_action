import { init, fetchQuery } from "@airstack/node";
import { currentDateGreaterThan, airStackKey } from "./constants";

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

const degenQuery = (fid: string, date: Date) => `query MyQuery {
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

export const getQuery = async (castId: { fid: number }) => {
    const { data, error }: QueryResponse = await fetchQuery(
        query(castId.fid.toString()),
    );

    return { data, error };
};

export const getDegenQuery = async (fid: string) => {
    let totalUsed = 0;

    const { data, error }: DegenQueryResponse = await fetchQuery(
        degenQuery(fid, new Date(currentDateGreaterThan)),
    );

    const castData = data.FarcasterReplies.Reply;

    const filteredCasts = castData
        .filter(
            (cast) =>
                new Date(cast.castedAtTimestamp).toISOString() >=
                new Date(currentDateGreaterThan).toISOString(),
        )
        .filter((cast) => cast.text.toLowerCase().includes("$degen"));

    console.log("filteredCasts -->", filteredCasts);

    filteredCasts.forEach((cast) => {
        const degenMatch = cast.text.match(/\b\d+\b\s\$degen/gi);
        const degenValue = degenMatch ? degenMatch[0] : "0 $degen";

        totalUsed += parseInt(degenValue);
    });

    console.log("totalUsed -->", totalUsed);

    return { totalUsed, error };
};