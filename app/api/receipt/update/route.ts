import { executeDBQuery } from "@/utils/db";
import { TReceipt } from "@/types";

export async function PUT(req: Request) {
  const data = (await req.json()) as TReceipt;

  await executeDBQuery(`
    UPDATE public.receipt 
    SET
      id_employee = '${data.id_employee}',
      card_number = '${data.card_number || ""}',
      print_date = '${data.print_date}',
      sum_total = ${data.sum_total},
      vat = ${data.vat}
    WHERE 
      id = ${data.check_number}
  `);

  return Response.json({ message: "Receipt updated successfully" });
}
