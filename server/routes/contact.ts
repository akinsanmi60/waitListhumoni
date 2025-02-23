import { Router } from "express";
import { z } from "zod";
import { sendContactEmail } from "../services/email";

const router = Router();

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
  consent: z.boolean().refine((val) => val === true),
});

router.post("/api/contact", async (req, res) => {
  try {
    const validatedData = contactSchema.parse(req.body);
    
    // Log the contact request (excluding the message content for privacy)
    console.log(`Contact request received from ${validatedData.email}`);
    
    // Send notification email to admin
    await sendContactEmail({
      name: validatedData.name,
      email: validatedData.email,
      message: validatedData.message,
    });

    // Send success response
    res.status(200).json({ message: "Contact request received" });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(400).json({ message: "Invalid request" });
  }
});

export default router;
