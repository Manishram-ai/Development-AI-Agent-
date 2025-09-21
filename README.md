# AI Development Agent Agent

This project is a multi-agent system designed to generate complete software projects from a user's prompt. It uses a Planner-Architect-Coder workflow to create a project plan, design the architecture, and write the code.

## Features

-   **Multi-Agent Architecture**: Divides the complex task of code generation among specialized agents.
    -   **Planner Agent**: Creates a high-level plan for the project.
    -   **Architect Agent**: Designs the project structure and breaks down the implementation into tasks.
    -   **Coder Agent**: Writes the code for each task using a set of tools.
-   **Code Generation**: Automatically generates code based on the user's requirements.
-   **Tool-Using Agent**: The Coder agent can interact with the file system to create and modify files.
-   **Powered by LangGraph and Groq**: Built on top of modern AI frameworks for creating powerful and efficient agents.

## Project Structure
agent_project/
├── agent/
│   ├── graph.py          # The main agent workflow and graph definition.
│   ├── prompts.py        # Prompts for each agent.
│   ├── states.py         # Pydantic models for the agent's state.
│   └── tools.py          # Tools for the Coder agent (e.g., file I/O).
├── generated_project/    # The directory where the generated project is saved.
├── main.py               # The main entry point to run the agent.
├── pyproject.toml        # Project metadata and dependencies.
└── README.md             # This file.


## Getting Started

### Prerequisites

-   Python 3.11+
-   [uv](https://github.com/astral-sh/uv) (for package management)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd agent-project
    ```

2.  **Create a virtual environment and install dependencies:**
    ```sh
    uv venv
    source .venv/bin/activate
    uv pip install -r requirements.txt 
    ```
    *(Note: You may need to generate a `requirements.txt` from `pyproject.toml` or install directly if `uv` supports it).*
    
    A better way if you have `uv` is:
    ```sh
    uv pip sync
    ```

### Configuration

1.  **Set up your Groq API Key:**
    Create a `.env` file in the root of the project:
    ```
    cp .env.example .env
    ```
    Open the `.env` file and add your Groq API key:
    ```
    GROQ_API_KEY="your-groq-api-key"
    ```

## Usage

To run the agent, use the `main.py` script with a prompt for the project you want to generate.

```sh
python main.py "Create a simple calculator app with a web interface."
```

The agent will start planning, designing the architecture, and writing the code. The generated project will be saved in the `generated_project/` directory.

## How It Works

The agent operates in a sequence of three steps, orchestrated by a LangGraph state machine:

1.  **Planner:** The process starts with the `planner_agent`, which takes the user's prompt and generates a `Plan`. This plan includes the project name, description, tech stack, features, and a list of files to be created.

2.  **Architect:** The `architect_agent` receives the `Plan` and breaks it down into a `TaskPlan`. This is a detailed, step-by-step list of implementation tasks for each file, ensuring that dependencies are handled correctly.

3.  **Coder:** The `coder_agent` takes the `TaskPlan` and executes each task sequentially. It uses a ReAct agent equipped with tools to read, write, and list files, implementing the logic for each file as specified in the tasks.

The process continues until all tasks are completed, at which point the agent finishes its run.
