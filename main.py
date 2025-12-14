import pytz
from datetime import datetime
import os

URLS_FILE = "urls.txt"
OUTPUT_DIR = "screenshots"

def load_urls():
    if not os.path.exists(URLS_FILE):
        raise FileNotFoundError(f"{URLS_FILE} not found")

    with open(URLS_FILE) as file:
        return [line.strip() for line in file if line.strip()]

def take_screenshots():
    urls = load_urls()
    
    cet = pytz.timezone("Europe/Warsaw")
    timestamp = datetime.now(cet).strftime("%Y-%m-%d_%H-%M")
    
    print(f"\nScreenshot cycle {timestamp}")
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)