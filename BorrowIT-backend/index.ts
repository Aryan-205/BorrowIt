import "dotenv/config";
import { createApp } from "./createApp.js";

const PORT = Number(process.env.PORT);

const app = createApp();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`BorrowIt API listening on http://localhost:${PORT}`);
});
