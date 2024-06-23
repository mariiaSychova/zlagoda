"use client";
import { useState, useEffect, useMemo } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  useMaterialReactTable,
  type MRT_TableOptions,
} from "material-react-table";

import { Box, Button, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  getAllSalesForReceiptInnerRoute,
  createSaleInnerRoute,
  updateSaleInnerRoute,
  deleteSaleInnerRoute,
} from "@/API/sale";

import {
  getAllStoreProductsForDisplayInnerRoute,
  updateStoreProductQuantity,
} from "@/API/store-product";
import {
  getReceiptByNumInnerRoute,
  updateReceiptInnerRoute,
} from "@/API/receipt";
import { getCustomerDiscountByNumInnerRoute } from "@/API/customer-card";

import { TSell, TStoreProductForDisplay, TReceipt } from "@/types";
import { formatValue } from "@/utils/formatNumber";

const validateSell = (sell: Partial<TSell>): { [key: string]: string } => {
  const newErrors: { [key: string]: string } = {};

  if (!sell.upc) {
    newErrors.upc = "Це поле обов'язкове";
  }
  if (
    sell.product_number?.toString() === "" ||
    sell.product_number === undefined ||
    sell.product_number === null
  ) {
    newErrors.product_number = "Кількість обов'язкова.";
  } else if (isNaN(sell.product_number)) {
    newErrors.product_number = "Кількість має бути числом.";
  } else if (sell.product_number <= 0) {
    newErrors.product_number = "Кількість має бути додатнім числом.";
  }
  return newErrors;
};

interface SalesTableProps {
  selectedCheckNumber: string | "";
  onUpdateReceipts: () => void;
}

