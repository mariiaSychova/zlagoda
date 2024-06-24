"use client";
import React, { useState } from "react";
import { Box, FormControl, Button, TextField } from "@mui/material";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import axios from "axios";
import { formatDate } from "@/utils/formatDate";

interface Receipt {
  check_number: string;
  print_date: string;
  sum_total: number;
  vat: number;
  empl_surname: string;
  product_name: string;
  product_number: number;
  selling_price: number;
}

const Table2 = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [showTable, setShowTable] = useState(false);

  const fetchReceipts = async () => {
    if (startDate && endDate) {
      const data = await getReceipts(startDate, endDate);
      if (data) {
        setReceipts(data);
        setShowTable(true);
      }
    }
  };

  const columns: MRT_ColumnDef<Receipt>[] = [
    { header: "Номер чека", accessorKey: "check_number" },
    {
      header: "Дата друку",
      accessorKey: "print_date",
      Cell: ({ cell }) => formatDate(cell.getValue<string>()),
    },
    { header: "Загальна сума", accessorKey: "sum_total" },
    { header: "ПДВ", accessorKey: "vat" },
    { header: "Прізвище касира", accessorKey: "empl_surname" },
    { header: "Назва товару", accessorKey: "product_name" },
    { header: "Кількість товару", accessorKey: "product_number" },
    { header: "Ціна продажу", accessorKey: "selling_price" },
  ];

  const table = useMaterialReactTable({
    columns: columns,
    data: receipts,
  });

  return (
    <Box sx={{ padding: 4 }}>
      <Box sx={{ display: "flex", gap: 2, marginBottom: 4 }}>
        <TextField
          label="Початкова дата"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <TextField
          label="Кінцева дата"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <Button variant="contained" onClick={fetchReceipts}>
          Отримати дані
        </Button>
      </Box>

      {showTable && <MaterialReactTable table={table} />}
    </Box>
  );
};

const getReceipts = async (
  startDate: string,
  endDate: string
): Promise<Receipt[]> => {
  try {
    const response = await axios.post("/api/receipt/get-receipts-for-period", {
      startDate,
      endDate,
    });
    return response.data;
  } catch (error) {
    console.error("Помилка виконання запиту", error);
    return [];
  }
};

export default Table2;
