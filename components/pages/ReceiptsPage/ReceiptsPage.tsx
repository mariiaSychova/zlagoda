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
  //updateReceipt,
  //deleteReceipt,
} from "@/API/receipt";
import { TReceipt, TSell } from "@/types";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { PageOrientation } from "pdfmake/interfaces";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const validateReceipt = (
  receipt: Partial<TReceipt>
): { [key: string]: string } => {
  const newErrors: { [key: string]: string } = {};

  if (!receipt.check_number) {
    newErrors.check_number = "Check number is required.";
  }

  if (!receipt.id_employee) {
    newErrors.id_employee = "Employee ID is required.";
  }

  if (!receipt.print_date) {
    newErrors.print_date = "Print date is required.";
  }

  if (receipt.sum_total === undefined || receipt.sum_total === null) {
    newErrors.sum_total = "Total sum is required.";
  } else if (isNaN(receipt.sum_total)) {
    newErrors.sum_total = "Total sum must be a number.";
  } else if (receipt.sum_total <= 0) {
    newErrors.sum_total = "Total sum must be a positive number.";
  }

  if (receipt.vat === undefined || receipt.vat === null) {
    newErrors.vat = "VAT is required.";
  } else if (isNaN(receipt.vat)) {
    newErrors.vat = "VAT must be a number.";
  } else if (receipt.vat < 0) {
    newErrors.vat = "VAT cannot be negative.";
  }

  return newErrors;
};

const ReceiptsPage = () => {
  const [receipts, setReceipts] = useState<TReceipt[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchReceipts = async () => {
      const data = await getAllReceiptsInnerRoute();
      setReceipts(data);
    };
    fetchReceipts();
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
        header: "Check Number",
        size: 160,
        ...defaultColumnProps("check_number", true, !isEditing),
      },
      {
        accessorKey: "id_employee",
        header: "Employee ID",
        size: 160,
        ...defaultColumnProps("id_employee"),
      },
      {
        accessorKey: "card_number",
        header: "Card Number",
        size: 160,
        ...defaultColumnProps("card_number", false),
      },
      {
        accessorKey: "print_date",
        header: "Print Date",
        size: 160,
        ...defaultColumnProps("print_date"),
      },
      {
        accessorKey: "sum_total",
        header: "Total Sum",
        size: 140,
        ...defaultColumnProps("sum_total"),
      },
      {
        accessorKey: "vat",
        header: "VAT",
        size: 140,
        ...defaultColumnProps("vat"),
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

  // const handleSaveReceipt: MRT_TableOptions<TReceipt>["onEditingRowSave"] =
  //   async ({ values, table }) => {
  //     const errors = validateReceipt(values);
  //     if (Object.keys(errors).length) {
  //       setValidationErrors(errors);
  //       return;
  //     }

  //     await updateReceipt(values.check_number, values);
  //     table.setEditingRow(null);
  //     setReceipts(await getAllReceipts());
  //   };

  const handleDeleteReceipt = async (row: MRT_Row<TReceipt>) => {
    console.log(row.original);
    // if (window.confirm("Are you sure you want to delete this receipt?")) {
    //   await deleteReceipt(row.original.check_number);
    //   setReceipts(await getAllReceipts());
    // }
  };

  const handleExportRows = (rows: MRT_Row<TReceipt>[]) => {
    const tableData = sanitizeData(
      rows.map((row) => Object.values(row.original))
    );

    const tableHeaders = sanitizeData([columns.map((c) => c.header || "")])[0];

    const docDefinition = {
      pageOrientation: "landscape" as PageOrientation,
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
            widths: ["15%", "15%", "10%", "10%", "10%", "10%"],
            body: [tableHeaders, ...tableData],
          },
          fontSize: 8,
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
    //onEditingRowSave: handleSaveReceipt,
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
          Add Receipt
        </Button>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={() => handleExportRows(table.getRowModel().rows)}
        >
          Export Page
        </Button>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={() =>
            handleExportRows(table.getPrePaginationRowModel().rows)
          }
        >
          Export All
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
