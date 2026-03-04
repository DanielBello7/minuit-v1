/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { IMailModuleType } from '@app/util';
import { MailData } from '@app/util/index';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { type BrevoProvider } from './brevo.module';
import otpmail from './mailers/otp.mailer';
import axios from 'axios';

type EmailBody = {
  sender: { name: string; email: string };
  to: { email: string; name: string }[];
  subject: string;
  params?: Record<string, any>;
};

type HtmlEmailBody = EmailBody & {
  htmlContent: string;
};

type TextEmailBody = EmailBody & {
  textContent: string;
};

type TemplateEmailBody = EmailBody & {
  templateId: string;
};

type SendEmailBody = HtmlEmailBody | TemplateEmailBody | TextEmailBody;

type BrevoEmailResponse = {
  messageId: string;
};

@Injectable()
export class BrevoService extends IMailModuleType {
  private api: AxiosInstance;
  private email: string;
  private ename: string;

  constructor(
    @Inject('BREVO')
    private readonly config: BrevoProvider,
  ) {
    super();
    this.api = axios.create({
      baseURL: 'https://api.brevo.com/v3/smtp',
      headers: {
        Accept: 'application/json',
        'api-key': this.config.apiKy,
        'Content-Type': 'application/json',
      },
    });
    this.email = this.config.email;
    this.ename = this.config.ename;
  }

  private send_email = async (body: SendEmailBody): Promise<BrevoEmailResponse> => {
    const response = await this.api.post('/email', {
      ...body,
    });
    return response.data;
  };

  sendmail = async (data: MailData) => {
    if (data.htmlContent) {
      return this.send_email({
        sender: { email: this.email, name: this.ename },
        subject: data.subject,
        to: data.to.map((i) => ({ ...i, name: i.email })),
        htmlContent: data.htmlContent,
      });
    }
    if (data.textContent) {
      return this.send_email({
        sender: { email: this.email, name: this.ename },
        subject: data.subject,
        to: data.to.map((i) => ({ ...i, name: i.email })),
        textContent: data.textContent,
      });
    }
    throw new BadRequestException('content required');
  };

  sendotp = async (otp: string, email: string, name: string) => {
    return this.send_email({
      subject: 'minuit OTP',
      sender: { email: this.email, name: this.ename },
      to: [{ email, name }],
      htmlContent: otpmail(name, otp),
    });
  };
}