const SalesTable: React.FC<SalesTableProps> = ({
  selectedCheckNumber,
  onUpdateReceipts,
}) => {
  const [sells, setSells] = useState<TSell[]>([]);
  const [price, setPrice] = useState<Number>();
  const [products, setProducts] = useState<TStoreProductForDisplay[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const fetchSales = async () => {
    if (selectedCheckNumber) {
      const data = await getAllSalesForReceiptInnerRoute(selectedCheckNumber);
      setSells(data);
    } else {
      setSells([]);
    }
  };
  useEffect(() => {
    fetchSales();
  }, [selectedCheckNumber]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getAllStoreProductsForDisplayInnerRoute();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  const updateReceiptAndProduct = async (
    checkNumber: string,
    sell: TSell,
    operation: "add" | "update" | "delete"
  ) => {
    const receipt: TReceipt = await getReceiptByNumInnerRoute(checkNumber);
    const product = products.find((p) => p.upc === sell.upc);

    if (!product) {
      throw new Error("Product not found");
    }

    if (
      operation !== "delete" &&
      sell.product_number > product.products_number
    ) {
      throw new Error("Insufficient product quantity in store");
    }
    const customerDiscountResponce = receipt.card_number
      ? await getCustomerDiscountByNumInnerRoute(receipt.card_number)
      : 0;

    const customerDiscount = parseFloat(customerDiscountResponce.percent) || 0;
    const receiptTotal = parseFloat(receipt.sum_total.toString());
    const sellingPrice = parseFloat(sell.selling_price.toString());
    const productNumber = parseInt(sell.product_number.toString(), 10) || 0;

    if (operation === "add" || operation === "update") {
      const newTotal =
        Math.round(
          (receiptTotal +
            sellingPrice * productNumber * (1 - customerDiscount / 100)) *
            10000
        ) / 10000;
      const newVat = Math.round(newTotal * 0.2 * 10000) / 10000;
      await updateReceiptInnerRoute({
        ...receipt,
        sum_total: newTotal,
        vat: newVat,
      });

      await updateStoreProductQuantity(
        sell.upc,
        product.products_number - productNumber
      );
    }

    if (operation === "delete") {
      const newTotal =
        Math.round(
          (receiptTotal -
            sellingPrice * productNumber * (1 - customerDiscount / 100)) *
            10000
        ) / 10000;
      const newVat = Math.round(newTotal * 0.2 * 10000) / 10000;

      await updateReceiptInnerRoute({
        ...receipt,
        sum_total: newTotal,
        vat: newVat,
      });
      await updateStoreProductQuantity(
        sell.upc,
        product.products_number + productNumber
      );
    }
  };

  const sellColumns = useMemo<MRT_ColumnDef<TSell>[]>(() => {
    const defaultColumnProps = (
      field: string,
      required: boolean = true,
      editable = false
    ) => ({
      muiEditTextFieldProps: {
        required,
        error: !!validationErrors?.[field],
        helperText: validationErrors?.[field],
        onFocus: () =>
          setValidationErrors((prev) => ({
            ...prev,
            [field]: undefined,
          })),
        InputProps: {
          readOnly: !editable,
        },
      },
    });

    return [
      {
        accessorKey: "upc",
        header: "UPC",
        size: 160,
        muiEditTextFieldProps: (params) => ({
          required: true,
          error: !!validationErrors?.["upc"],
          helperText: validationErrors?.["upc"],
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              upc: undefined,
            })),
          select: true,
          onChange: (event) => {
            const selectedUpc = event.target.value;
            const selectedProduct = products.find(
              (product) => product.upc === selectedUpc
            );

            if (selectedProduct) {
              params.row.original.selling_price = selectedProduct.selling_price;
              setPrice(selectedProduct.selling_price);

              setSells((prevSells) =>
                prevSells.map((sell) =>
                  sell.upc === selectedUpc
                    ? { ...sell, selling_price: selectedProduct.selling_price }
                    : sell
                )
              );
            }
          },
        }),
        editSelectOptions: products.map((product) => ({
          value: product.upc,
          text: `UPC:${product.upc} | ${product.product_name} (${product.producer}) ${product.characteristics} ${product.selling_price}`,
        })),
      },
      {
        accessorKey: "product_number",
        header: "Кількість",
        size: 160,
        ...defaultColumnProps("product_number", true, true),
      },
      {
        accessorKey: "selling_price",
        header: "Ціна продажу",
        enableEditing: false,
        size: 160,
        ...defaultColumnProps("selling_price", true, false),
        Cell: ({ cell }) => {
          const value = cell.getValue<number | string>();
          return formatValue(value);
        },
      },
    ];
  }, [products, validationErrors]);

  const handleCreateSell: MRT_TableOptions<TSell>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const errors = validateSell(values);
      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        return;
      }
      values.selling_price = price;
      values.check_number = selectedCheckNumber;
      try {
        await updateReceiptAndProduct(selectedCheckNumber, values, "add");
        await createSaleInnerRoute(values);
        table.setCreatingRow(null);
        await fetchSales();
        onUpdateReceipts();
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        } else {
          console.error(error);
        }
      }
    };

  const handleSaveSell: MRT_TableOptions<TSell>["onEditingRowSave"] = async ({
    values,
    table,
  }) => {
    const errors = validateSell(values);
    if (Object.keys(errors).length) {
      setValidationErrors(errors);
      return;
    }

    try {
      await updateReceiptAndProduct(selectedCheckNumber, values, "update");
      await updateSaleInnerRoute(values);
      table.setEditingRow(null);
      await fetchSales();
      onUpdateReceipts();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        console.error(error);
      }
    }
  };

  const handleDeleteSell = async (row: MRT_Row<TSell>) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        await updateReceiptAndProduct(
          selectedCheckNumber,
          row.original,
          "delete"
        );
        await deleteSaleInnerRoute(row.original.upc, selectedCheckNumber);
        await fetchSales();
        onUpdateReceipts();
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        } else {
          console.error(error);
        }
      }
    }
  };

  const sellTable = useMaterialReactTable({
    columns: sellColumns,
    data: sells,
    enableEditing: true,
    onCreatingRowSave: handleCreateSell,
    onEditingRowSave: handleSaveSell,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip arrow placement="left" title="Edit">
          <IconButton onClick={() => sellTable.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip arrow placement="right" title="Delete">
          <IconButton color="error" onClick={() => handleDeleteSell(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true);
          setValidationErrors({});
        }}
      >
        Додати
      </Button>
    ),
  });

  return <MaterialReactTable table={sellTable} />;
};

export default SalesTable;
