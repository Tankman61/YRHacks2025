import ollama

def main():
    model = ""

    while True:
        user_input = input("You: ")
        if user_input.lower() in ['exit', 'quit']:
            print("Exiting chat.")
            break

        response = ollama.chat(
            model=model,
            messages=[
                {"role": "user", "content": user_input}
            ]
        )

        print("Ollama:", response['message']['content'])

main()