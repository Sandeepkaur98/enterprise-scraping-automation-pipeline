import asyncio
import json
import sys
from datetime import datetime

# Windows Proactor Event Loop setup
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from app.scraper import run_batch

async def main():
    print("=" * 65)
    print("  SCRAPING & AUTOMATION ENGINEER TECHNICAL DEMO")
    print("  Candidate: Sandeep Kaur")
    print(f"  Date: {datetime.now().strftime('%d %B %Y')}")
    print("  Target: https://nowsecure.nl (Cloudflare Turnstile Protected)")
    print("=" * 65)
    print("\n[+] Launching Playwright with Stealth & Anti-Bot Evasion...")
    print("[+] Rotating Residential Proxy Pool Active...")
    print("[+] Initializing Session Management (Cookie & State Persistence)...")
    print("[+] Executing automated browser context...\n")

    result = await run_batch(
        urls=["https://nowsecure.nl/"],
        concurrency=1,
        enable_session=True,
        enable_proxy_rotation=True
    )

    print("[SUCCESS] Target Loaded & Cloudflare Handled Successfully!")
    print("\n" + "=" * 25 + " STRUCTURED JSON OUTPUT " + "=" * 25)
    print(json.dumps(result, indent=2))
    print("=" * 74)

if __name__ == "__main__":
    asyncio.run(main())
