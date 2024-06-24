"use client";
import React, { useState } from "react";
import { Box, FormControl, Button, TextField, Typography } from "@mui/material";
import {
  MaterialReactTable,
  MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import axios from "axios";

interface TotalSales {
  empl_surname: string;
  total_sales: number;
}

const Table4 = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [totalSales, setTotalSales] = useState<TotalSales[]>([]);
  const [showTable, setShowTable] = useState(false);

  const fetchTotalSales = async () => {
    if (startDate && endDate) {
      const data = await getTotalSales(startDate, endDate);
      if (data) {
        setTotalSales(data);
        setShowTable(true);
      }
    }
  };

  const columns: MRT_ColumnDef<TotalSales>[] = [
    { header: "Прізвище касира", accessorKey: "empl_surname" },
    { header: "Загальна сума продажів", accessorKey: "total_sales" },
  ];

  const table = useMaterialReactTable({
    columns: columns,
    data: totalSales,
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

        <Button variant="contained" onClick={fetchTotalSales}>
          Отримати дані
        </Button>
      </Box>

      {showTable && <MaterialReactTable table={table} />}
    </Box>
  );
};

const getTotalSales = async (
  startDate: string,
  endDate: string
): Promise<TotalSales[]> => {
  try {
    const response = await axios.post("/api/receipt/get-total-sales-all", {
      startDate,
      endDate,
    });
    return response.data;
  } catch (error) {
    console.error("Помилка виконання запиту", error);
    return [];
  }
};

export default Table4;
