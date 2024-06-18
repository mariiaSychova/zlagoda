"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, Stack } from "@mui/material";
import { TCustomerCard } from "@/types";
import {
  getAllCustomerCardsInnerRoute,
  createCustomerCardInnerRoute,
  updateCustomerCardInnerRoute,
  deleteCustomerCardInnerRoute,
} from "@/API/customer-card";
import CustomerCardTable from "@/components/pages/CustomerCardsPage/CustomerCardTable";
import "./CustomerCardsPage.css";

const CustomerCardPage: React.FC = () => {
  const [customerCards, setCustomerCards] = useState<TCustomerCard[]>([]);
  const [editingCardNumber, setEditingCardNumber] = useState<string | null>(
    null
  );
  const [newCard, setNewCard] = useState<Partial<TCustomerCard>>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editErrors, setEditErrors] = useState<{
    [key: string]: { [key: string]: string };
  }>({});

  useEffect(() => {
    fetchCustomerCards();
  }, []);

  const fetchCustomerCards = async () => {
    const data = await getAllCustomerCardsInnerRoute();
    setCustomerCards(data);
  };

  const validateCard = (
    card: Partial<TCustomerCard>
  ): { [key: string]: string } => {
    const newErrors: { [key: string]: string } = {};

    if (!card.card_number || !/^\d{13}$/.test(card.card_number)) {
      newErrors.card_number = "Номер картки має бути з 13-ти цифр.";
    }
    if (!card.cust_surname || card.cust_surname.length > 50) {
      newErrors.cust_surname = "Прізвище обов'язкове і не більше 50 символів.";
    }
    if (!card.cust_name || card.cust_name.length > 50) {
      newErrors.cust_name = "Ім'я обов'язкове і не більше 50 символів.";
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
    if (card.percent === undefined || card.percent < 0 || card.percent > 100) {
      newErrors.percent = "Відсоток має бути від 0 до 100.";
    }
    return newErrors;
  };

  const handleEdit = (cardNumber: string) => {
    setEditingCardNumber(cardNumber);
    setEditErrors((prev) => ({ ...prev, [cardNumber]: {} }));
  };

  const handleDelete = async (cardNumber: string) => {
    await deleteCustomerCardInnerRoute(cardNumber);
    fetchCustomerCards();
  };

  const handleSave = async (cardNumber: string) => {
    const updatedCard = customerCards.find(
      (card) => card.card_number === cardNumber
    );
    const newErrors = validateCard(updatedCard!);
    if (Object.keys(newErrors).length > 0) {
      setEditErrors((prev) => ({ ...prev, [cardNumber]: newErrors }));
      return;
    }
    await updateCustomerCardInnerRoute(
      cardNumber,
      updatedCard as TCustomerCard
    );
    setEditingCardNumber(null);
    fetchCustomerCards();
  };

  const handleAdd = async () => {
    const newErrors = validateCard(newCard as TCustomerCard);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    await createCustomerCardInnerRoute(newCard as TCustomerCard);
    setNewCard({});
    setErrors({});
    fetchCustomerCards();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    cardNumber: string,
    key: keyof TCustomerCard
  ) => {
    const updatedCards = customerCards.map((card) =>
      card.card_number === cardNumber
        ? { ...card, [key]: e.target.value }
        : card
    );
    setCustomerCards(updatedCards);
    setEditErrors((prev) => ({
      ...prev,
      [cardNumber]: { ...prev[cardNumber], [key]: "" },
    }));
  };

  const handleNewCardChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof TCustomerCard
  ) => {
    setNewCard({ ...newCard, [key]: e.target.value });
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <Stack sx={{ m: "2rem 0" }}>
      <Typography variant="h4" textAlign="center">
        Карти постійних клієнтів
      </Typography>
      <CustomerCardTable
        customerCards={customerCards}
        editingCardNumber={editingCardNumber}
        errors={editErrors}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleSave={handleSave}
        handleChange={handleChange}
      />
      <Box className="add-new-card-section" sx={{ marginTop: "20px" }}>
        <Typography variant="h6" textAlign="center">
          Додати нову картку
        </Typography>
        <Box
          className="new-card-form"
          sx={{
            display: "flex",
            gap: "10px",
            alignItems: "flex-start",
            flexWrap: "wrap",
            marginTop: "10px",
          }}
        >
          <TextField
            label="Номер картки"
            value={newCard.card_number || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleNewCardChange(e, "card_number")
            }
            size="small"
            error={!!errors.card_number}
            helperText={errors.card_number}
            sx={{ flexBasis: "calc(20% - 10px)" }}
          />
          <TextField
            label="Прізвище"
            value={newCard.cust_surname || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleNewCardChange(e, "cust_surname")
            }
            size="small"
            error={!!errors.cust_surname}
            helperText={errors.cust_surname}
            sx={{ flexBasis: "calc(20% + 20px)" }}
          />
          <TextField
            label="Ім'я"
            value={newCard.cust_name || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleNewCardChange(e, "cust_name")
            }
            size="small"
            error={!!errors.cust_name}
            helperText={errors.cust_name}
            sx={{ flexBasis: "calc(20% + 20px)" }}
          />
          <TextField
            label="По батькові"
            value={newCard.cust_patronymic || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleNewCardChange(e, "cust_patronymic")
            }
            size="small"
            sx={{ flexBasis: "calc(20% + 20px)" }}
          />
          <TextField
            label="Номер телефону"
            value={newCard.phone_number || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleNewCardChange(e, "phone_number")
            }
            size="small"
            error={!!errors.phone_number}
            helperText={errors.phone_number}
            sx={{ flexBasis: "calc(20%)" }}
          />
          <TextField
            label="Місто"
            value={newCard.city || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleNewCardChange(e, "city")
            }
            size="small"
            error={!!errors.city}
            helperText={errors.city}
            sx={{ flexBasis: "calc(20%)" }}
          />
          <TextField
            label="Вулиця"
            value={newCard.street || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleNewCardChange(e, "street")
            }
            size="small"
            error={!!errors.street}
            helperText={errors.street}
            sx={{ flexBasis: "calc(20%)" }}
          />
          <TextField
            label="Zip Code"
            value={newCard.zip_code || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleNewCardChange(e, "zip_code")
            }
            size="small"
            error={!!errors.zip_code}
            helperText={errors.zip_code}
            sx={{ flexBasis: "calc(10%)" }}
          />
          <TextField
            label="Відсоток"
            type="number"
            value={newCard.percent || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleNewCardChange(e, "percent")
            }
            size="small"
            error={!!errors.percent}
            helperText={errors.percent}
            sx={{ flexBasis: "calc(10%)" }}
          />
          <Button
            onClick={handleAdd}
            variant="contained"
            sx={{
              flexBasis: "100px",
              alignSelf: "flex-center",
            }}
          >
            Додати
          </Button>
        </Box>
      </Box>
    </Stack>
  );
};

export default CustomerCardPage;
