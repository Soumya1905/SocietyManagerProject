import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index.js";

async function main() {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations applied successfully");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed", err);
  process.exit(1);
});
