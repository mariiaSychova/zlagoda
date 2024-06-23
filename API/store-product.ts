import axios from "axios";
import {
  TStoreProduct,
  TStoreProduct_Optional,
  TStoreProductForDisplay,
} from "@/types";

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

export const getAllStoreProductsForDisplayInnerRoute = async (): Promise<
  TStoreProductForDisplay[]
> => {
  const response = await axios.get("/api/store-product/get-all-for-display");
  return response.data;
};

export const updateStoreProductQuantity = async (
  upc: string,
  newQuantity: number
): Promise<void> => {
  await axios.put(`/api/store-product/update-quantity`, {
    upc,
    quantity: newQuantity,
  });
};
