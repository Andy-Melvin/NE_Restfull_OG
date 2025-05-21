export const getPasswordResetTemplate = (resetUrl: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        /* Base styles */
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .email-wrapper {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 40px 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 20px;
        }
        .title {
            color: #2d3748;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 10px 0;
        }
        .subtitle {
            color: #718096;
            font-size: 16px;
            margin: 0;
        }
        .button {
            display: inline-block;
            background-color: #4299e1;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #3182ce;
        }
        .content {
            color: #4a5568;
            font-size: 16px;
            margin-bottom: 30px;
        }
        .footer {
            text-align: center;
            color: #718096;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        .warning {
            background-color: #fff5f5;
            border-left: 4px solid #f56565;
            padding: 15px;
            margin: 20px 0;
            color: #c53030;
        }
        @media only screen and (max-width: 600px) {
            .container {
                padding: 10px;
            }
            .email-wrapper {
                padding: 20px 15px;
            }
            .title {
                font-size: 20px;
            }
            .subtitle {
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <!-- Replace with your logo -->
                <img src="https://your-logo-url.com/logo.png" alt="Logo" class="logo">
                <h1 class="title">Reset Your Password</h1>
                <p class="subtitle">We received a request to reset your password</p>
            </div>
            
            <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
                <p>To reset your password, click the button below:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #4299e1;">${resetUrl}</p>
                
                <div class="warning">
                    <strong>Important:</strong> This link will expire in 1 hour for security reasons.
                </div>
            </div>
            
            <div class="footer">
                <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
`; 