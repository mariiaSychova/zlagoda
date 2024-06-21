"use client";

import React from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { TCustomerCard } from "@/types";
import { Box, TextField, Button } from "@mui/material";

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
};

const CustomerCardTable: React.FC<Props> = ({
  customerCards,
  editingCardNumber,
  errors,
  handleEdit,
  handleDelete,
  handleSave,
  handleChange,
}) => {
  const columns: MRT_ColumnDef<TCustomerCard>[] = [
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
            onClick={() => handleSave(cell.row.original.card_number)}
            variant="contained"
            color="success"
            size="small"
          >
            Save
          </Button>
        ) : (
          <>
            <Button
              onClick={() => handleEdit(cell.row.original.card_number)}
              variant="contained"
              color="primary"
              size="small"
              style={{ marginRight: "5px" }}
            >
              Edit
            </Button>
            <Button
              onClick={() => handleDelete(cell.row.original.card_number)}
              variant="contained"
              color="error"
              size="small"
            >
              Delete
            </Button>
          </>
        ),
    },
  ];

  const table = useMaterialReactTable({
    columns,
    data: customerCards,
    enableColumnOrdering: true,
  });

  return <MaterialReactTable table={table} />;
};

export default CustomerCardTable;
