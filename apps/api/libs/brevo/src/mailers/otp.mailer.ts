export default function otpEmail(name: string, otp: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border: 1px solid #dddddd;
            border-radius: 8px;
            overflow: hidden;
          }
          .email-header {
            color: #1e3a5f;
            padding: 20px;
            text-align: center;
            display: flex;
            align-items: center;
            gap: 1rem;
            justify-content: center;
          }
          .email-body {
            padding: 20px;
            color: #333333;
          }
          .email-footer {
            background-color: #f4f4f4;
            padding: 10px;
            text-align: center;
            color: #777777;
            font-size: 12px;
          }
          .otp-code {
            display: inline-block;
            padding: 10px 20px;
            font-size: 24px;
            color: #ffffff;
            background-color: #1e3a5f;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 6a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h3v4c0 .5.6.8 1 .4l3.6-4.4H23a4 4 0 0 0 4-4V10a4 4 0 0 0-4-4H5Z" fill="#1e3a5f"/>
              <path d="M13 14V11.5a3 3 0 1 1 6 0V14" stroke="white" stroke-width="1.25" stroke-linecap="round" fill="none"/>
              <rect x="13" y="14" width="6" height="5" rx="1" fill="white"/>
            </svg>
            <h1>minuit</h1>
          </div>
          <div class="email-body">
            <h2>Hey there ${name},</h2>
            <p>
              Please make use of the following one-time-verification code:
            </p>
            <div class="otp-code">${otp}</div>
            <p>
              Please do not share this code with anyone. If you did not request this
              code, please ignore this email or contact support.
            </p>
            <p>Thank you for using minuit.</p>
          </div>
          <div class="email-footer">
            <p>minuit</p>
            <p>&copy; ${new Date().getFullYear()} minuit. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
