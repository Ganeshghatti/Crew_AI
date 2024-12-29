import os
from dotenv import load_dotenv
from crewai import Crew, Process
from agents import researcher
from tasks import trend_task
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()

# Get the Gemini API key from environment variables
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

# Configure Gemini
llm = ChatGoogleGenerativeAI(
    model="gemini/gemini-1.5-flash",
    google_api_key=api_key,
    temperature=0.7,
    convert_system_message_to_human=True
)

# Initialize the crew with the researcher agent and the trend task
crew = Crew(
    agents=[researcher],
    tasks=[trend_task],
    process=Process.sequential,
    memory=False,
    cache=False,
    max_rpm=100,
    share_crew=False,
    llm=llm
)

# Execute the crew
if __name__ == "__main__":
    result = crew.kickoff()
    print(result)