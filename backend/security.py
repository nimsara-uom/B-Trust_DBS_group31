import os
import hashlib
import secrets

def hash_password(plain_password: str) -> str:
    """
    Hashes a password using PBKDF2-HMAC-SHA256 with a unique 16-byte random salt.
    Format: pbkdf2:sha256:100000:<salt_hex>:<hash_hex>
    """
    salt = os.urandom(16).hex()
    dk = hashlib.pbkdf2_hmac(
        'sha256',
        plain_password.encode('utf-8'),
        bytes.fromhex(salt),
        100000
    ).hex()
    return f"pbkdf2:sha256:100000:{salt}:{dk}"

def verify_password(plain_password: str, stored_hash: str) -> bool:
    """
    Verifies a plain text password against a stored hash or plaintext password.
    Supports:
    1. PBKDF2 hash: pbkdf2:sha256:100000:<salt_hex>:<hash_hex>
    2. Legacy plain text (seamless fallback and backward compatibility)
    """
    if not stored_hash or not plain_password:
        return False

    if stored_hash.startswith("pbkdf2:sha256:"):
        parts = stored_hash.split(":")
        if len(parts) == 5:
            _, _, iterations_str, salt_hex, expected_hash = parts
            try:
                iterations = int(iterations_str)
                calc_dk = hashlib.pbkdf2_hmac(
                    'sha256',
                    plain_password.encode('utf-8'),
                    bytes.fromhex(salt_hex),
                    iterations
                ).hex()
                return secrets.compare_digest(calc_dk, expected_hash)
            except Exception:
                return False

    # Fallback to direct comparison (in case of legacy plaintext before migration)
    return secrets.compare_digest(plain_password.encode('utf-8'), stored_hash.encode('utf-8'))
