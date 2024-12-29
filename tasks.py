from crewai import Task
from tools import search_tool
from agents import researcher

# Trend finder task
trend_task = Task(
    agent=researcher,
    description="Research and analyze the latest trends in the {niche} niche",
    expected_output="A detailed list of the top 3 most trending topics in AI technology, including brief descriptions and their significance",
    tools=[search_tool]
)