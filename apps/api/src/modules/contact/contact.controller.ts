import { Request, Response } from "express";
import { contactService } from "./contact.service.js";

export class ContactController {
  public async submit(req: Request, res: Response): Promise<void> {
    const { fullName, email, phoneNumber, whatsappNumber, country, companyName, subject, message, sourcePage } = req.body;

    const result = await contactService.submitContactMessage({
      fullName,
      email,
      phoneNumber,
      whatsappNumber,
      country,
      companyName,
      subject,
      message,
      sourcePage,
    });

    res.status(201).json({
      success: true,
      message: "Thank you for reaching out! Your message has been received.",
      data: result,
    });
  }

  public async list(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await contactService.getContactMessages(page, limit);

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  }
}

export const contactController = new ContactController();
