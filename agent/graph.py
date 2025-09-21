from langchain_groq import ChatGroq
from pydantic import BaseModel, Field, ConfigDict
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import create_react_agent
import os
from states import *
from prompts import *
from tools import *

os.environ["GROQ_API_KEY"] = "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"

llm = ChatGroq(model="openai/gpt-oss-20b")


def planner_agent(state: dict):
    user_prompt = state["user_prompt"]
    resp = llm.with_structured_output(Plan).invoke(planner_prompt(user_prompt))
    return {"plan": resp}


def architect_agent(state: dict):
    plan = state["plan"]
    resp = llm.with_structured_output(TaskPlan).invoke(architect_prompt(plan))
    
    if resp is None:
        raise ValueError("No response from architect agent")
    
    resp.plan = plan # because of model_config = ConfigDict(extra="allow") we can keep the prev plan 
    return {"task_plan": resp}
 
def coder_agent(state: dict):
    
    coder_state: CoderState = state.get("coder_state")
    if coder_state is None:
        coder_state = CoderState(task_plan=state["task_plan"], current_step_idx=0)
    steps = coder_state.task_plan.ImplementationSteps
    
    if coder_state.current_step_idx >= len(steps):
        return {"coder_state": coder_state, "status": "DONE"}
    
    current_task = steps[coder_state.current_step_idx]
    existing_content = read_file.run(current_task.file_path)
    
    system_prompt = coder_system_prompt()
    user_prompt = (
        f"Task: {current_task.task_description}\n"
        f"File: {current_task.file_path}\n"
        f"Existing content:\n{existing_content}\n"
        "Use write_file(path, content) to save your changes."
    )
    
    coder_tools = [read_file, write_file, list_files, get_current_directory]
    react_agent = create_react_agent(llm, coder_tools)
    
    react_agent.invoke({"messages": [{"role": "system", "content": system_prompt},
                                     {"role": "user", "content": user_prompt}]})
    
    coder_state.current_step_idx += 1
    return {"coder_state": coder_state}

    



graph = StateGraph(dict)
graph.add_node("planner", planner_agent)
graph.add_node("architect", architect_agent)
graph.add_node("coder", coder_agent)
graph.add_edge("planner", "architect")
graph.add_edge("architect", "coder")

graph.add_conditional_edges(
    "coder",
    lambda s: "END" if s.get("status") == "DONE" else "coder",
    {"END": END, "coder": "coder"}
)

graph.set_entry_point("planner")
agent = graph.compile()

