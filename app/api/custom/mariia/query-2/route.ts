import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  const { category_name } = (await req.json()) as {
    category_name: string;
  };

  const result = await executeDBQuery(`
SELECT
    P.product_name,
    P.characteristics
FROM
    public.product AS P
WHERE
    NOT EXISTS (
        SELECT *
        FROM public.store_product AS SP
        WHERE SP.id_product = P.id_product AND SP.promotional_product = true
    )
    AND NOT EXISTS (
        SELECT *
        FROM public.category AS C
        WHERE C.category_number = P.category_number AND C.category_name = '${category_name}');
`);
  console.log(result);
  return Response.json(result || []);
}
