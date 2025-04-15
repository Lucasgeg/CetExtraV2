import { Role } from "@/store/types";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Role;
    };
  }
}
