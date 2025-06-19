import NextAuth from "next-auth";
import { authOptions } from "@/auth";

export default NextAuth(authOptions);

// If you are using older versions of Next.js, you may need to do this:
// export const { GET, POST } = handlers; 