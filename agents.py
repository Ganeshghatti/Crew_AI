from crewai import Agent,LLM
from tools import search_tool
from dotenv import load_dotenv
import os

load_dotenv()
api_key=os.getenv("OPENAI_API_KEY")
llm=LLM(model="groq/gemma2-9b-it", temperature=0.7, max_tokens=1500, api_key=api_key)

# Add tools to agent
researcher = Agent(
    role="AI Technology Researcher",
    goal="Research the latest AI developments on the provided niche",
    backstory="You are an expert AI technology researcher with years of experience in tracking and analyzing emerging trends in artificial intelligence and machine learning.",
    tools=[search_tool],
    verbose=True,
    llm=llm
)