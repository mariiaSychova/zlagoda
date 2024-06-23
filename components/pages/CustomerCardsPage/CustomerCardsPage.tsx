"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
} from "material-react-table";

import { Box, Button, IconButton, Tooltip } from "@mui/material";
import { TCustomerCard } from "@/types";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import {
  getAllCustomerCardsInnerRoute,
  createCustomerCardInnerRoute,
  updateCustomerCardInnerRoute,
  deleteCustomerCardInnerRoute,
} from "@/API/customer-card";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { PageOrientation } from "pdfmake/interfaces";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const validateCard = (
  card: Partial<TCustomerCard>,
  existingCards: TCustomerCard[]
): { [key: string]: string } => {
  const newErrors: { [key: string]: string } = {};

  if (!card.card_number || !/^\d{13}$/.test(card.card_number)) {
    newErrors.card_number = "Номер картки має бути з 13-ти цифр.";
  }
  if (!card.cust_surname || card.cust_surname.length > 50) {
    newErrors.cust_surname = "Прізвище обов'язкове й не більше 50 символів.";
  }
  if (!card.cust_name || card.cust_name.length > 50) {
    newErrors.cust_name = "Ім'я обов'язкове й не більше 50 символів.";
  }
  if (card.cust_patronymic && card.cust_patronymic.length > 50) {
    newErrors.cust_patronymic = "По батькові не більше 50 символів.";
  }
  if (!card.phone_number || card.phone_number.length !== 13) {
    newErrors.phone_number = "Номер телефону має бути з 13-ти символів.";
  }
  if (card.city && card.city.length > 50) {
    newErrors.city = "Місто не більше 50 символів.";
  }
  if (card.street && card.street.length > 50) {
    newErrors.street = "Вулиця не більше 50 символів.";
  }
  if (card.zip_code && !/^\d{5,9}$/.test(card.zip_code)) {
    newErrors.zip_code = "Zip code має бути від 5 до 9 цифр.";
  }
  if (
    !card.percent ||
    card.percent === undefined ||
    card.percent < 0 ||
    card.percent > 100
  ) {
    newErrors.percent = "Відсоток має бути від 0 до 100.";
  }

  if (
    existingCards.some(
      (existingCard) => existingCard.card_number === card.card_number
    )
  ) {
    newErrors.card_number = "Картка з таким номером вже існує.";
  }

  return newErrors;
};

const CustomerCardsPage = () => {
  const [customerCards, setCustomerCards] = useState<TCustomerCard[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const firstTimeRef = useRef(true);

  useEffect(() => {
    fetchCustomerCards();
  }, []);

  const fetchCustomerCards = async () => {
    if (firstTimeRef.current) setIsLoading(true);
    const data = await getAllCustomerCardsInnerRoute();
    setCustomerCards(data);
    if (firstTimeRef.current) {
      firstTimeRef.current = false;
      setIsLoading(false);
    }
  };

  const columns = useMemo<MRT_ColumnDef<TCustomerCard>[]>(() => {
    const defaultColumnProps = (
      field: string,
      required: boolean = false,
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
        accessorKey: "card_number",
        header: "Номер карти",
        size: 180,
        ...defaultColumnProps("card_number", true, !isEditing),
      },
      {
        accessorKey: "cust_name",
        header: "Ім'я",
        size: 160,
        ...defaultColumnProps("cust_name", true),
      },
      {
        accessorKey: "cust_surname",
        header: "Прізвище",
        size: 160,
        ...defaultColumnProps("empl_surname", true),
      },
      {
        accessorKey: "cust_patronymic",
        header: "По батькові",
        size: 160,
        ...defaultColumnProps("cust_patronymic"),
      },
      {
        accessorKey: "phone_number",
        header: "Номер телефону",
        size: 140,
        ...defaultColumnProps("phone_number", true),
      },
      {
        accessorKey: "city",
        header: "Місто",
        size: 140,
        ...defaultColumnProps("salary"),
      },
      {
        accessorKey: "street",
        header: "Вулиця",
        ...defaultColumnProps("street"),
      },
      {
        accessorKey: "zip_code",
        header: "Поштовий індек",
        ...defaultColumnProps("zip_code"),
      },
      {
        accessorKey: "percent",
        header: "Відсоток",
        size: 80,
        ...defaultColumnProps("percent", true),
      },
    ];
  }, [validationErrors, isEditing]);

  const handleCreateCustomerCard: MRT_TableOptions<TCustomerCard>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const errors = validateCard(values, customerCards);
      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        return;
      }

      setIsSaving(true);

      await createCustomerCardInnerRoute(values);
      table.setCreatingRow(null);
      fetchCustomerCards();
      setIsSaving(false);
    };

  const handleSaveCustomerCard: MRT_TableOptions<TCustomerCard>["onEditingRowSave"] =
    async ({ values, table }) => {
      const errors = validateCard(
        values,
        customerCards.filter((card) => card.card_number !== values.card_number)
      );

      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        return;
      }

      setIsSaving(true);
      await updateCustomerCardInnerRoute(values.card_number, values);
      table.setEditingRow(null);
      fetchCustomerCards();
      setIsSaving(false);
    };

  const handleDeleteCustomerCard = async (row: MRT_Row<TCustomerCard>) => {
    if (window.confirm("Ви впевнені щодо видалення?")) {
      setIsSaving(true);
      await deleteCustomerCardInnerRoute(row.original.card_number);
      fetchCustomerCards();
      setIsSaving(false);
    }
  };

  const handleExportRows = (rows: MRT_Row<TCustomerCard>[]) => {
    const tableData = sanitizeData(
      rows.map((row) => Object.values(row.original))
    );
    const tableHeaders = sanitizeData([columns.map((c) => c.header || "")])[0];

    const docDefinition = {
      pageOrientation: "landscape" as PageOrientation,
      header: {
        text: `Магазин "Злагода" звіт за ${new Date().toLocaleDateString()}`,
        fontSize: 12,
      },

      footer: function (currentPage: number, pageCount: number) {
        return {
          text: `Сторінка ${currentPage} з ${pageCount}`,
          fontSize: 10,
        };
      },
      content: [
        {
          table: {
            headerRows: 1,
            widths: [
              "15%",
              "10%",
              "10%",
              "10%",
              "15%",
              "10%",
              "15%",
              "10%",
              "8%",
            ],
            body: [tableHeaders, ...tableData],
          },
          fontSize: 10,
        },
      ],
    };
    const name: string =
      "customer-cards" + new Date().toLocaleDateString() + ".pdf";
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
    data: customerCards,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    getRowId: (row) => row.card_number,
    onCreatingRowSave: handleCreateCustomerCard,
    onEditingRowSave: handleSaveCustomerCard,
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
          <IconButton
            color="error"
            onClick={() => handleDeleteCustomerCard(row)}
          >
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
          Додати
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
    state: {
      isLoading,
      isSaving,
      showProgressBars: isLoading || isSaving,
    },
  });

  return (
    <Box sx={{ marginTop: "20px" }}>
      <MaterialReactTable table={table} />;
    </Box>
  );
};

export default CustomerCardsPage;
