export type MailData = {
  to: { email: string }[];
  subject: string;
  textContent?: string;
  htmlContent?: string;
  params?: any;
};

export type MailModuleType = {
  sendmail(data: MailData): Promise<any>;
  sendotp(otp: string, email: string, name: string): Promise<any>;
};

export abstract class IMailModuleType {
  abstract sendmail(data: MailData): Promise<any>;
  abstract sendotp(otp: string, email: string, name: string): Promise<any>;
}
