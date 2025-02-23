import { email, sendMail } from "./config";
import * as path from "path";

export interface MailData<T = never> {
  to: string;
  data: T;
}

export const waitlistSender = async (recipient: string, firstName: string) => {
  const mailOption = {
    template: "waitlist",
    message: {
      to: recipient,
    },
    locals: {
      name: firstName,
    },
  };

  await email.send(mailOption).catch(console.error);
};

export const sendWaitlist = async (mailData: MailData<{ name: string }>) => {
  const emailConfirmTitle = "Welcome to Humoni! 🎉";
  await sendMail({
    to: mailData.to,
    subject: emailConfirmTitle,
    templatePath: path.join(
      process.cwd(),
      "server",
      "mail-templates",
      "waitlist.hbs"
    ),
    context: {
      title: emailConfirmTitle,
      actionTitle: emailConfirmTitle,
      app_name: "Humoni",
      name: mailData.data.name,
      year: new Date().getFullYear(),
    },
  });
};
