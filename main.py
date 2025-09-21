from agent.graph import agent
import argparse

def main():
    parser = argparse.ArgumentParser(description="AI Development Agent")
    parser.add_argument("prompt", type=str, help="The user prompt for the project to be generated.")
    args = parser.parse_args()

    print(f"Executing with prompt: {args.prompt}")

    result = agent.invoke(
        {"user_prompt": args.prompt},
        {"recursion_limit": 100}
    )
    
    print("\n\n--- Agent Run Finished ---")
    print("Final State:")
    print(result)


if __name__ == "__main__":
    main()