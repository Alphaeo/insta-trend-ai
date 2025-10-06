import os, httpx, time
import request
APIFY_TOKEN = os.getenv("APIFY_TOKEN")
ACTOR_ID = os.getenv("APIFY_ACTOR_ID")

BASE_URL = "https://api.apify.com/v2"

def run_apify_scraper(hashtag: str, results_limit: int = 10):
    """
    Lance le scraper Apify pour un hashtag donné.
    """
    url = f"{BASE_URL}/acts/{ACTOR_ID}/runs?token={APIFY_TOKEN}"
    
    payload = {
        "hashtags": [hashtag],
        "resultsLimit": results_limit,
        "resultsType": "posts",
        "resultsLimitPerPage": 10,
        "searchType": "hashtag"
    }

    r = requests.post(url, json=payload)
    r.raise_for_status()
    run_data = r.json()
    run_id = run_data["data"]["id"]
    return run_id

def wait_for_run(run_id: str, timeout: int = 60):
    """
    Attend que le scraper ait terminé son run.
    """
    url = f"{BASE_URL}/actor-runs/{run_id}?token={APIFY_TOKEN}"
    start = time.time()
    while time.time() - start < timeout:
        r = requests.get(url)
        r.raise_for_status()
        status = r.json()["data"]["status"]
        if status == "SUCCEEDED":
            return True
        elif status in ["FAILED", "TIMED-OUT", "ABORTED"]:
            raise RuntimeError(f"Apify run failed with status {status}")
        time.sleep(3)
    raise TimeoutError("Apify run did not finish in time.")

def fetch_results(run_id: str):
    """
    Récupère les résultats du dataset généré par le run.
    """
    dataset_id = run_id  # pour Apify, run_id == dataset_id
    url = f"{BASE_URL}/datasets/{dataset_id}/items?token={APIFY_TOKEN}"
    r = requests.get(url)
    r.raise_for_status()
    return r.json()
