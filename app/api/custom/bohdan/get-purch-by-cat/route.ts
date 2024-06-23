import { executeDBQuery } from "@/utils/db";

export async function POST(req: Request) {
  try {
    const { cardNumber } = await req.json();

    const purchasesByCategories = await getPurchasesByCategories(cardNumber);

    return new Response(JSON.stringify(purchasesByCategories), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
}

async function getPurchasesByCategories(cardNumber: string) {
  const query = `
    SELECT 
      cc.card_number, 
      cc.cust_name, 
      cc.cust_surname, 
      cc.cust_patronymic, 
      c.category_name, 
      SUM(pr.selling_price * pr.product_number) AS total_price
    FROM 
      customer_card cc
    INNER JOIN 
      receipt r ON cc.card_number = r.card_number
    INNER JOIN 
      sale pr ON r.check_number = pr.check_number
    INNER JOIN 
      store_product pis ON pr.upc = pis.upc
    INNER JOIN 
      product p ON pis.id_product = p.id_product
    INNER JOIN 
      category c ON c.category_number = p.category_number
    WHERE 
      cc.card_number = '${cardNumber}'
    GROUP BY 
      cc.card_number, 
      cc.cust_name, 
      cc.cust_surname, 
      cc.cust_patronymic, 
      c.category_name;
  `;

  try {
    const result = await executeDBQuery(query);
    return result;
  } catch (dbError) {
    console.error("Database query failed:", dbError);
    throw dbError;
  }
}
