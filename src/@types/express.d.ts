import { iSchemaUserModel } from "./user";

declare global {
    namespace Express {
      interface Request {
        decoded?: {
          username: string;
          sub?: string;
          jti?: string;
          iss?: string;
          aud?: string;
          client_id: string;
          scope?: [string];
          iat?: number;
          exp?: number;
        },
        highPermission?: {
          isAdmin: boolean;
          isModerator: boolean;
          charge: number;
        },
        su: boolean;
      }
    }
}