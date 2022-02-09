export function toBase64(string: string): string{
    return Buffer.from(string).toString("base64");
}

export function toUtf8(string: string): string{
    return Buffer.from(string, "base64").toString("utf-8");
}