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
  onUpdateReceipts: (updating: boolean) => void;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const fetchSales = async (reload: boolean) => {
    if (selectedCheckNumber) {
      if (reload) setIsLoading(true);
      const data = await getAllSalesForReceiptInnerRoute(selectedCheckNumber);
      setSells(data);
      if (reload) setIsLoading(false);
    } else {
      setSells([]);
    }
  };
  useEffect(() => {
    fetchSales(true);
  }, [selectedCheckNumber]);

  useEffect(() => {
    fetchProducts();
  }, []);
  const fetchProducts = async () => {
    const data = await getAllStoreProductsForDisplayInnerRoute();
    setProducts(data);
  };
  const updateReceiptAndProduct = async (
    checkNumber: string,
    sell: TSell,
    operation: "add" | "update" | "delete"
  ) => {
    setIsSaving(true);
    const receipt: TReceipt = await getReceiptByNumInnerRoute(checkNumber);

    const updatedProducts = await getAllStoreProductsForDisplayInnerRoute();
    setProducts(updatedProducts);

    const product = updatedProducts.find((p) => p.upc === sell.upc);

    if (!product) {
      setIsSaving(false);
      throw new Error("Product not found");
    }

    if (
      operation !== "delete" &&
      sell.product_number > product.products_number
    ) {
      setIsSaving(false);
      throw new Error(`Недостатня кількість товару в магазині ${product.products_number}`);
    }
    const customerDiscountResponce = receipt.card_number
      ? await getCustomerDiscountByNumInnerRoute(receipt.card_number)
      : 0;

    const customerDiscount = parseFloat(customerDiscountResponce.percent) || 0;
    const receiptTotal = parseFloat(receipt.sum_total.toString());
    const sellingPrice = parseFloat(sell.selling_price.toString());
    const newProductNumber = parseInt(sell.product_number.toString(), 10) || 0;

    if (operation === "add") {
      const newTotal =
        Math.round(
          (receiptTotal +
            sellingPrice * newProductNumber * (1 - customerDiscount / 100)) *
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
        product.products_number - newProductNumber
      );

    }

    if (operation === "update"){
      const existingSell = sells.find(
          (s) => s.upc === sell.upc && s.check_number === checkNumber
      );
      if (!existingSell) {
        setIsSaving(false);
        throw new Error("Existing sale not found");
      }

      const existingProductNumber = parseInt(existingSell.product_number.toString(), 10);
      const productNumberDifference = newProductNumber - existingProductNumber;

      if (productNumberDifference > 0 && productNumberDifference > product.products_number) {
        throw new Error(
            `Недостатня кількість товару в магазині ${product.products_number}`
        );
      }

      const newTotal =
          Math.round(
              (receiptTotal +
                  sellingPrice * productNumberDifference * (1 - customerDiscount / 100)) *
              10000
          ) / 10000;
      const newVat = Math.round(newTotal * 0.2 * 10000) / 10000;

      await updateReceiptInnerRoute({
        ...receipt,
        sum_total: newTotal,
        vat: newVat,
      });

      const updatedProductNumber = product.products_number - productNumberDifference;
      // console.log("product.products_number",product.products_number);
      // console.log("productNumberDifference", productNumberDifference);
      // console.log("Updated product number", updatedProductNumber);

      await updateStoreProductQuantity(
          sell.upc,
          updatedProductNumber
      );
    }

    if (operation === "delete") {
      const newTotal =
        Math.round(
          (receiptTotal -
            sellingPrice * newProductNumber * (1 - customerDiscount / 100)) *
            10000
        ) / 10000;
      const newVat = Math.round(newTotal * 0.2 * 10000) / 10000;

      await updateReceiptInnerRoute({
        ...receipt,
        sum_total: newTotal,
        vat: newVat,
      });
    }
    setIsSaving(false);
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
        setIsSaving(true);
        await updateReceiptAndProduct(selectedCheckNumber, values, "add");
        await createSaleInnerRoute(values);
        table.setCreatingRow(null);
        await fetchSales(false);
        onUpdateReceipts(true);
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        } else {
          console.error(error);
        }
      }
      setIsSaving(false);
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
      setIsSaving(true);
      await updateReceiptAndProduct(selectedCheckNumber, values, "update");
      values.check_number = selectedCheckNumber;
      await updateSaleInnerRoute(values);
      table.setEditingRow(null);
      await fetchSales(false);
      onUpdateReceipts(true);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        console.error(error);
      }
    }
    setIsSaving(false);
  };

  const handleDeleteSell = async (row: MRT_Row<TSell>) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        setIsSaving(true);
        await updateReceiptAndProduct(
          selectedCheckNumber,
          row.original,
          "delete"
        );
        await deleteSaleInnerRoute(row.original.upc, selectedCheckNumber);
        await fetchSales(false);
        onUpdateReceipts(true);
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        } else {
          console.error(error);
        }
      }
      setIsSaving(false);
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
    state: {
      isLoading,
      isSaving,
      showProgressBars: isLoading || isSaving,
    },
  });

  return <MaterialReactTable table={sellTable} />;
};

export default SalesTable;
