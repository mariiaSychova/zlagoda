"use client";
import { useState, useEffect, useMemo } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
} from "material-react-table";

import { Box, Button, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import {
  getAllReceiptsInnerRoute,
  createReceiptInnerRoute,
  updateReceiptInnerRoute,
  deleteReceiptInnerRoute,
} from "@/API/receipt";

import { getAllCustomerCardsForDisplayInnerRoute } from "@/API/customer-card";
import { getAllCashiersForDisplay } from "@/API/employee";
import {
  getAllSalesForReceiptInnerRoute,
  createSaleInnerRoute,
  updateSaleInnerRoute,
  deleteSaleInnerRoute,
} from "@/API/sale";

import {
  TCustomerCardForDisplay,
  TEmployeeForDisplay,
  TReceipt,
  TSell,
} from "@/types";

import { formatValue } from "@/utils/formatNumber";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { PageOrientation } from "pdfmake/interfaces";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const validateReceipt = (
  receipt: Partial<TReceipt>
): { [key: string]: string } => {
  const newErrors: { [key: string]: string } = {};

  if (!receipt.id_employee) {
    newErrors.id_employee = "Це поле обов'язкове";
  }
  return newErrors;
};

const ReceiptsPage = () => {
  const [receipts, setReceipts] = useState<TReceipt[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [cashiers, setCashiers] = useState<TEmployeeForDisplay[]>([]);
  const [customersCards, setCustomersCards] = useState<
    TCustomerCardForDisplay[]
  >([]);

  useEffect(() => {
    const fetchReceipts = async () => {
      const data = await getAllReceiptsInnerRoute();
      setReceipts(data);
    };
    fetchReceipts();
  }, []);

  useEffect(() => {
    const fetchCashiers = async () => {
      const data = await getAllCashiersForDisplay();
      setCashiers(data);
    };
    fetchCashiers();
  }, []);

  useEffect(() => {
    const fetchCustomersCards = async () => {
      const data = await getAllCustomerCardsForDisplayInnerRoute();
      setCustomersCards(data);
    };
    fetchCustomersCards();
  }, []);

  const columns = useMemo<MRT_ColumnDef<TReceipt>[]>(() => {
    const defaultColumnProps = (
      field: string,
      required: boolean = true,
      editable = true
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
        accessorKey: "check_number",
        header: "Номер чеку",
        enableEditing: false,
        size: 160,
        ...defaultColumnProps("check_number", true, false),
      },
      {
        accessorKey: "id_employee",
        header: "ID Касира",
        size: 160,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.["id_employee"],
          helperText: validationErrors?.["id_employee"],
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              id_employee: undefined,
            })),
          select: true,
        },
        editSelectOptions: cashiers.map((cashier) => ({
          value: cashier.id_employee,
          text: `ID:${cashier.id_employee} | ${cashier.empl_surname} ${cashier.empl_name} ${cashier.empl_patronymic}`,
        })),
      },
      {
        accessorKey: "card_number",
        header: "Номер картки клієнта",
        size: 160,
        muiEditTextFieldProps: {
          select: true,
        },
        editSelectOptions: customersCards.map((card) => ({
          value: card.card_number,
          text: `№${card.card_number} | ${card.cust_surname} ${
            card.cust_name
          } ${card.cust_patronymic || ""} | ${card.percent}%`,
        })),
      },
      {
        accessorKey: "print_date",
        header: "Дата створення",
        enableEditing: false,
        size: 160,
        ...defaultColumnProps("print_date", true, false),
      },
      {
        accessorKey: "sum_total",
        header: "Загальна сума",
        enableEditing: false,
        size: 140,
        ...defaultColumnProps("sum_total", true, false),
        Cell: ({ cell }) => {
          const value = cell.getValue<number | string>();
          return formatValue(value);
        },
      },
      {
        accessorKey: "vat",
        header: "ПДВ",
        enableEditing: false,
        size: 140,
        ...defaultColumnProps("vat", true, false),
        Cell: ({ cell }) => {
          const value = cell.getValue<number | string>();
          return formatValue(value);
        },
      },
    ];
  }, [validationErrors, isEditing]);

  const handleCreateReceipt: MRT_TableOptions<TReceipt>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const errors = validateReceipt(values);
      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        return;
      }

      await createReceiptInnerRoute(values);
      table.setCreatingRow(null);
      setReceipts(await getAllReceiptsInnerRoute());
    };

  const handleSaveReceipt: MRT_TableOptions<TReceipt>["onEditingRowSave"] =
    async ({ values, table }) => {
      const errors = validateReceipt(values);
      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        return;
      }

      await updateReceiptInnerRoute(values);
      table.setEditingRow(null);
      setReceipts(await getAllReceiptsInnerRoute());
    };

  const handleDeleteReceipt = async (row: MRT_Row<TReceipt>) => {
    if (window.confirm("Are you sure you want to delete this receipt?")) {
      await deleteReceiptInnerRoute(row.original.check_number);
      setReceipts(await getAllReceiptsInnerRoute());
    }
  };

  const handleExportRows = (rows: MRT_Row<TReceipt>[]) => {
    const tableData = sanitizeData(
      rows.map((row) => Object.values(row.original))
    );

    const tableHeaders = sanitizeData([columns.map((c) => c.header || "")])[0];

    const docDefinition = {
      header: {
        text: `Receipt Report - ${new Date().toLocaleDateString()}`,
        fontSize: 12,
      },
      footer: (currentPage: number, pageCount: number) => ({
        text: `Page ${currentPage} of ${pageCount}`,
        fontSize: 10,
      }),
      content: [
        {
          table: {
            headerRows: 1,
            widths: ["15%", "10%", "10%", "20%", "15%", "15%"],
            body: [tableHeaders, ...tableData],
          },
          fontSize: 10,
        },
      ],
    };

    const name: string = `receipts_report_${new Date().toLocaleDateString()}.pdf`;
    pdfMake.createPdf(docDefinition).download(name);
  };

  const sanitizeData = (data: any) => {
    return data.map((row: any) => {
      return row.map((cell: any) => {
        if (cell === null || cell === undefined) return "";
        if (typeof cell === "object") return JSON.stringify(cell);
        return cell;
      });
    });
  };

  const table = useMaterialReactTable({
    columns,
    data: receipts,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    getRowId: (row) => row.check_number,
    onCreatingRowSave: handleCreateReceipt,
    onEditingRowSave: handleSaveReceipt,
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton
            onClick={() => {
              table.setEditingRow(row);
              setIsEditing(true);
              setValidationErrors({});
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => handleDeleteReceipt(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Box
        sx={{ display: "flex", gap: "16px", padding: "8px", flexWrap: "wrap" }}
      >
        <Button
          variant="contained"
          onClick={() => {
            table.setCreatingRow(true);
            setIsEditing(false);
            setValidationErrors({});
          }}
        >
          додати
        </Button>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={() => handleExportRows(table.getRowModel().rows)}
        >
          Експорт сторінки
        </Button>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={() =>
            handleExportRows(table.getPrePaginationRowModel().rows)
          }
        >
          Експорт всіх
        </Button>
      </Box>
    ),
  });

  return (
    <Box sx={{ marginTop: "20px" }}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default ReceiptsPage;
