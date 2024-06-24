"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
} from "material-react-table";

import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
} from "@mui/material";
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
  TCustomerCardForDisplay,
  TEmployeeForDisplay,
  TReceipt,
} from "@/types";

import { formatValue } from "@/utils/formatNumber";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { PageOrientation } from "pdfmake/interfaces";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

import SalesTable from "./SalesTable";
import Table1 from "@/components/pages/ReceiptsPage/Table1";
import Table2 from "@/components/pages/ReceiptsPage/Table2";
import Table3 from "@/components/pages/ReceiptsPage/Table3";
import Table4 from "@/components/pages/ReceiptsPage/Table4";
import Table5 from "@/components/pages/ReceiptsPage/Table5";
import Table6 from "@/components/pages/ReceiptsPage/Table6";
import Table7 from "@/components/pages/ReceiptsPage/Table7";
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
  const [cashiers, setCashiers] = useState<TEmployeeForDisplay[]>([]);
  const [customersCards, setCustomersCards] = useState<
    TCustomerCardForDisplay[]
  >([]);
  const [selectedCheckNumber, setSelectedCheckNumber] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [showTable, setShowTable] = useState(false);

  const handleTableChange = (event: SelectChangeEvent<string>) => {
    setSelectedTable(event.target.value as string);
    setShowTable(false);
  };

  const handleButtonClick = () => {
    console.log("clicked");
    setShowTable(true);
  };

  const fetchReceipts = async (updating: boolean) => {
    if (updating) setIsLoading(true);
    const data = await getAllReceiptsInnerRoute();
    setReceipts(data);
    if (updating) setIsLoading(false);
  };

  useEffect(() => {
    fetchReceipts(true);
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

  const columnsReceipt = useMemo<MRT_ColumnDef<TReceipt>[]>(() => {
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
        enableEditing: !isEditing,
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
  }, [validationErrors, cashiers, customersCards]);

  const handleCreateReceipt: MRT_TableOptions<TReceipt>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const errors = validateReceipt(values);
      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        return;
      }
      setIsSaving(true);
      await createReceiptInnerRoute(values);
      table.setCreatingRow(null);
      await fetchReceipts(false);
      setIsSaving(false);
    };

  const handleSaveReceipt: MRT_TableOptions<TReceipt>["onEditingRowSave"] =
    async ({ values, table }) => {
      const errors = validateReceipt(values);
      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        return;
      }
      setIsSaving(true);
      await updateReceiptInnerRoute(values);
      table.setEditingRow(null);
      await fetchReceipts(false);
      setIsSaving(false);
    };

  const handleDeleteReceipt = async (row: MRT_Row<TReceipt>) => {
    if (window.confirm("Are you sure you want to delete this receipt?")) {
      setIsSaving(true);
      await deleteReceiptInnerRoute(row.original.check_number);
      await fetchReceipts(false);
      setSelectedCheckNumber(null);
      setIsSaving(false);
    }
  };

  const handleExportRows = (rows: MRT_Row<TReceipt>[]) => {
    const tableData = sanitizeData(
      rows.map((row) => Object.values(row.original))
    );

    const tableHeaders = sanitizeData([
      columnsReceipt.map((c) => c.header || ""),
    ])[0];

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

  const ReceiptTable = useMaterialReactTable({
    columns: columnsReceipt,
    data: receipts,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    getRowId: (row) => row.check_number,
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      const rowSelection =
        typeof updater === "function" ? updater({}) : updater;
      const selectedRowId = Object.keys(rowSelection)[0];
      const selectedRow = receipts.find(
        (receipt) => receipt.check_number === selectedRowId
      );
      setSelectedCheckNumber(selectedRow ? selectedRow.check_number : null);
    },
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
      </Box>
    ),
    state: {
      isLoading,
      isSaving,
      showProgressBars: isLoading || isSaving,
    },
  });

  return (
    <Box>
      <Box sx={{ marginTop: "20px" }}>
        <MaterialReactTable table={ReceiptTable} />
        {selectedCheckNumber && (
          <SalesTable
            selectedCheckNumber={selectedCheckNumber}
            onUpdateReceipts={fetchReceipts}
          />
        )}
      </Box>
      <Box
        sx={{
          marginTop: "40px",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="user-select-label">Виберіть запит</InputLabel>
          <Select
            labelId="table-select-label"
            value={selectedTable}
            onChange={handleTableChange}
            label="Виберіть запит"
          >
            <MenuItem value="table1">
              Отримати інформацію про усі чеки, створені певним касиром за
              певний період часу
            </MenuItem>
            <MenuItem value="table2">
              Отримати інформацію про усі чеки, створені усіма касирами за
              певний період часу
            </MenuItem>
            <MenuItem value="table3">
              Визначити загальну суму проданих товарів з чеків, створених певним
              касиром за певний період часу
            </MenuItem>
            <MenuItem value="table4">
              Визначити загальну суму проданих товарів з чеків, створених усіма
              касирами за певний період часу
            </MenuItem>
            <MenuItem value="table5">
              Визначити загальну кількість одиниць певного товару, проданого за
              певний період часу
            </MenuItem>
            <MenuItem value="table6">
              За номером чеку вивести усю інформацію про даний чек, в тому числі
              інформацію про назву, к-сть та ціну товарів, придбаних в даному
              чеку.
            </MenuItem>
            <MenuItem value="table7">
              Переглянути список усіх чеків, що створив касир за цей день
            </MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleButtonClick}>
          Отримати дані
        </Button>
      </Box>
      <Box sx={{ marginTop: "20px", paddingBottom: "100px", width: "100%" }}>
        {showTable && selectedTable === "table1" && <Table1 />}
        {showTable && selectedTable === "table2" && <Table2 />}
        {showTable && selectedTable === "table3" && <Table3 />}
        {showTable && selectedTable === "table4" && <Table4 />}
        {showTable && selectedTable === "table5" && <Table5 />}
        {showTable && selectedTable === "table6" && <Table6 />}
        {showTable && selectedTable === "table7" && <Table7 />}
      </Box>
    </Box>
  );
};

export default ReceiptsPage;
