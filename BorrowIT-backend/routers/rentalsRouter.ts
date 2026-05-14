import { Router } from "express";
import {
  getRentalById,
  listRentals,
  postBookRental,
  postGenerateQr,
} from "../controllers/rentalController.js";

export const rentalsRouter = Router();

rentalsRouter.get("/", listRentals);
rentalsRouter.post("/book", postBookRental);
rentalsRouter.get("/:id", getRentalById);
rentalsRouter.post("/:id/generate-qr", postGenerateQr);
