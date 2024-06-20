import axios from "axios";
import { TStoreProduct, TStoreProduct_Optional } from "@/types";

export const getAllStoreProductsInnerRoute = async (): Promise<
  TStoreProduct[]
> => {
  const response = await axios.get("/api/store-products/get-all");
  return response.data;
};

export const createStoreProductInnerRoute = async (
  data: TStoreProduct
): Promise<void> => {
  await axios.post("/api/store-products/create", data);
};

export const updateStoreProductInnerRoute = async (
  id: number,
  data: TStoreProduct_Optional
): Promise<void> => {
  await axios.post("/api/store-products/update", { id, data });
};

export const deleteStoreProductInnerRoute = async (
  id: number
): Promise<void> => {
  await axios.post("/api/store-products/delete", { id });
};
