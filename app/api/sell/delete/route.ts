import { executeDBQuery } from "@/utils/db";

export async function DELETE(req: Request) {
  const { upc, check_number } = (await req.json()) as {
    upc: string;
    check_number: string;
  };

  await executeDBQuery(`
    DELETE FROM public.sale
    WHERE upc = '${upc}' AND check_number = '${check_number}'
  `);

  return Response.json({ message: "Sale record deleted successfully" });
}
