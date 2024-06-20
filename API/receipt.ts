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
