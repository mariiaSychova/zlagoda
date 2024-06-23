import axios from "axios";
import { TReceipt } from "@/types";
import { formatDateFull } from "@/utils/formatDate";

export const getAllReceiptsInnerRoute = async (): Promise<TReceipt[]> => {
  const response = await axios.get("/api/receipt/get-all");
  const receipts = response.data as TReceipt[];

  const formattedReceipts = receipts.map((receipt) => ({
    ...receipt,
    print_date: formatDateFull(receipt.print_date),
  }));

  return formattedReceipts;
};

export const createReceiptInnerRoute = async (
  data: Partial<TReceipt>
): Promise<void> => {
  await axios.post("/api/receipt/create", data);
};

export const updateReceiptInnerRoute = async (
  data: TReceipt
): Promise<void> => {
  await axios.put("/api/receipt/update", data);
};

export const deleteReceiptInnerRoute = async (
  check_number: string
): Promise<void> => {
  await axios.delete("/api/receipt/delete", { data: { check_number } });
};

export const getReceiptByNumInnerRoute = async (
  checkNumber: string
): Promise<TReceipt> => {
  const response = await axios.post("/api/receipt/get-by-num", { checkNumber });
  return response.data;
};
