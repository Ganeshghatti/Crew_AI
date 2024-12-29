import os
from dotenv import load_dotenv
from crewai import Crew, Process
from agents import researcher
from tasks import trend_task
from crewai import LLM
# Load environment variables
load_dotenv()

# # Get the Groq API key from environment variables
# groq_api_key = os.getenv('OPENAI_API_KEY')
# if not groq_api_key:
#     raise ValueError("OPENAI_API_KEY not found in environment variables")

# llm = LLM(
# model="gemini/gemini-1.5-flash", temperature=0.7, max_tokens=1500, api_key=groq_api_key
# )

# Initialize the crew with the researcher agent and the trend task
crew = Crew(
    agents=[researcher],
    tasks=[trend_task],
    process=Process.sequential,
    memory=True,
    cache=False,
    max_rpm=100,
    share_crew=True,
)

# Execute the crew
# if __name__ == "__main__":
#     result = crew.kickoff()
#     print(result)

result=crew.kickoff(inputs={"niche":"Artificial Intelligence"})
print(result)