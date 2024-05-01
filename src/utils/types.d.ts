type CreateSignerType = {
    signer_uuid: string;
    public_key: string;
    status: string;
    signer_approval_url?: string;
    fid?: number;
};

type GeneratedKey = {
    signer_uuid: string;
    public_key: string;
    status: string;
};
