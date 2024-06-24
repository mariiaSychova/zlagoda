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

const Table3 = () => {
  const [cashiers, setCashiers] = useState<TEmployeeForDisplay[]>([]);
  const [selectedCashier, setSelectedCashier] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [totalSales, setTotalSales] = useState<number | null>(null);

  useEffect(() => {
    const fetchCashiers = async () => {
      const data = await getAllCashiersForDisplay();
      setCashiers(data);
    };
    fetchCashiers();
  }, []);

  const fetchTotalSales = async () => {
    if (selectedCashier && startDate && endDate) {
      const data = await getTotalSales(selectedCashier, startDate, endDate);
      if (data) {
        setTotalSales(data.total_sales);
      }
    }
  };

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

        <Button variant="contained" onClick={fetchTotalSales}>
          Отримати дані
        </Button>
      </Box>

      {totalSales !== null && (
        <Typography variant="h6">
          Загальна сума продажів: {totalSales} грн
        </Typography>
      )}
    </Box>
  );
};

const getTotalSales = async (
  id_employee: string,
  startDate: string,
  endDate: string
): Promise<{ total_sales: number }> => {
  try {
    const response = await axios.post("/api/receipt/get-total-sales", {
      id_employee,
      startDate,
      endDate,
    });
    return response.data;
  } catch (error) {
    console.error("Помилка виконання запиту", error);
    return { total_sales: 0 };
  }
};

export default Table3;
