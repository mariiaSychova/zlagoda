import { executeDBQuery } from "@/utils/db";

export async function DELETE(req: Request) {
  const { check_number } = (await req.json()) as { check_number: string };

  await executeDBQuery(`
    DELETE FROM public.receipt
    WHERE check_number = '${check_number}'
  `);

  return Response.json({ message: "Receipt deleted successfully" });
}
