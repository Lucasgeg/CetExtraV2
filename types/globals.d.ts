import { EnumRole } from "@/store/types";

declare global {
  interface CustomJwtSessionClaims {
    publicMetadata: {
      role?: EnumRole;
    };
  }
}
