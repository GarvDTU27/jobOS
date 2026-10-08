import { auth } from "./auth";
import { AuthError } from "../utils/errors";

/**
 * Retrieves the current session. Throws AuthError if not authenticated.
 * @returns {Promise<import("next-auth").Session>}
 */
export async function getSessionOrThrow() {
  const session = await auth();
  if (!session || !session.user) {
    throw new AuthError("You must be logged in to access this resource");
  }
  return session;
}
