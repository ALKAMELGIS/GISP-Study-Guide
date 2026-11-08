import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":794,"height":1123},device_scale_factor=3.125)
    for n in ("cover","back"):
      await pg.goto("file:///home/claude/notes/cover/"+n+".html"); await pg.wait_for_timeout(900); await pg.screenshot(path=n+"_a4.png")
    await b.close()
asyncio.run(main())
