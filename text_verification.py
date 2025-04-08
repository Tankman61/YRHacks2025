import asyncio
from ollama import AsyncClient

async def chat(url, prompt_template):
    message = {
        'role': 'user',
        'content': prompt_template.format(url=url) + f" {url}"
    }
      
    client = AsyncClient()
    async for part in await client.chat(model='qwen2.5:7b', messages=[message], stream=True):
        print(part['message']['content'], end='', flush=True)

async def main():
    try:
        with open('prompt.txt', 'r') as f:
            prompt_template = f.read()
    except FileNotFoundError:
        print("Error: 'prompt.txt' file not found.")
        return

    test_url = "https://khanacademy.com/"
    await chat(test_url, prompt_template)


asyncio.run(main())
