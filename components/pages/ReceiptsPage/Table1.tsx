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
import { DateRangePicker, DateRange } from "@mui/x-date-pickers-pro";
import { getAllCashiersForDisplay } from "@/API/employee";
import { TEmployeeForDisplay } from "@/types";
import axios from "axios";

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
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
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
    if (selectedCashier && dateRange[0] && dateRange[1]) {
      const data = await getReceipts(
        selectedCashier,
        dateRange[0],
        dateRange[1]
      );
      if (data) {
        setReceipts(data);
        setShowTable(true);
      }
    }
  };

  const columns: MRT_ColumnDef<Receipt>[] = [
    { header: "Номер чека", accessorKey: "check_number" },
    { header: "Дата друку", accessorKey: "print_date" },
    { header: "Загальна сума", accessorKey: "sum_total" },
    { header: "ПДВ", accessorKey: "vat" },
    { header: "Назва товару", accessorKey: "product_name" },
    { header: "Кількість товару", accessorKey: "product_number" },
    { header: "Ціна продажу", accessorKey: "selling_price" },
  ];

  const table = useMaterialReactTable({
    columns: columns,
    data: receipts,
    renderDetailPanel: ({ row }) => (
      <Box>
        <h3>Куплені товари для чека {row.original.check_number}</h3>
        <Box
          key={row.original.check_number}
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <span>{row.original.product_name}</span>
          <span>{row.original.product_number}</span>
          <span>{row.original.selling_price}</span>
        </Box>
      </Box>
    ),
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

        <DateRangePicker<Date>
          startText="Початкова дата"
          endText="Кінцева дата"
          value={dateRange}
          onChange={(newValue) => setDateRange(newValue)}
          renderInput={(startProps, endProps) => (
            <>
              <TextField {...startProps} />
              <Box sx={{ mx: 2 }}>до</Box>
              <TextField {...endProps} />
            </>
          )}
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
  startDate: Date,
  endDate: Date
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
