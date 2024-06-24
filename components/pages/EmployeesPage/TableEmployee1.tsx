"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";
import axios from "axios";
import { getAllCashiersForDisplay } from "@/API/employee";
import { TEmployeeForDisplay } from "@/types";

interface EmployeeDetails {
  empl_surname: string;
  phone_number: string;
  city: string;
  street: string;
  zip_code: string;
}

const TableEmployee1 = () => {
  const [employees, setEmployees] = useState<TEmployeeForDisplay[]>([]);
  const [selectedSurname, setSelectedSurname] = useState<string | null>(null);
  const [employeeDetails, setEmployeeDetails] =
    useState<EmployeeDetails | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      const data = await getAllCashiersForDisplay();
      setEmployees(data);
    };
    fetchEmployees();
  }, []);

  const fetchEmployeeDetails = async () => {
    if (selectedSurname) {
      const data = await getEmployeeDetails(selectedSurname);
      if (data) {
        setEmployeeDetails(data);
      }
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Box sx={{ display: "flex", gap: 2, marginBottom: 4 }}>
        <FormControl fullWidth>
          <InputLabel id="surname-select-label">Виберіть прізвище</InputLabel>
          <Select
            labelId="surname-select-label"
            value={selectedSurname || ""}
            onChange={(e) => setSelectedSurname(e.target.value as string)}
            label="Виберіть прізвище"
          >
            {employees.map((employee) => (
              <MenuItem
                key={employee.id_employee}
                value={employee.empl_surname}
              >
                {employee.empl_surname}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={fetchEmployeeDetails}>
          Отримати дані
        </Button>
      </Box>

      {employeeDetails && (
        <Box>
          <Typography variant="h6">
            Прізвище: {employeeDetails.empl_surname}
          </Typography>
          <Typography variant="h6">
            Телефон: {employeeDetails.phone_number}
          </Typography>
          <Typography variant="h6">Місто: {employeeDetails.city}</Typography>
          <Typography variant="h6">Вулиця: {employeeDetails.street}</Typography>
          <Typography variant="h6">
            Поштовий індекс: {employeeDetails.zip_code}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const getEmployeeDetails = async (
  surname: string
): Promise<EmployeeDetails> => {
  const response = await axios.post("/api/employee/get-details", {
    surname,
  });
  return response.data;
};

export default TableEmployee1;
