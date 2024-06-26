"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
} from "@mui/material";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import { getAllCashiersForDisplay } from "@/API/employee";
import { TEmployeeForDisplay } from "@/types";
import axios from "axios";
import { formatDateFull } from "@/utils/formatDate";
interface Receipt {
  check_number: string;
  print_date: string;
  sum_total: number;
  vat: number;
  product_name: string;
  product_number: number;
  selling_price: number;
}

const Table1 = () => {
  const [cashiers, setCashiers] = useState<TEmployeeForDisplay[]>([]);
  const [selectedCashier, setSelectedCashier] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const fetchCashiers = async () => {
      const data = await getAllCashiersForDisplay();
      setCashiers(data);
    };
    fetchCashiers();
  }, []);

  const fetchReceipts = async () => {
    if (selectedCashier && startDate && endDate) {
      const data = await getReceipts(selectedCashier, startDate, endDate);
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
      Cell: ({ cell }) => formatDateFull(cell.getValue<string>()),
    },
    { header: "Загальна сума", accessorKey: "sum_total" },
    { header: "ПДВ", accessorKey: "vat" },
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
        <FormControl fullWidth>
          <InputLabel id="cashier-select-label">Виберіть касира</InputLabel>
          <Select
            labelId="cashier-select-label"
            value={selectedCashier || ""}
            onChange={(e) => setSelectedCashier(e.target.value as string)}
            label="Виберіть касира"
          >
            {cashiers.map((cashier) => (
              <MenuItem key={cashier.id_employee} value={cashier.id_employee}>
                {cashier.empl_surname} {cashier.empl_name}{" "}
                {cashier.empl_patronymic} (ID: {cashier.id_employee})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
  id_employee: string,
  startDate: string,
  endDate: string
): Promise<Receipt[]> => {
  try {
    const response = await axios.post("/api/receipt/get-receipts-for-cashier", {
      id_employee,
      startDate,
      endDate,
    });
    return response.data;
  } catch (error) {
    console.error("Помилка виконання запиту", error);
    return [];
  }
};

export default Table1;
