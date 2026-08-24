import { Hono } from "hono";
import { createNoticeSchema, updateNoticeSchema } from "../validators/noticeValidators.js";
import * as noticeService from "../services/noticeService.js";
import { authenticateUser, requireRole } from "../middleware/auth.js";
import { ok } from "../utils/response.js";

const noticesRoute = new Hono();

noticesRoute.use("*", authenticateUser);

noticesRoute.get("/", async (c) => {
  const list = await noticeService.listNotices();
  return ok(c, list);
});

noticesRoute.post("/", requireRole("ADMIN"), async (c) => {
  const user = c.get("user");
  const body = createNoticeSchema.parse(await c.req.json());
  const notice = await noticeService.createNotice(user.id, body);
  return ok(c, notice, 201);
});

noticesRoute.patch("/:id", requireRole("ADMIN"), async (c) => {
  const id = c.req.param("id")!;
  const body = updateNoticeSchema.parse(await c.req.json());
  const notice = await noticeService.updateNotice(id, body);
  return ok(c, notice);
});

noticesRoute.delete("/:id", requireRole("ADMIN"), async (c) => {
  const id = c.req.param("id")!;
  await noticeService.deleteNotice(id);
  return ok(c, { message: "Notice deleted" });
});

export default noticesRoute;
