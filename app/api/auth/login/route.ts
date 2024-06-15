import { mockUser } from "@/mock-data";
import { encrypt } from "@/utils/auth";
import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { email, password: decryptedPassword } = (await req.json()) as {
    email: string;
    password: string;
  };

  const password = encrypt(decryptedPassword);

  // const user = null
  const user = mockUser;

  // await executeDBQuery(`DELETE * from product WHERE id_product = ${id}`)

  return Response.json({ status: user ? "success" : "error", user });
}
