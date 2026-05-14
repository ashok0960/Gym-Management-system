import random
import string

def generate_username(email):
    base = email.split('@')[0]
    random_suffix = ''.join(random.choices(string.digits, k=4))
    return f"{base}_{random_suffix}"