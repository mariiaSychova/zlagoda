"use client";
import { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
} from "material-react-table";

import { Box, Button, IconButton, Tooltip } from "@mui/material";
import { TStoreProduct } from "@/types";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import {
  getAllStoreProductsInnerRoute,
  createStoreProductInnerRoute,
  updateStoreProductInnerRoute,
  deleteStoreProductInnerRoute,
} from "@/API/store-product";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { PageOrientation } from "pdfmake/interfaces";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const validateStoreProduct = (
  product: Partial<TStoreProduct>,
  existingProducts: TStoreProduct[]
): { [key: string]: string } => {
  const newErrors: { [key: string]: string } = {};

  if (!product.upc || product.upc.length !== 12) {
    newErrors.upc = "UPC обов'язковий і має складатися з 12 символів.";
  }

  if (product.upc_prom && product.upc_prom.length !== 12) {
    newErrors.upc_prom = "UPC промо-продукту має складатися з 12 символів.";
  }

  if (product.id_product === undefined || product.id_product === null) {
    newErrors.id_product = "ID продукту обов'язковий.";
  }

  if (product.selling_price === undefined || product.selling_price === null) {
    newErrors.selling_price = "Ціна обов'язкова.";
  } else if (isNaN(product.selling_price)) {
    newErrors.selling_price = "Ціна має бути числом.";
  } else if (product.selling_price <= 0) {
    newErrors.selling_price = "Ціна має бути додатнім числом.";
  }

  if (
    product.products_number === undefined ||
    product.products_number === null
  ) {
    newErrors.products_number = "Кількість обов'язкова.";
  } else if (isNaN(product.products_number)) {
    newErrors.products_number = "Кількість має бути числом.";
  } else if (product.products_number < 0) {
    newErrors.products_number = "Кількість не може бути від'ємним числом.";
  }

  if (
    product.promotional_product === undefined ||
    product.promotional_product === null
  ) {
    newErrors.promotional_product = "Поле промо-продукт обов'язкове.";
  }

  return newErrors;
};

const StoreProductsPage = () => {
  const [storeProducts, setStoreProducts] = useState<TStoreProduct[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchStoreProducts = async () => {
      const data = await getAllStoreProductsInnerRoute();
      setStoreProducts(data);
    };
    fetchStoreProducts();
  }, []);

  const columns = useMemo<MRT_ColumnDef<TStoreProduct>[]>(() => {
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
        accessorKey: "upc",
        header: "UPC",
        size: 160,
        ...defaultColumnProps("upc"),
      },
      {
        accessorKey: "upc_prom",
        header: "UPC промо-продукту",
        size: 160,
        ...defaultColumnProps("upc_prom", false),
      },
      {
        accessorKey: "id_product",
        header: "ID продукту",
        size: 160,
        ...defaultColumnProps("id_product"),
      },
      {
        accessorKey: "selling_price",
        header: "Ціна",
        size: 140,
        ...defaultColumnProps("selling_price"),
      },
      {
        accessorKey: "products_number",
        header: "Кількість",
        size: 140,
        ...defaultColumnProps("products_number"),
      },
      {
        accessorKey: "promotional_product",
        header: "Промо-продукт",
        size: 160,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.["promotional_product"],
          helperText: validationErrors?.["promotional_product"],
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              promotional_product: undefined,
            })),
        },
      },
    ];
  }, [validationErrors, isEditing]);

  const handleCreateStoreProduct: MRT_TableOptions<TStoreProduct>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const errors = validateStoreProduct(values, storeProducts);
      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        return;
      }

      await createStoreProductInnerRoute(values);
      table.setCreatingRow(null);
      setStoreProducts(await getAllStoreProductsInnerRoute());
    };

  const handleSaveStoreProduct: MRT_TableOptions<TStoreProduct>["onEditingRowSave"] =
    async ({ values, table }) => {
      const errors = validateStoreProduct(
        values,
        storeProducts.filter((product) => product.upc !== values.upc)
      );
      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        return;
      }

      await updateStoreProductInnerRoute(values.upc, values);
      table.setEditingRow(null);
      setStoreProducts(await getAllStoreProductsInnerRoute());
    };

  const handleDeleteStoreProduct = async (row: MRT_Row<TStoreProduct>) => {
    if (window.confirm("Ви впевнені щодо видалення?")) {
      await deleteStoreProductInnerRoute(row.original.upc);

      setStoreProducts(await getAllStoreProductsInnerRoute());
    }
  };

  const handleExportRows = (rows: MRT_Row<TStoreProduct>[]) => {
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
            widths: ["15%", "15%", "10%", "10%", "10%", "10%", "10%"],
            body: [tableHeaders, ...tableData],
          },
          fontSize: 8,
        },
      ],
    };

    const name: string =
      "store_products_report" + new Date().toLocaleDateString() + ".pdf";
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
    data: storeProducts,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    getRowId: (row) => row.upc,
    onCreatingRowSave: handleCreateStoreProduct,
    onEditingRowSave: handleSaveStoreProduct,
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
            onClick={() => handleDeleteStoreProduct(row)}
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
  });

  return (
    <Box sx={{ marginTop: "20px" }}>
      <MaterialReactTable table={table} />;
    </Box>
  );
};

export default StoreProductsPage;
