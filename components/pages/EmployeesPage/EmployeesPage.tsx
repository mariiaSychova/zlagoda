"use client";

import { useMemo, useState, useEffect } from "react";
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
  IconButton,
  Tooltip,
  Select,
  MenuItem,
} from "@mui/material";
import { TEmployee } from "@/types";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import {
  getAllEmployeesInnerRoute,
  createEmployeeInnerRoute,
  updateEmployeeInnerRoute,
  deleteEmployeeInnerRoute,
} from "@/API/employee";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { PageOrientation } from "pdfmake/interfaces";

import { encrypt } from "@/utils/auth";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import * as EmailValidator from "email-validator";

const validateEmployee = (
  employee: Partial<TEmployee>,
  existingEmployees: TEmployee[]
): { [key: string]: string } => {
  const newErrors: { [key: string]: string } = {};

  if (!employee.empl_surname || employee.empl_surname.length > 50) {
    newErrors.empl_surname = "Прізвище обов'язкове й не більше 50 символів.";
  }
  if (!employee.empl_name || employee.empl_name.length > 50) {
    newErrors.empl_name = "Ім'я обов'язкове й не більше 50 символів.";
  }
  if (employee.empl_patronymic && employee.empl_patronymic.length > 50) {
    newErrors.empl_patronymic = "По батькові не більше 50 символів.";
  }
  if (!employee.empl_role) {
    newErrors.empl_role = "Роль обов'язкова";
  }
  if (!employee.salary || employee.salary <= 0) {
    newErrors.salary = "Зарплата має бути додатнім числом.";
  }
  if (!employee.phone_number || employee.phone_number.length !== 13) {
    newErrors.phone_number = "Номер телефону має бути з 13-ти символів.";
  }
  if (!employee.city || employee.city.length > 50) {
    newErrors.city = "Місто обов'язкове й не більше 50 символів.";
  }
  if (!employee.street || employee.street.length > 50) {
    newErrors.street = "Вулиця обов'язкова й не більше 50 символів.";
  }
  if (!employee.zip_code || !/^\d{5,9}$/.test(employee.zip_code.toString())) {
    newErrors.zip_code = "Zip code має бути від 5 до 9 цифр.";
  }

  if (!employee.date_of_start) {
    newErrors.date_of_start = "Дата початку обов'язкова.";
  }

  if (!employee.date_of_birth) {
    newErrors.date_of_birth = "Дата народження обов'язкова.";
  } else {
    const dob = new Date(employee.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();
    const dayDifference = today.getDate() - dob.getDate();

    if (
      isNaN(dob.getTime()) ||
      age < 18 ||
      (age === 18 &&
        (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)))
    ) {
      newErrors.date_of_birth = "Працівник має бути старше 18 років.";
    }
  }

  if (!employee.email || !EmailValidator.validate(employee.email)) {
    newErrors.email = "Невірний формат email.";
  } else if (
    existingEmployees.some(
      (existingEmployee) => existingEmployee.email === employee.email
    )
  ) {
    newErrors.email = "Користувач з таким email вже існує.";
  }

  return newErrors;
};

const EmployeePage = () => {
  const [employees, setEmployees] = useState<TEmployee[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      const data = await getAllEmployeesInnerRoute();
      setEmployees(data);
    };
    fetchEmployees();
  }, []);

  const columns = useMemo<MRT_ColumnDef<TEmployee>[]>(() => {
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
        accessorKey: "id_employee",
        header: "ID",
        size: 100,
        enableEditing: false,
        ...defaultColumnProps("id_employee", true),
      },
      {
        accessorKey: "empl_name",
        header: "Ім'я",
        size: 160,
        ...defaultColumnProps("empl_name"),
      },
      {
        accessorKey: "empl_surname",
        header: "Прізвище",
        size: 160,
        ...defaultColumnProps("empl_surname"),
      },
      {
        accessorKey: "empl_patronymic",
        header: "По батькові",
        size: 160,
        ...defaultColumnProps("empl_patronymic", false),
      },
      {
        accessorKey: "empl_role",
        header: "Роль",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.["empl_role"],
          helperText: validationErrors?.["empl_role"],
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              empl_role: undefined,
            })),
          select: true,
          SelectProps: {
            native: true,
          },
          children: (
            <>
              <option value="Касир">Касир</option>
              <option value="Менеджер">Менеджер</option>
            </>
          ),
        },
      },
      {
        accessorKey: "salary",
        header: "Зарплата",
        ...defaultColumnProps("salary"),
      },
      {
        accessorKey: "date_of_birth",
        header: "Дата народження",
        ...defaultColumnProps("date_of_birth"),
      },
      {
        accessorKey: "date_of_start",
        header: "Дата початку роботи",
        ...defaultColumnProps("date_of_start"),
      },
      {
        accessorKey: "phone_number",
        header: "Номер телефону",
        ...defaultColumnProps("phone_number"),
      },
      {
        accessorKey: "city",
        header: "Місто",
        ...defaultColumnProps("city"),
      },
      {
        accessorKey: "street",
        header: "Вулиця",
        ...defaultColumnProps("street"),
      },
      {
        accessorKey: "zip_code",
        header: "Поштовий індекс",
        ...defaultColumnProps("zip_code"),
      },
      {
        accessorKey: "email",
        header: "Email",
        ...defaultColumnProps("email"),
      },
      {
        accessorKey: "password",
        header: "Пароль",
        ...defaultColumnProps("password"),
      },
    ];
  }, [validationErrors, isEditing]);

  const handleCreateEmployee: MRT_TableOptions<TEmployee>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const errors = validateEmployee(values, employees);
      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        return;
      }

      values.id_employee = employees.length
        ? Math.max(...employees.map((e) => e.id_employee)) + 1
        : 1;
      values.password = encrypt(values.password);

      await createEmployeeInnerRoute(values);
      table.setCreatingRow(null);
      setEmployees(await getAllEmployeesInnerRoute());
    };

  const handleSaveEmployee: MRT_TableOptions<TEmployee>["onEditingRowSave"] =
    async ({ values, table }) => {
      const errors = validateEmployee(
        values,
        employees.filter(
          (employee) => employee.id_employee !== values.id_employee
        )
      );
      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        return;
      }

      delete values.password;

      await updateEmployeeInnerRoute(values.id_employee, values);
      table.setEditingRow(null);
      setEmployees(await getAllEmployeesInnerRoute());
    };

  const handleDeleteEmployee = async (row: MRT_Row<TEmployee>) => {
    if (window.confirm("Ви впевнені щодо видалення?")) {
      await deleteEmployeeInnerRoute(row.original.id_employee);
      setEmployees(await getAllEmployeesInnerRoute());
    }
  };

  const handleExportRows = (rows: MRT_Row<TEmployee>[]) => {
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
              "8%",
              "8%",
              "8%",
              "8%",
              "8%",
            ],
            body: [tableHeaders, ...tableData],
          },
          fontSize: 10,
        },
      ],
    };
    const name: string =
      "employees_report" + new Date().toLocaleDateString() + ".pdf";
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
    data: employees,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    getRowId: (row) => row.id_employee.toString(),
    onCreatingRowSave: handleCreateEmployee,
    onEditingRowSave: handleSaveEmployee,
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
          <IconButton color="error" onClick={() => handleDeleteEmployee(row)}>
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

export default EmployeePage;
