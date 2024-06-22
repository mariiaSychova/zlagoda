import axios from "axios";
import { TSell } from "@/types";

export const getAllSalesForReceiptInnerRoute = async (
  check_number: string
): Promise<TSell[]> => {
  const response = await axios.post("/api/sell/get-all-for-receipt", {
    check_number,
  });
  return response.data;
};

export const createSaleInnerRoute = async (data: TSell): Promise<void> => {
  await axios.post("/api/sell/create", data);
};

export const updateSaleInnerRoute = async (data: TSell): Promise<void> => {
  await axios.put("/api/sell/update", data);
};

export const deleteSaleInnerRoute = async (
  upc: string,
  check_number: string
): Promise<void> => {
  await axios.delete("/api/sell/delete", { data: { upc, check_number } });
};
