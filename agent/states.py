from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class File(BaseModel):
    path: str = Field(description="The path to the file to be created or updated")
    purpose: str = Field(description="The purpose of the file eg 'main.py', 'application.py', 'config.py', 'utils.py', 'models.py', 'schemas.py', 'database.py'")
    

class Plan(BaseModel):
    name: str = Field(description="The name of the app to be created")
    description: str = Field(description="The description of the app to be created in detail")
    tech_stack: str = Field(description="The tech stack to be used for the app to be created for example 'python, flask, sqlalchemy, postgresql, docker, kubernetes, aws, azure, gcp, etc.'")
    features: list[str] = Field(description=" the list of features to be created for the app for example 'user authentication', 'data visualization'")
    files: list[File] = Field(description="The list of files to be created for the app, each with a 'path' and 'purpose'")
    
    
class ImplementationTask(BaseModel):
    file_path: str = Field(description="The path to the file to be modified")
    task_description: str = Field(description="The detailed description of the task to be performed on the file, e.g. 'add user authentication', 'implement data processing logic', etc.")
        
class TaskPlan(BaseModel):
    ImplementationSteps: list[ImplementationTask] = Field(description="A list of steps to be taken to implement the task")
    model_config = ConfigDict(extra="allow")
    
class CoderState(BaseModel):
    task_plan: TaskPlan = Field(description="The plan for the task to be implemented")
    current_step_idx: int = Field(0, description="The index of the current step in the implementation steps")
    current_file_content: Optional[str] = Field(None, description="The content of the file currently being edited or created")