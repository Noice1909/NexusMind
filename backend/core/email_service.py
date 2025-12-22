"""
Email service for sending transactional emails
Supports SMTP and can be extended for services like SendGrid, Mailgun, etc.
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# Email configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)
FROM_NAME = os.getenv("FROM_NAME", "NexusMind")

# Frontend URL for links
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


class EmailService:
    """Service for sending emails via SMTP"""
    
    def __init__(self):
        self.smtp_host = SMTP_HOST
        self.smtp_port = SMTP_PORT
        self.smtp_user = SMTP_USER
        self.smtp_password = SMTP_PASSWORD
        self.from_email = FROM_EMAIL
        self.from_name = FROM_NAME
    
    def _send_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None
    ) -> bool:
        """
        Send an email using SMTP
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_body: HTML version of email body
            text_body: Plain text version of email body (optional)
        
        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Add text and HTML parts
            if text_body:
                part1 = MIMEText(text_body, 'plain')
                msg.attach(part1)
            
            part2 = MIMEText(html_body, 'html')
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                if self.smtp_user and self.smtp_password:
                    server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            print(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            print(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        """
        Send password reset email
        
        Args:
            to_email: User's email address
            reset_token: Password reset token
        
        Returns:
            True if email sent successfully
        """
        reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
        
        subject = "Reset Your NexusMind Password"
        
        # HTML version
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .container {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 10px;
                    padding: 40px;
                    color: white;
                }}
                .content {{
                    background: white;
                    border-radius: 8px;
                    padding: 30px;
                    margin-top: 20px;
                    color: #333;
                }}
                .button {{
                    display: inline-block;
                    padding: 12px 30px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                    font-weight: bold;
                }}
                .footer {{
                    margin-top: 30px;
                    font-size: 12px;
                    color: #999;
                    text-align: center;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1 style="margin: 0;">🔐 NexusMind</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">AI-Powered Note Taking</p>
            </div>
            
            <div class="content">
                <h2>Reset Your Password</h2>
                <p>Hi there,</p>
                <p>We received a request to reset your password for your NexusMind account. Click the button below to create a new password:</p>
                
                <div style="text-align: center;">
                    <a href="{reset_link}" class="button">Reset Password</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
                    {reset_link}
                </p>
                
                <p><strong>This link will expire in 1 hour.</strong></p>
                
                <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                
                <p>Best regards,<br>The NexusMind Team</p>
            </div>
            
            <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>&copy; 2025 NexusMind. All rights reserved.</p>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        text_body = f"""
        Reset Your NexusMind Password
        
        Hi there,
        
        We received a request to reset your password for your NexusMind account.
        
        Click the link below to create a new password:
        {reset_link}
        
        This link will expire in 1 hour.
        
        If you didn't request a password reset, you can safely ignore this email.
        
        Best regards,
        The NexusMind Team
        """
        
        return self._send_email(to_email, subject, html_body, text_body)
    
    def send_welcome_email(self, to_email: str, full_name: Optional[str] = None) -> bool:
        """
        Send welcome email to new users
        
        Args:
            to_email: User's email address
            full_name: User's full name (optional)
        
        Returns:
            True if email sent successfully
        """
        greeting = f"Hi {full_name}," if full_name else "Hi there,"
        
        subject = "Welcome to NexusMind! 🎉"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .container {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 10px;
                    padding: 40px;
                    color: white;
                }}
                .content {{
                    background: white;
                    border-radius: 8px;
                    padding: 30px;
                    margin-top: 20px;
                    color: #333;
                }}
                .feature {{
                    margin: 15px 0;
                    padding-left: 25px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1 style="margin: 0;">✨ Welcome to NexusMind!</h1>
            </div>
            
            <div class="content">
                <p>{greeting}</p>
                <p>Thank you for joining NexusMind! We're excited to help you organize your thoughts and boost your productivity with AI-powered note-taking.</p>
                
                <h3>🚀 Get Started:</h3>
                <div class="feature">📝 Create your first note</div>
                <div class="feature">🏷️ Use AI to generate tags automatically</div>
                <div class="feature">🔍 Search and organize your notes effortlessly</div>
                <div class="feature">📊 Visualize connections with the graph view</div>
                
                <p>If you have any questions or need help, feel free to reach out to our support team.</p>
                
                <p>Happy note-taking!<br>The NexusMind Team</p>
            </div>
        </body>
        </html>
        """
        
        text_body = f"""
        Welcome to NexusMind!
        
        {greeting}
        
        Thank you for joining NexusMind! We're excited to help you organize your thoughts and boost your productivity with AI-powered note-taking.
        
        Get Started:
        - Create your first note
        - Use AI to generate tags automatically
        - Search and organize your notes effortlessly
        - Visualize connections with the graph view
        
        Happy note-taking!
        The NexusMind Team
        """
        
        return self._send_email(to_email, subject, html_body, text_body)


# Singleton instance
email_service = EmailService()
