import { TReceipt } from "@/types";
import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const data = (await req.json()) as TReceipt;

  const result = await executeDBQuery(`
    SELECT MAX(check_number) AS last_check_number FROM public.receipt
  `);
  const lastCheckNumber = result[0]?.last_check_number ?? "0000000000";
  const nextCheckNumber = (parseInt(lastCheckNumber) + 1)
    .toString()
    .padStart(10, "0");

  const receipt: TReceipt = {
    check_number: nextCheckNumber,
    id_employee: data.id_employee!,
    card_number: data.card_number || "",
    print_date: new Date().toISOString(),
    sum_total: 0,
    vat: 0,
  };
  let query;
  if (receipt.card_number){
    query = `
    INSERT INTO public.receipt 
    (check_number, id_employee, card_number, print_date, sum_total, vat)
    VALUES 
    ('${receipt.check_number}',
     '${receipt.id_employee}',
     '${receipt.card_number}',
     '${receipt.print_date}',
     ${receipt.sum_total},
     ${receipt.vat})
  `
  }else{
    query = `
    INSERT INTO public.receipt 
    (check_number, id_employee, print_date, sum_total, vat)
    VALUES 
    ('${receipt.check_number}',
     '${receipt.id_employee}',
     '${receipt.print_date}',
     ${receipt.sum_total},
     ${receipt.vat})
  `
  }
  await executeDBQuery(query);

  return Response.json({ message: "Receipt created successfully" });
}
