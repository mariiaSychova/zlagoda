import axios from "axios";
import { TStoreProduct, TStoreProduct_Optional } from "@/types";

export const getAllStoreProductsInnerRoute = async (): Promise<
  TStoreProduct[]
> => {
  const response = await axios.get("/api/store-product/get-all");
  return response.data;
};

export const createStoreProductInnerRoute = async (
  data: TStoreProduct
): Promise<void> => {
  await axios.post("/api/store-product/create", data);
};

export const updateStoreProductInnerRoute = async (
  upc: string,
  data: TStoreProduct_Optional
): Promise<void> => {
  await axios.post("/api/store-product/update", { upc, data });
};

export const deleteStoreProductInnerRoute = async (
  upc: string
): Promise<void> => {
  await axios.post("/api/store-product/delete", { upc });
};
