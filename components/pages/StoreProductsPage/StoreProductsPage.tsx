"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MaterialReactTable,
  MRT_Cell,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
} from "material-react-table";

import { Box, Button, IconButton, Tooltip } from "@mui/material";
import {
  TProductForDisplay,
  TStoreProduct,
  TStoreProductWithDescr,
} from "@/types";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import {
  createStoreProductInnerRoute,
  deleteStoreProductInnerRoute,
  getAllStoreProductsInnerRoute,
  updateStoreProductInnerRoute,
  getAllStoreProductsWithDescr,
} from "@/API/store-product";
import { getAllProductsForDisplayInnerRoute } from "@/API/products";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { PageOrientation } from "pdfmake/interfaces";
import { formatValue } from "@/utils/formatNumber";
import { checkIfProductInSell } from "@/API/sale";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const validateStoreProduct = (
  product: Partial<TStoreProductWithDescr>,
  existingProducts: TStoreProductWithDescr[],
  editing: boolean,
  isPromotional: boolean,
  products: TProductForDisplay[]
): { [key: string]: string } => {
  const newErrors: { [key: string]: string } = {};

  if (!product.upc || product.upc.length !== 12) {
    newErrors.upc = "UPC обов'язкове і має складатися з 12 символів.";
  } else if (!/^\d+$/.test(product.upc)) {
    newErrors.upc = "UPC має складатися лише з цифр.";
  } else {
    const existingProductWithSameUPC = existingProducts.find(
      (p) => p.upc === product.upc
    );
    if (existingProductWithSameUPC && !editing) {
      newErrors.upc = "Товар з таким UPC вже існує.";
    }
  }

  // ID
  if (
    product.id_product?.toString() === "" ||
    product.id_product === undefined ||
    product.id_product === null
  ) {
    newErrors.id_product = "ID товару обов'язкове.";
  } else {
    const existingProductWithSameID = existingProducts.find(
      (p) => p.id_product === product.id_product
    );

    if (existingProductWithSameID) {
      if (
        isPromotional &&
        !editing &&
        existingProductWithSameID.promotional_product
      ) {
        newErrors.id_product = "Акційний товар з таким ID вже існує.";
      } else if (
        !isPromotional &&
        !editing &&
        !existingProductWithSameID.promotional_product
      ) {
        newErrors.id_product = "Не акційний товар з таким ID вже існує.";
      } else if (
        isPromotional &&
        !existingProducts.find(
          (p) => p.id_product === product.id_product && !p.promotional_product
        )
      ) {
        newErrors.id_product =
          "Не можна додати акційний товар без звичайного товару з таким же ID.";
      }
    } else if (
      !isPromotional &&
      existingProducts.find(
        (p) => p.id_product === product.id_product && p.promotional_product
      )
    ) {
      newErrors.id_product =
        "Звичайний товар з таким ID вже існує як акційний. Видаліть або змініть акційний товар.";
    }
  }

  // ціна
  if (!isPromotional) {
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
  }

  // кількість
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
  return newErrors;
};

