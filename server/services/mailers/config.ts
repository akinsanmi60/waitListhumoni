import Email from "email-templates";
import nodemailer from "nodemailer";
import { config } from "dotenv";
import * as path from "path";
import * as fs from "fs/promises";
import Handlebars from "handlebars";

config();

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.GMAILUSERNAME,
    pass: process.env.GMAILPASSWORD,
  },
});

export const email = new Email({
  views: {
    root: path.join(process.cwd(), "server", "mail-templates"),
    options: { extension: "hbs" },
  },
  message: {
    from: process.env.FROM,
  },
  send: true,
  transport: transporter,
});
export const sendMail = async ({
  templatePath,
  context,
  ...mailOptions
}: nodemailer.SendMailOptions & {
  templatePath: string;
  context: Record<string, unknown>;
}): Promise<void> => {
  let html: string | undefined;

  if (templatePath) {
    const template = await fs.readFile(templatePath, "utf-8");
    html = Handlebars.compile(template, {
      strict: true,
    })(context);
  }

  await transporter.sendMail({
    ...mailOptions,
    from: process.env.FROM,
    html: mailOptions.html ? mailOptions.html : html,
  });
};
