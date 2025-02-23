import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertWaitlistSchema } from "@shared/schema";
import { ZodError } from "zod";
import { randomBytes } from "crypto";
import { sendWaitlist } from "./services/mailers/senders";

export function registerRoutes(app: Express) {
  app.post("/api/waitlist", async (req, res) => {
    try {
      const entry = insertWaitlistSchema.parse(req.body);
      const referralCode = randomBytes(4).toString("hex").toUpperCase();
      const referredBy = req.query.ref as string;

      const result = await storage.createWaitlistEntry({
        ...entry,
        referralCode,
        referredBy,
      });

      const total = await storage.getWaitlistCount();

      // Try to send welcome email, but don't block if it fails
      try {
        // await sendWaitlistWelcomeEmail(entry.email, {
        //   name: entry.name,
        //   position: result.position as number,
        //   total,
        //   referralCode: result.referralCode,
        // });

        await sendWaitlist({
          to: entry.email,
          data: {
            name: entry.name,
          },
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Continue without sending email
      }

      res.status(201).json({
        success: true,
        data: {
          ...result,
          total,
        },
        message: "Successfully joined the waitlist!",
      });
    } catch (error) {
      console.error("Waitlist error:", error);

      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Please check your input and try again",
          details: error.errors,
        });
      }

      if (error instanceof Error && "code" in error && error.code === "23505") {
        return res.status(409).json({
          success: false,
          error: "DUPLICATE_ENTRY",
          message: "This email is already registered for the waitlist",
        });
      }

      res.status(500).json({
        success: false,
        error: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      });
    }
  });

  app.get("/api/waitlist", async (_req, res) => {
    try {
      const entries = await storage.getWaitlistEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching waitlist:", error);
      res.status(500).json({
        success: false,
        error: "SERVER_ERROR",
        message: "Server error occurred while fetching waitlist entries",
      });
    }
  });

  app.get("/api/waitlist/position", async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({
          success: false,
          error: "MISSING_EMAIL",
          message: "Email is required",
        });
      }

      const position = await storage.getWaitlistPosition(email);
      if (!position) {
        return res.status(404).json({
          success: false,
          error: "NOT_FOUND",
          message: "User not found in waitlist",
        });
      }

      const total = await storage.getWaitlistCount();
      const referralCount = await storage.getReferralCount(
        position.referralCode
      );

      res.json({
        success: true,
        data: {
          position: position.position,
          total,
          referralCode: position.referralCode,
          referralCount,
          milestones: position.milestones,
        },
      });
    } catch (error) {
      console.error("Error fetching position:", error);
      res.status(500).json({
        success: false,
        error: "SERVER_ERROR",
        message: "An unexpected error occurred while fetching your position",
      });
    }
  });

  return createServer(app);
}
