import hashlib, hmac

def hmacsha512(key, data):
    byte_key = str.encode(key)
    byte_data = str.encode(data)
    return hmac.new(byte_key, byte_data, hashlib.sha512).hexdigest()