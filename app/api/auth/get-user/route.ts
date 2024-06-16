import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { id } = (await req.json()) as { id: string };

  const users = await executeDBQuery(`SELECT * from public.employee`);

  const user = users.find((u: any) => u.id_employee === id);

  return Response.json(user);
}
