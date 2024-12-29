from crewai import Agent
from crewai_tools import SerperDevTool

# Create tools
search_tool = SerperDevTool()

# Add tools to agent
researcher = Agent(
    role="AI Technology Researcher",
    goal="Research the latest AI developments",
    backstory="You are an expert AI technology researcher with years of experience in tracking and analyzing emerging trends in artificial intelligence and machine learning.",
    tools=[search_tool],
    verbose=True
)