"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";
import axios from "axios";
import { getAllReceiptsInnerRoute } from "@/API/receipt";
import { TReceipt } from "@/types";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import { formatDateFull } from "@/utils/formatDate";

interface ReceiptDetail {
  check_number: string;
  print_date: string;
  sum_total: number;
  vat: number;
  empl_surname: string;
  card_number: string | null;
  cust_surname: string | null;
  product_name: string;
  selling_price: number;
  product_number: number;
}

const Table6 = () => {
  const [receipts, setReceipts] = useState<TReceipt[]>([]);
  const [selectedCheckNumber, setSelectedCheckNumber] = useState<string | null>(
    null
  );
  const [receiptDetails, setReceiptDetails] = useState<ReceiptDetail[]>([]);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const fetchReceipts = async () => {
      const data = await getAllReceiptsInnerRoute();
      setReceipts(data);
    };
    fetchReceipts();
  }, []);

  const fetchReceiptDetails = async () => {
    if (selectedCheckNumber) {
      const data = await getReceiptDetails(selectedCheckNumber);
      if (data) {
        setReceiptDetails(data);
        setShowTable(true);
      }
    }
  };

  const columns: MRT_ColumnDef<ReceiptDetail>[] = [
    { header: "Номер чеку", accessorKey: "check_number" },
    {
      header: "Дата друку",
      accessorKey: "print_date",
      Cell: ({ cell }) => formatDateFull(cell.getValue<string>()),
    },
    { header: "Загальна сума", accessorKey: "sum_total" },
    { header: "ПДВ", accessorKey: "vat" },
    { header: "Прізвище касира", accessorKey: "empl_surname" },
    { header: "Номер картки клієнта", accessorKey: "card_number" },
    { header: "Прізвище клієнта", accessorKey: "cust_surname" },
    { header: "Назва товару", accessorKey: "product_name" },
    { header: "Ціна продажу", accessorKey: "selling_price" },
    { header: "Кількість товару", accessorKey: "product_number" },
  ];

  const table = useMaterialReactTable({
    columns: columns,
    data: receiptDetails,
  });

  return (
    <Box sx={{ padding: 4 }}>
      <Box sx={{ display: "flex", gap: 2, marginBottom: 4 }}>
        <FormControl fullWidth>
          <InputLabel id="check-number-select-label">
            Виберіть номер чеку
          </InputLabel>
          <Select
            labelId="check-number-select-label"
            value={selectedCheckNumber || ""}
            onChange={(e) => setSelectedCheckNumber(e.target.value as string)}
            label="Виберіть номер чеку"
          >
            {receipts.map((receipt) => (
              <MenuItem key={receipt.check_number} value={receipt.check_number}>
                {receipt.check_number}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={fetchReceiptDetails}>
          Отримати дані
        </Button>
      </Box>

      {showTable && <MaterialReactTable table={table} />}
    </Box>
  );
};

const getReceiptDetails = async (
  checkNumber: string
): Promise<ReceiptDetail[]> => {
  try {
    const response = await axios.post("/api/receipt/get-receipt-details", {
      checkNumber,
    });
    return response.data;
  } catch (error) {
    console.error("Помилка виконання запиту", error);
    return [];
  }
};

export default Table6;
