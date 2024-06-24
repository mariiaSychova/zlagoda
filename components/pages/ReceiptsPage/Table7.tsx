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
  Typography,
} from "@mui/material";
import axios from "axios";
import { getAllCashiersForDisplay } from "@/API/employee";
import { TEmployeeForDisplay } from "@/types";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";

interface Receipt {
  check_number: string;
  print_date: string;
  sum_total: number;
  vat: number;
}

const Table7 = () => {
  const [cashiers, setCashiers] = useState<TEmployeeForDisplay[]>([]);
  const [selectedCashier, setSelectedCashier] = useState<string | null>(null);
  const [date, setDate] = useState<string>("");
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
    if (selectedCashier && date) {
      const data = await getReceiptsByCashierAndDate(selectedCashier, date);
      if (data) {
        setReceipts(data);
        setShowTable(true);
      }
    }
  };

  const columns: MRT_ColumnDef<Receipt>[] = [
    { header: "Номер чеку", accessorKey: "check_number" },
    { header: "Дата друку", accessorKey: "print_date" },
    { header: "Загальна сума", accessorKey: "sum_total" },
    { header: "ПДВ", accessorKey: "vat" },
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
              <MenuItem key={cashier.id_employee} value={cashier.empl_surname}>
                {cashier.empl_surname} {cashier.empl_name}{" "}
                {cashier.empl_patronymic} (ID: {cashier.id_employee})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Дата"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <Button variant="contained" onClick={fetchReceipts}>
          Отримати дані
        </Button>
      </Box>

      {showTable && <MaterialReactTable table={table} />}
    </Box>
  );
};

const getReceiptsByCashierAndDate = async (
  surname: string,
  date: string
): Promise<Receipt[]> => {
  try {
    const response = await axios.post(
      "/api/receipt/get-receipts-by-cashier-date",
      {
        surname,
        date,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Помилка виконання запиту", error);
    return [];
  }
};

export default Table7;
