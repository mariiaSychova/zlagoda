import { mockUser } from "@/mock-data";
import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { id } = (await req.json()) as { id: string };

  // const user = null
  const user = mockUser;

  // await executeDBQuery(`DELETE * from product WHERE id_product = ${id}`)

  return Response.json(user);
}