const StoreProductsPage = () => {
  const [storeProducts, setStoreProducts] = useState<TStoreProductWithDescr[]>(
    []
  );
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const firstTimeRef = useRef(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isPromotional, setIsPromotional] = useState<boolean>(false);

  const [products, setProducts] = useState<TProductForDisplay[]>([]);

  useEffect(() => {
    fetchStoreProducts();
  }, []);

  const fetchStoreProducts = async () => {
    if (firstTimeRef.current) setIsLoading(true);
    const data = await getAllStoreProductsWithDescr();
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

  const columns = useMemo<MRT_ColumnDef<TStoreProductWithDescr>[]>(() => {
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
        header: "UPC акц. товару",
        size: 160,
        enableEditing: false,
        ...defaultColumnProps("upc_prom"),
      },
      {
        accessorKey: "id_product",
        header: "ID товару",
        size: 160,
        enableEditing: !isEditing,
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
        InputProps: {
          readOnly: !isEditing,
        },
        editSelectOptions: products.map((product) => ({
          value: product.id_product,
          text: `ID:${product.id_product} | ${product.product_name} (${product.producer}) *${product.characteristics}*`,
        })),
      },
      {
        accessorKey: "product_name",
        header: "Назва товару",
        size: 200,
        enableEditing: false,
      },
      {
        accessorKey: "producer",
        header: "Бренд",
        size: 200,
        enableEditing: false,
      },
      {
        accessorKey: "characteristics",
        header: "Характеристики",
        size: 300,
        enableEditing: false,
      },
      {
        accessorKey: "selling_price",
        header: "Ціна",
        size: 140,
        Cell: ({ cell }: { cell: MRT_Cell<TStoreProductWithDescr> }) => {
          const value = cell.getValue<number | string>();
          return formatValue(value);
        },
        muiEditTextFieldProps: ({
          row,
        }: {
          row: MRT_Row<TStoreProductWithDescr>;
        }) => ({
          required: true,
          error: !!validationErrors?.["selling_price"],
          helperText: validationErrors?.["selling_price"],
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              selling_price: undefined,
            })),
          InputProps: {
            readOnly:
              row.original.promotional_product ||
              (isEditing && row.original.promotional_product) ||
              (!isEditing && isPromotional),
          },
        }),
      },
      {
        accessorKey: "products_number",
        header: "Кількість",
        size: 140,
        ...defaultColumnProps("products_number"),
      },
      {
        accessorKey: "promotional_product",
        enableEditing: false,

        header: "Акційний?",
        size: 120,
        Cell: ({ cell }) => {
          return cell.getValue() ? "Так" : "Ні";
        },
      },
    ];
  }, [validationErrors, isEditing, storeProducts, products, isPromotional]);

  const handleCreateStoreProduct: MRT_TableOptions<TStoreProductWithDescr>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const errors = validateStoreProduct(
        values,
        storeProducts,
        isEditing,
        isPromotional,
        products
      );

      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        return;
      }

      try {
        setIsSaving(true);
        values.promotional_product = isPromotional;

        const storeProductData: TStoreProduct = {
          upc: values.upc,
          id_product: values.id_product,
          products_number: values.products_number,
          upc_prom: values.upc_prom,
          selling_price: values.selling_price,
          promotional_product: values.promotional_product,
        };
        if (isPromotional) {
          const nonPromotionalProduct = storeProducts.find(
            (product) =>
              product.id_product === values.id_product &&
              !product.promotional_product
          );
          if (nonPromotionalProduct) {
            const nonPromotionalProductData: TStoreProduct = {
              upc: nonPromotionalProduct.upc,
              id_product: nonPromotionalProduct.id_product,
              products_number: nonPromotionalProduct.products_number,
              upc_prom: nonPromotionalProduct.upc_prom,
              selling_price: nonPromotionalProduct.selling_price,
              promotional_product: nonPromotionalProduct.promotional_product,
            };
            storeProductData.selling_price =
              nonPromotionalProductData.selling_price * 0.8;
            await createStoreProductInnerRoute(storeProductData);
            nonPromotionalProductData.upc_prom = storeProductData.upc;

            await updateStoreProductInnerRoute(
              nonPromotionalProductData.upc,
              nonPromotionalProductData
            );
          }
        } else {
          await createStoreProductInnerRoute(storeProductData);
        }

        await fetchStoreProducts();

        table.setCreatingRow(null);
        setIsSaving(false);
        setIsPromotional(false);
      } catch (error) {
        console.error("Error creating store product:", error);
        setIsSaving(false);
      }
    };

  const handleSaveRow: MRT_TableOptions<TStoreProductWithDescr>["onEditingRowSave"] =
    async ({ row, values }) => {
      const errors = validateStoreProduct(
        values,
        storeProducts,
        isEditing,
        isPromotional,
        products
      );

      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        return;
      }

      try {
        setIsSaving(true);

        const storeProductData: TStoreProduct = {
          upc: values.upc,
          id_product: values.id_product,
          products_number: values.products_number,
          upc_prom: values.upc_prom,
          selling_price: values.selling_price,
          promotional_product: values.promotional_product,
        };

        if (row.original.promotional_product) {
          const nonPromotionalProduct = storeProducts.find(
            (product) => product.upc_prom === row.original.upc
          );
          if (nonPromotionalProduct) {
            nonPromotionalProduct.upc_prom = storeProductData.upc;
            await updateStoreProductInnerRoute(
              nonPromotionalProduct.upc,
              nonPromotionalProduct
            );
          }
        }
        await updateStoreProductInnerRoute(row.original.upc, storeProductData);
        await fetchStoreProducts();

        table.setEditingRow(null);
        setIsSaving(false);
        setIsEditing(false);
      } catch (error) {
        console.error("Error saving row:", error);
        setIsSaving(false);
      }
    };

  const handleCancelRow: MRT_TableOptions<TStoreProductWithDescr>["onEditingRowCancel"] =
    () => {
      setValidationErrors({});
      setIsEditing(false);
    };

  const handleDeleteRow = async (row: MRT_Row<TStoreProductWithDescr>) => {
    if (!row.original.promotional_product && row.original.upc_prom) {
      alert(
        "Не можна видалити звичайний товар, якщо існує акційний товар, пов'язаний з ним."
      );
      return;
    }
    const isProductInSell = await checkIfProductInSell(row.original.upc);
    if (isProductInSell) {
      alert("Не можна видалити цей товар, оскільки він входить до продажу.");
      return;
    }
    if (
      confirm(`Ви впевнені, що хочете видалити товар ${row.getValue("upc")}?`)
    ) {
      setIsSaving(true);
      await deleteStoreProductInnerRoute(row.original.upc);
      await fetchStoreProducts();
      setIsSaving(false);
    }
  };

  const handleExportRows = (rows: MRT_Row<TStoreProductWithDescr>[]) => {
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

  const table = useMaterialReactTable<TStoreProductWithDescr>({
    columns: columns,
    data: storeProducts,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    getRowId: (row) => row.upc,
    onCreatingRowSave: handleCreateStoreProduct,
    onEditingRowSave: handleSaveRow,
    onEditingRowCancel: handleCancelRow,

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
          <IconButton color="error" onClick={() => handleDeleteRow(row)}>
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
            setIsPromotional(false);
            setIsEditing(false);
            setValidationErrors({});
          }}
        >
          Додати
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            table.setCreatingRow(true);
            setIsPromotional(true);
            setIsEditing(false);
            setValidationErrors({});
          }}
        >
          Додати Акційний
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
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default StoreProductsPage;
