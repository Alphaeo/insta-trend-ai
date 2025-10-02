import os, httpx, time
APIFY_TOKEN = os.getenv("APIFY_TOKEN")

def call_apify_actor(actor_id: str, body: dict):
    url = f"https://api.apify.com/v2/actor-tasks/{actor_id}/runs?token={APIFY_TOKEN}"
    r = httpx.post(url, json=body, timeout=30)
    r.raise_for_status()
    return r.json()

# Example usage: schedule an actor run to collect latest reels for a hashtag

