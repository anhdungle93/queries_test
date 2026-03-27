import { open } from "sqlite";
import sqlite3 from "sqlite3";

import { createSchema } from "./schema";
import { getPendingOrders } from "./queries/order_queries";
import { alertStaleOrders } from "./slack";

async function main() {
  const db = await open({
    filename: "ecommerce.db",
    driver: sqlite3.Database,
  });

  await createSchema(db, false);

  const pendingOrders = await getPendingOrders(db);
  const staleOrders = pendingOrders.filter((o) => o.days_since_created > 3);
  await alertStaleOrders(staleOrders);
}

main();
