"use client";
import { useState, useMemo, useEffect } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  useMaterialReactTable,
} from "material-react-table";

import {
  Box,
  Button,
  Tooltip,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Typography,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { TCustomerCardForDisplay } from "@/types";
import {
  getCustomersPuchasesByCategories,
  getSpecificEmployee,
} from "@/API/bohdan";
import { getAllCustomerCardsForDisplayInnerRoute } from "@/API/customer-card";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { PageOrientation } from "pdfmake/interfaces";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface PurchaseData {
  card_number: string;
  cust_name: string;
  cust_surname: string;
  cust_patronymic: string;
  category_name: string;
  total_price: number;
}

interface EmployeeData {
  id_employee: number;
  empl_name: string;
  empl_surname: string;
  empl_patronymic: string;
  empl_role: string;
}

const formatValue = (value: number | string) => {
  if (typeof value === "string") {
    value = parseFloat(value);
  }
  if (isNaN(value)) {
    return value;
  }
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);
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

const PageForCustomQueries = () => {
  const [selectedCardNumber, setSelectedCardNumber] = useState<string | "">("");
  const [data, setData] = useState<PurchaseData[]>([]);
  const [users, setUsers] = useState<TCustomerCardForDisplay[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllCustomerCardsForDisplayInnerRoute();
        setUsers(response);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getCustomersPuchasesByCategories({
        cardNumber: selectedCardNumber,
      });
      setData(response);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await getSpecificEmployee();
      setEmployees(response);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const purchaseColumns = useMemo<MRT_ColumnDef<PurchaseData>[]>(
    () => [
      {
        accessorKey: "card_number",
        header: "№ Карти",
      },
      {
        accessorKey: "cust_name",
        header: "Ім'я",
      },
      {
        accessorKey: "cust_surname",
        header: "Прізвище",
      },
      {
        accessorKey: "cust_patronymic",
        header: "По батькові",
      },
      {
        accessorKey: "category_name",
        header: "Категорія",
      },
      {
        accessorKey: "total_price",
        header: "Сума",
        Cell: ({ cell }) => {
          const value = cell.getValue<number | string>();
          return formatValue(value);
        },
      },
    ],
    []
  );

  const employeeColumns = useMemo<MRT_ColumnDef<EmployeeData>[]>(
    () => [
      {
        accessorKey: "id_employee",
        header: "ID",
      },
      {
        accessorKey: "empl_name",
        header: "Ім'я",
      },
      {
        accessorKey: "empl_surname",
        header: "Прізвище",
      },
      {
        accessorKey: "empl_patronymic",
        header: "По батькові",
      },
      {
        accessorKey: "empl_role",
        header: "Роль",
      },
    ],
    []
  );

  const handleExportRows = (rows: MRT_Row<PurchaseData>[]) => {
    const tableData = sanitizeData(
      rows.map((row) => Object.values(row.original))
    );

    const tableHeaders = sanitizeData([
      purchaseColumns.map((c) => c.header || ""),
    ])[0];

    const docDefinition = {
      pageOrientation: "landscape" as PageOrientation,
      header: {
        text: `Магазин "Злагода"`,
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
            widths: ["15%", "15%", "15%", "15%", "15%", "15%", "10%"],
            body: [tableHeaders, ...tableData],
          },
          fontSize: 14,
        },
      ],
    };

    const name: string =
      "customers_purchases_report_" + new Date().toLocaleDateString() + ".pdf";
    pdfMake.createPdf(docDefinition).download(name);
  };

  const customersTable = useMaterialReactTable({
    columns: purchaseColumns,
    data,
    renderTopToolbarCustomActions: ({ table }) => (
      <Box
        sx={{ display: "flex", gap: "16px", padding: "8px", flexWrap: "wrap" }}
      >
        <Typography variant="h6" gutterBottom>
          Вивести для вибраного покупця, скільки б він\вона витратили грошей
          загалом на кожну категорію товарів, без врахування знижки
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="user-select-label">Виберіть користувача</InputLabel>
          <Select
            labelId="user-select-label"
            value={selectedCardNumber}
            onChange={(e) => setSelectedCardNumber(e.target.value as string)}
            label="Виберіть користувача"
          >
            {users.map((user) => (
              <MenuItem key={user.card_number} value={user.card_number}>
                {user.card_number} | {user.cust_name} {user.cust_surname}{" "}
                {user.cust_patronymic}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={fetchData}>
          Отримати дані
        </Button>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={() => handleExportRows(customersTable.getRowModel().rows)}
        >
          Експортувати дані
        </Button>
      </Box>
    ),
  });

  const employeesTable = useMaterialReactTable({
    columns: employeeColumns,
    data: employees,
    renderTopToolbarCustomActions: ({ table }) => (
      <Box
        sx={{ display: "flex", gap: "16px", padding: "8px", flexWrap: "wrap" }}
      >
        <Typography variant="h6" gutterBottom>
          Дані про працівників, які продали товари з усіх категорій.
        </Typography>
        <Button variant="contained" onClick={fetchEmployees}>
          Отримати дані
        </Button>
      </Box>
    ),
  });

  return (
    <Box sx={{ marginTop: "20px" }}>
      <MaterialReactTable table={customersTable} />
      <Box sx={{ marginTop: "20px" }}>
        <MaterialReactTable table={employeesTable} />
      </Box>
    </Box>
  );
};

export default PageForCustomQueries;
