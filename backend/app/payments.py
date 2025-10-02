import os, requests

IAMPORT_KEY = os.getenv("IAMPORT_API_KEY")
IAMPORT_SECRET = os.getenv("IAMPORT_API_SECRET")

def get_iamport_token():
    url = "https://api.iamport.kr/users/getToken"
    res = requests.post(url, data={"imp_key": IAMPORT_KEY, "imp_secret": IAMPORT_SECRET})
    res.raise_for_status()
    return res.json()["response"]["access_token"]

def verify_payment(imp_uid):
    token = get_iamport_token()
    headers = {"Authorization": token}
    res = requests.get(f"https://api.iamport.kr/payments/{imp_uid}", headers=headers)
    res.raise_for_status()
    return res.json()

