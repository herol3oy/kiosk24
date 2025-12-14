URLS_FILE = "urls.txt"

def load_urls():
    with open(URLS_FILE, "r") as file:
        for line in file:
            print(line.strip())
            
load_urls()
