"use client";

import React, { useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { TCustomerCard } from "@/types";
import { TextField, Button, CircularProgress, Box } from "@mui/material";

type Props = {
  customerCards: TCustomerCard[];
  editingCardNumber: string | null;
  errors: { [key: string]: { [key: string]: string } };
  handleEdit: (cardNumber: string) => void;
  handleDelete: (cardNumber: string) => void;
  handleSave: (cardNumber: string) => void;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    cardNumber: string,
    key: keyof TCustomerCard
  ) => void;
  type?: "default" | "mariia-1";
};

const CustomerCardTable: React.FC<Props> = ({
  customerCards,
  editingCardNumber,
  errors,
  handleEdit,
  handleDelete,
  handleSave,
  handleChange,
  type = "default",
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const columns: MRT_ColumnDef<any>[] = [
    {
      accessorKey: "card_number",
      header: "Card Number",
      Cell: ({ cell }) =>
        editingCardNumber === cell.row.original.card_number ? (
          <TextField value={cell.getValue<string>()} size="small" disabled />
        ) : (
          <span>{cell.getValue<string>()}</span>
        ),
    },
    {
      accessorKey: "cust_surname",
      header: "Customer Surname",
      Cell: ({ cell }) =>
        editingCardNumber === cell.row.original.card_number ? (
          <TextField
            value={cell.getValue<string>()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(e, cell.row.original.card_number, "cust_surname")
            }
            size="small"
            error={!!errors[cell.row.original.card_number]?.cust_surname}
            helperText={errors[cell.row.original.card_number]?.cust_surname}
          />
        ) : (
          cell.getValue<string>()
        ),
    },
    {
      accessorKey: "cust_name",
      header: "Customer Name",
      Cell: ({ cell }) =>
        editingCardNumber === cell.row.original.card_number ? (
          <TextField
            value={cell.getValue<string>()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(e, cell.row.original.card_number, "cust_name")
            }
            size="small"
            error={!!errors[cell.row.original.card_number]?.cust_name}
            helperText={errors[cell.row.original.card_number]?.cust_name}
          />
        ) : (
          cell.getValue<string>()
        ),
    },
    {
      accessorKey: "cust_patronymic",
      header: "Customer Patronymic",
      Cell: ({ cell }) =>
        editingCardNumber === cell.row.original.card_number ? (
          <TextField
            value={cell.getValue<string>() || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(e, cell.row.original.card_number, "cust_patronymic")
            }
            size="small"
          />
        ) : (
          cell.getValue<string>() || "N/A"
        ),
    },
    {
      accessorKey: "phone_number",
      header: "Phone Number",
      Cell: ({ cell }) =>
        editingCardNumber === cell.row.original.card_number ? (
          <TextField
            value={cell.getValue<string>()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(e, cell.row.original.card_number, "phone_number")
            }
            size="small"
            error={!!errors[cell.row.original.card_number]?.phone_number}
            helperText={errors[cell.row.original.card_number]?.phone_number}
          />
        ) : (
          cell.getValue<string>()
        ),
    },
    {
      accessorKey: "city",
      header: "City",
      Cell: ({ cell }) =>
        editingCardNumber === cell.row.original.card_number ? (
          <TextField
            value={cell.getValue<string>()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(e, cell.row.original.card_number, "city")
            }
            size="small"
            error={!!errors[cell.row.original.card_number]?.city}
            helperText={errors[cell.row.original.card_number]?.city}
          />
        ) : (
          cell.getValue<string>()
        ),
    },
    {
      accessorKey: "street",
      header: "Street",
      Cell: ({ cell }) =>
        editingCardNumber === cell.row.original.card_number ? (
          <TextField
            value={cell.getValue<string>()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(e, cell.row.original.card_number, "street")
            }
            size="small"
            error={!!errors[cell.row.original.card_number]?.street}
            helperText={errors[cell.row.original.card_number]?.street}
          />
        ) : (
          cell.getValue<string>()
        ),
    },
    {
      accessorKey: "zip_code",
      header: "Zip Code",
      Cell: ({ cell }) =>
        editingCardNumber === cell.row.original.card_number ? (
          <TextField
            value={cell.getValue<string>()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(e, cell.row.original.card_number, "zip_code")
            }
            size="small"
            error={!!errors[cell.row.original.card_number]?.zip_code}
            helperText={errors[cell.row.original.card_number]?.zip_code}
          />
        ) : (
          cell.getValue<string>()
        ),
    },
    {
      accessorKey: "percent",
      header: "Percent",
      Cell: ({ cell }) =>
        editingCardNumber === cell.row.original.card_number ? (
          <TextField
            type="number"
            value={cell.getValue<number>()?.toString()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(e, cell.row.original.card_number, "percent")
            }
            size="small"
            error={!!errors[cell.row.original.card_number]?.percent}
            helperText={errors[cell.row.original.card_number]?.percent}
          />
        ) : (
          cell.getValue<number>()?.toString()
        ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      Cell: ({ cell }) =>
        editingCardNumber === cell.row.original.card_number ? (
          <Button
            onClick={() => {
              setIsLoading(true);
              handleSave(cell.row.original.card_number);
              setIsLoading(false);
            }}
            variant="contained"
            color="success"
            size="small"
          >
            Save
          </Button>
        ) : (
          <>
            <Button
              onClick={() => {
                setIsLoading(true);
                handleEdit(cell.row.original.card_number);
                setIsLoading(false);
              }}
              variant="contained"
              color="primary"
              size="small"
              style={{ marginRight: "5px" }}
            >
              Edit
            </Button>
            <Button
              onClick={() => {
                setIsLoading(true);
                handleDelete(cell.row.original.card_number);
                setIsLoading(false);
              }}
              variant="contained"
              color="error"
              size="small"
            >
              Delete
            </Button>
          </>
        ),
    },
    {
      accessorKey: "numberofitemsbought",
      header: "Number Of Items Bought",
      Cell: ({ cell }) =>
        editingCardNumber === cell.row.original.numberofitemsbought ? (
          <TextField value={cell.getValue<string>() || ""} size="small" />
        ) : (
          cell.getValue<string>() || "N/A"
        ),
    },
    {
      accessorKey: "totalamountspent",
      header: "Total Amount Spent",
      Cell: ({ cell }) =>
        editingCardNumber === cell.row.original.totalamountspent ? (
          <TextField value={cell.getValue<string>() || ""} size="small" />
        ) : (
          cell.getValue<string>() || "N/A"
        ),
    },
  ];

  const keys_default = [
    "card_number",
    "cust_surname",
    "cust_name",
    "cust_patronymic",
    "phone_number",
    "city",
    "street",
    "zip_code",
    "percent",
    "actions",
  ];
  const keys_mariia_1 = [
    "card_number",
    "cust_surname",
    "cust_name",
    "cust_patronymic",
    "numberofitemsbought",
    "totalamountspent",
  ];

  const getColumnsByKeys = (keys: string[]) => {
    return columns.filter(
      (column) =>
        typeof column.accessorKey === "string" &&
        keys.includes(column.accessorKey)
    );
  };

  const getKeysFromType = () => {
    switch (type) {
      case "default":
        return keys_default;
      case "mariia-1":
        return keys_mariia_1;
      default:
        return keys_default;
    }
  };

  const table = useMaterialReactTable({
    columns: getColumnsByKeys(getKeysFromType()),
    data: customerCards,
    enableColumnOrdering: true,
  });

  return (
    <Box>
      {isLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <CircularProgress />
        </Box>
      ) : (
        <MaterialReactTable table={table} />
      )}
    </Box>
  );
};

export default CustomerCardTable;
