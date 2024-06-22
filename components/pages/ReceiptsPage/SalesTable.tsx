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

import { TSell } from "@/types";
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

  if (!sell.selling_price) {
    newErrors.selling_price = "Це поле обов'язкове";
  }
  return newErrors;
};

interface SalesTableProps {
  selectedCheckNumber: string | "";
}

const SalesTable: React.FC<SalesTableProps> = ({ selectedCheckNumber }) => {
  const [sells, setSells] = useState<TSell[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  useEffect(() => {
    const fetchSales = async () => {
      if (selectedCheckNumber) {
        const data = await getAllSalesForReceiptInnerRoute(selectedCheckNumber);
        setSells(data);
      } else {
        setSells([]);
      }
    };
    fetchSales();
  }, [selectedCheckNumber]);

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
        ...defaultColumnProps("upc", true, true),
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
        size: 160,
        ...defaultColumnProps("selling_price", true, false),
        Cell: ({ cell }) => {
          const value = cell.getValue<number | string>();
          return formatValue(value);
        },
      },
    ];
  }, []);

  const handleCreateSell: MRT_TableOptions<TSell>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const errors = validateSell(values);
      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        return;
      }

      await createSaleInnerRoute(values);
      table.setCreatingRow(null);
      setSells(await getAllSalesForReceiptInnerRoute(selectedCheckNumber));
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

    await updateSaleInnerRoute(values);
    table.setEditingRow(null);
    setSells(await getAllSalesForReceiptInnerRoute(selectedCheckNumber));
  };

  const handleDeleteSell = async (row: MRT_Row<TSell>) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      await deleteSaleInnerRoute(row.original.upc, selectedCheckNumber);
      setSells(await getAllSalesForReceiptInnerRoute(selectedCheckNumber));
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
