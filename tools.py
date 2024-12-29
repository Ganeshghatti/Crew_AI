from crewai_tools import SerperDevTool

search_tool = SerperDevTool(
    search_url="https://google.serper.dev/search",
    # country="In",
    # locale="en",
    # location="Bengaluru, Karnataka, India",
    n_results=2,
)
