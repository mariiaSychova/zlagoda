import { TProduct, TProduct_Optional } from "@/types";
import axios from "axios";

export const getAllProductsInnerRoute = async (): Promise<TProduct[]> => {
  const data = await axios.get("/api/products/get-all");

  return data.data;
};

export const createProductInnerRoute = async (
  data: TProduct
): Promise<void> => {
  await axios.post("/api/products/create", data);
};

export const updateProductInnerRoute = async (
  id_product: number,
  data: TProduct_Optional
): Promise<void> => {
  await axios.post("/api/products/update", { id_product, data });
};

export const deleteProductInnerRoute = async (
  id_product: number
): Promise<void> => {
  await axios.post("/api/products/delete", { id_product });
};
