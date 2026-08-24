import { db, pool } from "./index.js";
import { users, complaints, complaintHistory, notices } from "./schema.js";
import { hashPassword } from "../utils/password.js";

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function main() {
  console.log("Seeding database...");

  await db.delete(complaintHistory);
  await db.delete(complaints);
  await db.delete(notices);
  await db.delete(users);

  const adminPasswordHash = await hashPassword("Admin@123");
  const residentPasswordHash = await hashPassword("Resident@123");

  const [admin] = await db
    .insert(users)
    .values({
      fullName: "Priya Sharma",
      email: "admin@society.dev",
      passwordHash: adminPasswordHash,
      apartmentNumber: "OFFICE",
      role: "ADMIN",
    })
    .returning();

  const residentSeeds = [
    { fullName: "Rahul Verma", email: "rahul@society.dev", apartmentNumber: "A-101" },
    { fullName: "Anjali Nair", email: "anjali@society.dev", apartmentNumber: "B-204" },
    { fullName: "Karan Mehta", email: "karan@society.dev", apartmentNumber: "C-305" },
    { fullName: "Sneha Iyer", email: "sneha@society.dev", apartmentNumber: "A-402" },
  ];

  const residents = [];
  for (const r of residentSeeds) {
    const [created] = await db
      .insert(users)
      .values({ ...r, passwordHash: residentPasswordHash, role: "RESIDENT" })
      .returning();
    residents.push(created);
  }

  const [rahul, anjali, karan, sneha] = residents;

  const complaintSeeds = [
    {
      resident: rahul,
      category: "PLUMBING" as const,
      description: "Kitchen sink is leaking continuously and water is pooling under the cabinet.",
      status: "OPEN" as const,
      priority: "HIGH" as const,
      createdAt: daysAgo(6),
    },
    {
      resident: anjali,
      category: "ELECTRICAL" as const,
      description: "Power socket in the living room sparks when any appliance is plugged in.",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
      createdAt: daysAgo(4),
    },
    {
      resident: karan,
      category: "LIFT" as const,
      description: "Lift in Block C makes a loud grinding noise and stops briefly between floors.",
      status: "OPEN" as const,
      priority: "MEDIUM" as const,
      createdAt: daysAgo(1),
    },
    {
      resident: sneha,
      category: "SECURITY" as const,
      description: "The main gate security camera has been offline for the past two days.",
      status: "RESOLVED" as const,
      priority: "HIGH" as const,
      createdAt: daysAgo(10),
    },
    {
      resident: rahul,
      category: "CLEANLINESS" as const,
      description: "Garbage near the B-block staircase has not been collected in three days.",
      status: "IN_PROGRESS" as const,
      priority: "MEDIUM" as const,
      createdAt: daysAgo(2),
    },
    {
      resident: anjali,
      category: "PARKING" as const,
      description: "Visitor vehicles are frequently blocking my allotted parking spot B-204.",
      status: "OPEN" as const,
      priority: "LOW" as const,
      createdAt: daysAgo(0),
    },
    {
      resident: karan,
      category: "WATER_SUPPLY" as const,
      description: "Water pressure on the third floor has been very low since Monday morning.",
      status: "RESOLVED" as const,
      priority: "MEDIUM" as const,
      createdAt: daysAgo(8),
    },
    {
      resident: sneha,
      category: "OTHER" as const,
      description: "Requesting a designated area for children to play in the evening near the garden.",
      status: "OPEN" as const,
      priority: "LOW" as const,
      createdAt: daysAgo(3),
    },
  ];

  for (const seed of complaintSeeds) {
    const [complaint] = await db
      .insert(complaints)
      .values({
        residentId: seed.resident.id,
        category: seed.category,
        description: seed.description,
        status: seed.status,
        priority: seed.priority,
        createdAt: seed.createdAt,
        updatedAt: seed.createdAt,
        resolvedAt: seed.status === "RESOLVED" ? daysAgo(0) : null,
      })
      .returning();

    await db.insert(complaintHistory).values({
      complaintId: complaint.id,
      previousStatus: null,
      newStatus: "OPEN",
      actorId: seed.resident.id,
      note: "Complaint created",
      createdAt: seed.createdAt,
    });

    if (seed.status === "IN_PROGRESS" || seed.status === "RESOLVED") {
      await db.insert(complaintHistory).values({
        complaintId: complaint.id,
        previousStatus: "OPEN",
        newStatus: "IN_PROGRESS",
        actorId: admin.id,
        note: "Technician assigned to investigate the issue.",
        createdAt: daysAgo(Math.max(0, seed.createdAt === daysAgo(0) ? 0 : 1)),
      });
    }

    if (seed.status === "RESOLVED") {
      await db.insert(complaintHistory).values({
        complaintId: complaint.id,
        previousStatus: "IN_PROGRESS",
        newStatus: "RESOLVED",
        actorId: admin.id,
        note: "Issue fixed and verified on-site.",
        createdAt: daysAgo(0),
      });
    }
  }

  await db.insert(notices).values([
    {
      title: "Water Supply Maintenance on Sunday",
      content:
        "Water supply will be temporarily suspended on Sunday from 10 AM to 2 PM for tank cleaning. Please store water in advance.",
      isImportant: true,
      createdBy: admin.id,
    },
    {
      title: "Annual General Meeting Scheduled",
      content:
        "The Annual General Meeting for all residents will be held in the community hall next Saturday at 6 PM.",
      isImportant: true,
      createdBy: admin.id,
    },
    {
      title: "Diwali Celebration Committee",
      content: "Residents interested in organizing the Diwali celebration can register at the office by Friday.",
      isImportant: false,
      createdBy: admin.id,
    },
    {
      title: "Parking Sticker Renewal",
      content: "All residents must renew their vehicle parking stickers at the security office by month end.",
      isImportant: false,
      createdBy: admin.id,
    },
  ]);

  console.log("Seed complete.");
  console.log("Admin login: admin@society.dev / Admin@123");
  console.log("Resident login: rahul@society.dev / Resident@123");

  await pool.end();
}

main().catch((err) => {
  console.error("Seeding failed", err);
  process.exit(1);
});
