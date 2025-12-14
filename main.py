import pytz
from datetime import datetime
import os
import subprocess

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
    
    for url in urls:
        temp_png = f"{OUTPUT_DIR}/{url}_{timestamp}.png"
        final_webp = f"{OUTPUT_DIR}/{url}_{timestamp}.webp"
        
        print(f" > Capturing {url}")

        command = [
                "shot-scraper", url,
                "-o", temp_png,
                "--wait", "2000",
                "--width", "1440",
                "--height", "1080"
            ]
        
        command.extend(["--javascript", "()=>{}"])
    
        try:
            subprocess.run(command, check=True)
            
        except Exception as e:
            print(f"Error capturing {url}: {e}")

take_screenshots()