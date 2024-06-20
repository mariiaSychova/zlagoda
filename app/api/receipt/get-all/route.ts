import { executeDBQuery } from "@/utils/db";

export async function GET(req: Request) {
  const receipts = await executeDBQuery(`
    SELECT
      r.check_number,
      r.id_employee,
      r.card_number,
      r.print_date,
      r.sum_total,
      r.vat
    FROM public.receipt r
  `);

  for (const receipt of receipts) {
    const products = await executeDBQuery(`
      SELECT
        s.upc,
        s.product_number,
        s.selling_price
      FROM public.sell s
      WHERE s.check_number = '${receipt.check_number}'
    `);

    receipt.products = products;
  }

  return Response.json(receipts);
}
