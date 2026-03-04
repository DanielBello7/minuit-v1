import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IMailModuleType } from '@app/util';

@Injectable()
export class AppService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly mail: IMailModuleType,
  ) {}

  check_db = async () => {
    try {
      await this.dataSource.query('SELECT 1'); // simple DB ping
      return true;
    } catch {
      return false;
    }
  };

  check_email = async () => {
    try {
      // Send a test email to verify email service health
      await this.mail.sendmail({
        to: [{ email: 'gokebello@gmail.com' }],
        subject: 'Health Check - Email Service Test',
        textContent:
          'This is a health check email from the API service. If you receive this, the email service is working correctly.',
      });
      return true;
    } catch {
      return false;
    }
  };

  get_health = async () => {
    const db_status = await this.check_db();
    const email_status = await this.check_email();

    const allHealthy = db_status && email_status; // && apiStatus if used

    return {
      status: allHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE,
      is_active: true, // service itself is running
      timestamp: new Date().toISOString(),
      services: {
        allHealthy,
        email: email_status,
        database: db_status,
      },
      uptime: process.uptime(), // seconds since process start
      version: process.env.APP_VERSION || '1.0.0',
    };
  };
}
