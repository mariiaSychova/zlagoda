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
import { TStoreProduct, TProductForDisplay } from "@/types";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import {
  getAllStoreProductsInnerRoute,
  createStoreProductInnerRoute,
  updateStoreProductInnerRoute,
  deleteStoreProductInnerRoute,
} from "@/API/store-product";
import { getAllProductsForDisplayInnerRoute } from "@/API/products";

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
    newErrors.upc = "UPC обов'язкове і має складатися з 12 символів.";
  }

  if (
    product.id_product?.toString() === "" ||
    product.id_product === undefined ||
    product.id_product === null
  ) {
    newErrors.id_product = "ID продукту обов'язкове.";
  }

  if (
    product.selling_price?.toString() === "" ||
    product.selling_price === undefined ||
    product.selling_price === null
  ) {
    newErrors.selling_price = "Ціна обов'язкова.";
  } else if (isNaN(product.selling_price)) {
    newErrors.selling_price = "Ціна має бути числом.";
  } else if (product.selling_price <= 0) {
    newErrors.selling_price = "Ціна має бути додатнім числом.";
  }

  if (
    product.products_number?.toString() === "" ||
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
    product.promotional_product?.toString() === "" ||
    product.promotional_product === undefined ||
    product.promotional_product === null
  ) {
    newErrors.promotional_product = 'Поле "чи акційний" обов\'язкове.';
  }

  return newErrors;
};

const StoreProductsPage = () => {
  const [storeProducts, setStoreProducts] = useState<TStoreProduct[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const firstTimeRef = useRef(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [products, setProducts] = useState<TProductForDisplay[]>([]);

  useEffect(() => {
    fetchStoreProducts();
  }, []);

  const fetchStoreProducts = async () => {
    if (firstTimeRef.current) setIsLoading(true);
    const data = await getAllStoreProductsInnerRoute();
    setStoreProducts(data);
    if (firstTimeRef.current) {
      firstTimeRef.current = false;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getAllProductsForDisplayInnerRoute();
      setProducts(data);
    };
    fetchProducts();
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
        ...defaultColumnProps("upc", true, !isEditing),
      },
      {
        accessorKey: "upc_prom",
        header: "UPC акц. продукту",
        size: 160,
        muiEditTextFieldProps: ({ row }) => ({
          required: false,
          error: !!validationErrors?.["upc_prom"],
          helperText: validationErrors?.["upc_prom"],
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              upc_prom: undefined,
            })),
          select: true,
        }),
        editSelectOptions: ({ row }) => [
          { value: "", text: "None" },
          ...storeProducts
            .filter((product) => product.upc !== row.original.upc)
            .map((product) => ({
              value: product.upc,
              text: `UPC:${product.upc}`,
            })),
        ],
      },
      {
        accessorKey: "id_product",
        header: "ID продукту",
        size: 160,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.["id_product"],
          helperText: validationErrors?.["id_product"],
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              id_product: undefined,
            })),
          select: true,
        },
        editSelectOptions: products.map((product) => ({
          value: product.id_product,
          text: `ID:${product.id_product} | ${product.product_name} (${product.producer})`,
        })),
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
        header: "Акційний?",
        size: 120,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.["promotional_product"],
          helperText: validationErrors?.["promotional_product"],
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              promotional_product: undefined,
            })),
          select: true,
        },
        editSelectOptions: [
          { value: true, text: "Так" },
          { value: false, text: "Ні" },
        ],
        Cell: ({ cell }) => {
          return cell.getValue() ? "Так" : "Ні";
        },
      },
    ];
  }, [validationErrors, isEditing, storeProducts, products]);

  const handleCreateStoreProduct: MRT_TableOptions<TStoreProduct>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const errors = validateStoreProduct(values, storeProducts);
      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        return;
      }
      setIsSaving(true);
      await createStoreProductInnerRoute(values);
      table.setCreatingRow(null);
      fetchStoreProducts();
      setIsSaving(false);
    };

  const handleSaveStoreProduct: MRT_TableOptions<TStoreProduct>["onEditingRowSave"] =
    async ({ values, table }) => {
      if (values.upc_prom === "") {
        values.upc_prom = null;
      }

      const errors = validateStoreProduct(
        values,
        storeProducts.filter((product) => product.upc !== values.upc)
      );
      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        return;
      }
      setIsSaving(true);
      await updateStoreProductInnerRoute(values.upc, values);
      table.setEditingRow(null);
      fetchStoreProducts();
      setIsSaving(false);
    };

  const handleDeleteStoreProduct = async (row: MRT_Row<TStoreProduct>) => {
    if (window.confirm("Ви впевнені щодо видалення?")) {
      setIsSaving(true);
      await deleteStoreProductInnerRoute(row.original.upc);

      fetchStoreProducts();
      setIsSaving(false);
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

export default StoreProductsPage;
