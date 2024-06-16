import { decrypt } from "@/utils/auth";
import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as {
    email: string;
    password: string;
  };

  const users = await executeDBQuery(`SELECT * from public.employee`);

  const user = users.find(
    (u: any) => u.email === email && decrypt(u.password) === password
  );

  return Response.json({ status: user ? "success" : "error", user });
}
