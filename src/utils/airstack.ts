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

export const getQuery = async (castId: { fid: number }) => {
    const { data, error }: QueryResponse = await fetchQuery(
        query(castId.fid.toString()),
    );

    return { data, error };
};

export const getDegenQuery = async (fid: string) => {
    const { data, error }: DegenQueryResponse = await fetchQuery(
        degenQuery(fid),
    );

    return { data, error };
};
