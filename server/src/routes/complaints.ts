import { Hono } from "hono";
import {
  createComplaintSchema,
  updateStatusSchema,
  updatePrioritySchema,
  complaintQuerySchema,
} from "../validators/complaintValidators.js";
import * as complaintService from "../services/complaintService.js";
import { saveComplaintPhoto } from "../services/uploadService.js";
import { authenticateUser, requireRole } from "../middleware/auth.js";
import { ok } from "../utils/response.js";

const complaintsRoute = new Hono();

complaintsRoute.use("*", authenticateUser);

complaintsRoute.post("/", async (c) => {
  const user = c.get("user");
  const contentType = c.req.header("content-type") ?? "";

  let category: string;
  let description: string;
  let photoUrl: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    const body = await c.req.parseBody();
    category = String(body.category ?? "");
    description = String(body.description ?? "");
    const photo = body.photo;
    if (photo instanceof File && photo.size > 0) {
      photoUrl = await saveComplaintPhoto(photo);
    }
  } else {
    const json = await c.req.json();
    category = json.category;
    description = json.description;
  }

  const parsed = createComplaintSchema.parse({ category, description });
  const complaint = await complaintService.createComplaint(user, { ...parsed, photoUrl });
  return ok(c, complaint, 201);
});

complaintsRoute.get("/", async (c) => {
  const user = c.get("user");
  const query = complaintQuerySchema.parse(c.req.query());
  const complaintsList = await complaintService.listComplaints(user, query);
  return ok(c, complaintsList);
});

complaintsRoute.get("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id")!;
  const complaint = await complaintService.getComplaintDetails(user, id);
  return ok(c, complaint);
});

complaintsRoute.patch("/:id/status", requireRole("ADMIN"), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id")!;
  const body = updateStatusSchema.parse(await c.req.json());
  const complaint = await complaintService.updateComplaintStatus(user, id, body);
  return ok(c, complaint);
});

complaintsRoute.patch("/:id/priority", requireRole("ADMIN"), async (c) => {
  const id = c.req.param("id")!;
  const body = updatePrioritySchema.parse(await c.req.json());
  const complaint = await complaintService.updateComplaintPriority(id, body.priority);
  return ok(c, complaint);
});

export default complaintsRoute;
