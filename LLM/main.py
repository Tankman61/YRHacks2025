from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import re
import asyncio
from ollama import AsyncClient

app = FastAPI()

# CORS configuration: Allow all origins for development.
# In production, restrict this to your trusted origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # e.g., ["http://localhost:3000"] for a specific frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def clean_text(text: str) -> str:
    """
    Replaces any character that is not a letter or number with a space,
    and ensures that there are no consecutive spaces.
    
    Parameters:
        text (str): The input string.
        
    Returns:
        str: The cleaned string with non-alphanumeric characters replaced by spaces,
             and with consecutive spaces compressed to a single space.
    """
    # Replace non-alphanumeric characters with a space
    cleaned_text = re.sub(r'[^a-zA-Z0-9]', ' ', text)
    # Replace one or more whitespace characters with a single space and remove any leading/trailing spaces
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()
    
    print(cleaned_text)
    return cleaned_text

# Load the prompt template on startup.
try:
    with open('prompt.txt', 'r') as f:
        PROMPT_TEMPLATE = f.read()
except FileNotFoundError:
    PROMPT_TEMPLATE = None
    print("Error: 'prompt.txt' file not found.")

@app.get("/api/check")
async def check_website(url: str):
    if PROMPT_TEMPLATE is None:
        raise HTTPException(status_code=500, detail="Prompt template not loaded.")

    # Clean the URL by replacing non-alphanumeric characters with spaces.
    cleaned_url = clean_text(url)

    # Build the prompt using the cleaned URL.
    message = {
        "role": "user",
        "content": PROMPT_TEMPLATE.format(url=cleaned_url) + f" {cleaned_url}"
    }


    output_chunks = []
    client = AsyncClient()

    try:
        # Stream the result from the model.
        async for part in await client.chat(model="qwen2.5:14b", messages=[message], stream=True):
            output_chunks.append(part["message"]["content"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama call failed: {str(e)}")

    # Join the streamed output.
    response_text = "".join(output_chunks)
    # Simple decision logic: the URL is marked as distracting if the response contains "true".
    distraction = "true" in response_text.lower()

    print(response_text)
    return {"url": url, "distraction": distraction, "output": response_text}

# Run the app when executing this module directly.
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
