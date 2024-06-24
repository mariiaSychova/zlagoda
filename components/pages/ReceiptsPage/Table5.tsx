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
import { getAllStoreProductsForDisplayInnerRoute } from "@/API/store-product";
import { TStoreProductForDisplay } from "@/types";

interface TotalQuantity {
  product_name: string;
  total_quantity_sold: number;
}

const Table5 = () => {
  const [products, setProducts] = useState<TStoreProductForDisplay[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [totalQuantity, setTotalQuantity] = useState<TotalQuantity | null>(
    null
  );

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getAllStoreProductsForDisplayInnerRoute();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  const fetchTotalQuantity = async () => {
    if (selectedProduct && startDate && endDate) {
      const data = await getTotalQuantity(selectedProduct, startDate, endDate);
      if (data) {
        setTotalQuantity(data);
      }
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Box sx={{ display: "flex", gap: 2, marginBottom: 4 }}>
        <FormControl fullWidth>
          <InputLabel id="product-select-label">Виберіть товар</InputLabel>
          <Select
            labelId="product-select-label"
            value={selectedProduct || ""}
            onChange={(e) => setSelectedProduct(e.target.value as string)}
            label="Виберіть товар"
          >
            {products.map((product) => (
              <MenuItem key={product.upc} value={product.upc}>
                UPC:{product.upc} | {product.product_name} ({product.producer}){" "}
                {product.characteristics}
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

        <Button variant="contained" onClick={fetchTotalQuantity}>
          Отримати дані
        </Button>
      </Box>

      {totalQuantity && (
        <Typography variant="h6">
          Загальна кількість проданих одиниць товару "
          {totalQuantity.product_name}": {totalQuantity.total_quantity_sold} шт
        </Typography>
      )}
    </Box>
  );
};

const getTotalQuantity = async (
  upc: string,
  startDate: string,
  endDate: string
): Promise<TotalQuantity> => {
  try {
    const response = await axios.post("/api/receipt/get-total-quantity", {
      upc,
      startDate,
      endDate,
    });
    return response.data;
  } catch (error) {
    console.error("Помилка виконання запиту", error);
    return { product_name: "", total_quantity_sold: 0 };
  }
};

export default Table5;
