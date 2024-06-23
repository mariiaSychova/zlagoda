import { executeDBQuery } from "@/utils/db";

export async function GET(req: Request) {
  const result =
    await executeDBQuery(`SELECT C.card_number, C.cust_name, C.cust_surname, C.cust_patronymic,
	(SELECT SUM(R.sum_total)
	FROM public.receipt AS R
	WHERE R.card_number = C.card_number) AS TotalAmountSpent,
	(SELECT COUNT(*)
     FROM public.sale AS S
     WHERE S.check_number IN 
		(SELECT R.check_number
		FROM public.receipt AS R
		WHERE R.card_number = C.card_number)) AS NumberOfItemsBought
FROM public.customer_card AS C
GROUP BY C.card_number, C.cust_name;`);

  return Response.json(result);
}
