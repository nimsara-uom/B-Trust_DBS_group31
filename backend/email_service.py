"""
email_service.py
================
Sends transaction alert emails via the Brevo (formerly Sendinblue) transactional
email API.

Usage
-----
    from email_service import send_transaction_email
    send_transaction_email(
        to_email="customer@example.com",
        to_name="John Doe",
        transaction_type="Withdrawal",   # "Withdrawal" | "Deposit"
        amount=4500.00,
        account_number="SA-00475",
        balance=4033.42,
    )
"""

import logging
from config import settings

try:
    import sib_api_v3_sdk  # type: ignore[import-untyped]
    from sib_api_v3_sdk.rest import ApiException  # type: ignore[import-untyped]
    _BREVO_AVAILABLE = True
except ImportError:
    _BREVO_AVAILABLE = False

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)


def _mask_account_number(account_number: str) -> str:
    """
    Masks all characters except the last 3 digits of the numeric part.
    E.g. 'SA-00475' -> 'XXXXXXXXXX475'
    Only digits are considered; non-digit characters are stripped first.
    """
    digits = "".join(ch for ch in account_number if ch.isdigit())
    if len(digits) <= 3:
        visible = digits
    else:
        visible = digits[-3:]
    masked = "X" * 10 + visible  # always 10 X's + last 3 digits
    return masked


def _send_via_smtp(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: str,
    sender_name: str,
    sender_email: str,
) -> bool:
    """Sends email via standard SMTP (e.g. Brevo SMTP relay). Returns True if successful."""
    smtp_server = getattr(settings, "SMTP_SERVER", "smtp-relay.brevo.com")
    smtp_port = getattr(settings, "SMTP_PORT", 587)
    smtp_login = getattr(settings, "SMTP_LOGIN", "")
    smtp_password = getattr(settings, "SMTP_PASSWORD", "") or getattr(settings, "BREVO_API_KEY", "")

    if not smtp_login or not smtp_password:
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{sender_name} <{sender_email}>"
    msg["To"] = to_email

    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(smtp_server, smtp_port, timeout=15) as server:
            server.starttls()
            server.login(smtp_login, smtp_password)
            server.send_message(msg)
        return True
    except Exception as exc:
        logger.error("SMTP sending failed: %s", exc)
        return False


def send_transaction_email(
    to_email: str,
    to_name: str,
    transaction_type: str,   # "Withdrawal" or "Deposit"
    amount: float,
    account_number: str,
    balance: float,
) -> None:
    """
    Sends a transaction alert email via Brevo (SMTP or HTTP API).
    """
    api_key = settings.BREVO_API_KEY
    sender_email = settings.BREVO_SENDER_EMAIL
    sender_name = settings.BREVO_SENDER_NAME

    if not to_email or not to_email.strip():
        logger.info("Customer has no email address — skipping transaction email.")
        return

    masked_acc = _mask_account_number(account_number)

    if transaction_type == "Withdrawal":
        subject = "B-Trust Bank — Withdrawal Alert"
        text_body = (
            f"Withdrawal Rs {amount:,.2f} From A/C No {masked_acc}. "
            f"Balance available Rs {balance:,.2f}"
        )
    else:
        subject = "B-Trust Bank — Deposit Alert"
        text_body = (
            f"Deposit Rs {amount:,.2f} To A/C No {masked_acc}. "
            f"Balance available Rs {balance:,.2f}"
        )

    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; max-width: 520px; margin: auto; padding: 24px;">
        <div style="background: #1a3c5e; padding: 16px 24px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #ffffff; margin: 0;">B-Trust Digital Banking</h2>
        </div>
        <div style="border: 1px solid #e0e0e0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 15px;">Dear <strong>{to_name}</strong>,</p>
          <p style="font-size: 15px;">
            Your account has been updated with the following transaction:
          </p>
          <div style="background: #f4f7fb; border-left: 4px solid #1a3c5e; padding: 14px 18px; margin: 16px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #1a3c5e;">{text_body}</p>
          </div>
          <p style="font-size: 13px; color: #777;">
            If you did not authorise this transaction, please contact us immediately at
            <a href="mailto:support@btrustbank.lk">support@btrustbank.lk</a>.
          </p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #aaa; margin: 0;">
            &copy; B-Trust Digital Banking System. This is an automated notification.
          </p>
        </div>
      </body>
    </html>
    """

    # 1. Prefer SMTP relay if configured (matches Brevo SMTP credentials: xsmtpsib-...)
    if getattr(settings, "SMTP_LOGIN", None):
        success = _send_via_smtp(
            to_email=to_email,
            subject=subject,
            html_body=html_body,
            text_body=text_body,
            sender_name=sender_name,
            sender_email=sender_email,
        )
        if success:
            logger.info(
                "Transaction alert sent via SMTP to %s (%s, Rs %.2f)",
                to_email, transaction_type, amount
            )
            return

    # 2. Fallback to Brevo HTTP API SDK if api-key is available
    if _BREVO_AVAILABLE and api_key:
        try:
            configuration = sib_api_v3_sdk.Configuration()
            configuration.api_key["api-key"] = api_key
            api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
                sib_api_v3_sdk.ApiClient(configuration)
            )
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                sender={"name": sender_name, "email": sender_email},
                to=[{"email": to_email, "name": to_name}],
                subject=subject,
                html_content=html_body,
                text_content=text_body,
            )
            api_instance.send_transac_email(send_smtp_email)
            logger.info(
                "Transaction email sent via Brevo API to %s (%s, Rs %.2f)",
                to_email, transaction_type, amount
            )
            return
        except ApiException as exc:
            logger.error("Brevo API error while sending email: %s", exc)
        except Exception as exc:
            logger.error("Unexpected error while sending transaction email: %s", exc)
    else:
        logger.warning("No working email configuration (SMTP or Brevo API key) found.")

