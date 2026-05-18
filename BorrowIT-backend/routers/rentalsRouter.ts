import { Router } from "express";
import {
  getRentalById,
  listRentals,
  postBookRental,
  postGenerateQr,
  postScanQr,
  patchRentalStatus,
} from "../controllers/rentalController.js";
import { requireAuth } from "../lib/requireAuth.js";

export const rentalsRouter = Router();

rentalsRouter.get("/", requireAuth, listRentals);
rentalsRouter.post("/book", requireAuth, postBookRental);
rentalsRouter.get("/:id", requireAuth, getRentalById);
rentalsRouter.post("/:id/generate-qr", requireAuth, postGenerateQr);
rentalsRouter.post("/:id/scan-qr", requireAuth, postScanQr);
rentalsRouter.patch("/:id/status", requireAuth, patchRentalStatus);
