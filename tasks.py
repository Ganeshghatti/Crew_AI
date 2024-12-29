from crewai import Task
from crewai_tools import SerperDevTool
from agents import researcher

# Create tool instance
search_tool = SerperDevTool()

# Trend finder task
trend_task = Task(
    agent=researcher,
    description="Research and analyze the latest trends in artificial intelligence and machine learning",
    expected_output="A detailed list of the top 3 most trending topics in AI technology, including brief descriptions and their significance",
    tools=[search_tool]
)