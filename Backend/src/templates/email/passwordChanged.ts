export const getPasswordChangedTemplate = () => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Changed Successfully</title>
    <style>
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
        .content {
            color: #4a5568;
            font-size: 16px;
            margin-bottom: 30px;
        }
        .warning {
            background-color: #fff5f5;
            border-left: 4px solid #f56565;
            padding: 15px;
            margin: 20px 0;
            color: #c53030;
        }
        .footer {
            text-align: center;
            color: #718096;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        .time {
            color: #718096;
            font-size: 14px;
            margin-top: 20px;
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
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <!-- Replace with your logo -->
                <img src="https://your-logo-url.com/logo.png" alt="Logo" class="logo">
                <h1 class="title">Password Changed Successfully</h1>
            </div>
            
            <div class="content">
                <p>Hello,</p>
                <p>Your password has been successfully changed.</p>
                
                <div class="warning">
                    <strong>Important:</strong> If you did not make this change, please contact our support team immediately.
                </div>

                <p class="time">Time: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="footer">
                <p>This is an automated message, please do not reply.</p>
                <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
`; 