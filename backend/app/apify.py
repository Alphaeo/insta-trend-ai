import os
from apify_client import ApifyClient

APIFY_TOKEN = os.getenv("APIFY_TOKEN")
ACTOR_ID = os.getenv("APIFY_ACTOR_ID")

client = ApifyClient(APIFY_TOKEN)

def run_apify_scraper(hashtag: str, results_limit: int = 5):
    """
    Lance le scraper Apify pour un hashtag donné et retourne les résultats.
    """
    run_input = {
        "searchType": "hashtag",
        "hashtags": [hashtag],
        "resultsType": "posts",
        "resultsLimit": results_limit,
        "searchLimit": results_limit
    }

    run = client.actor(ACTOR_ID).call(run_input=run_input)
    dataset_id = run["defaultDatasetId"]

    results = list(client.dataset(dataset_id).iterate_items())
    return results

