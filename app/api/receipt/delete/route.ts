import { executeDBQuery } from "@/utils/db";

export async function DELETE(req: Request) {
  const { id } = (await req.json()) as { id: string };

  await executeDBQuery(`
    DELETE FROM public.receipt
    WHERE id = ${id}
  `);

  return Response.json({ message: "Receipt deleted successfully" });
}
