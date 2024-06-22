import axios from "axios";
import { TReceipt } from "@/types";

export const getAllReceiptsInnerRoute = async (): Promise<TReceipt[]> => {
  const response = await axios.get("/api/receipt/get-all");
  return response.data;
};

export const createReceiptInnerRoute = async (
  data: TReceipt
): Promise<void> => {
  await axios.post("/api/receipt/create", data);
};

export const updateReceiptInnerRoute = async (
  data: TReceipt
): Promise<void> => {
  await axios.put("/api/receipt/update", data);
};

export const deleteReceiptInnerRoute = async (id: string): Promise<void> => {
  await axios.delete("/api/receipt/delete", { data: { id } });
};
