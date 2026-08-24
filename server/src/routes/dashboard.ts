import { Hono } from "hono";
import * as dashboardService from "../services/dashboardService.js";
import { authenticateUser, requireRole } from "../middleware/auth.js";
import { ok } from "../utils/response.js";

const dashboardRoute = new Hono();

dashboardRoute.use("*", authenticateUser);

dashboardRoute.get("/resident", requireRole("RESIDENT"), async (c) => {
  const user = c.get("user");
  const data = await dashboardService.getResidentDashboard(user.id);
  return ok(c, data);
});

dashboardRoute.get("/admin", requireRole("ADMIN"), async (c) => {
  const data = await dashboardService.getAdminDashboard();
  return ok(c, data);
});

export default dashboardRoute;
