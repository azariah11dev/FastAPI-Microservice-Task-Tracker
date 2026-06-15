import json
from ollama import Client

from schemas.endpoint_schemas import TaskInfo

class localModel:
    def __init__(self):
        self.client = Client(host="http://host.docker.internal:11434")

    def classify_task(self, task: str) -> str:
        categories = [
            "reading", "writing", "coding", "debugging", "documentation",
            "research", "study", "planning", "administrative", "errands",
            "cleaning", "shopping", "communication", "presentation",
            "meeting", "creative", "data_analysis", "exercise", "personal"
        ]

        prompt = f"""
            You are a task classifier. 
            Classify the following task into exactly ONE of these categories:

            {", ".join(categories)}

            Task: "{task}"

            Respond with ONLY the category name.
        """

        response = self.client.chat(
            model="phi3:mini",
            messages=[{"role": "user", "content": prompt}]
        )

        return response["message"]["content"].strip().lower()

    def format_response(
        self,
        format_spec: dict[str, dict[str, list[dict[str, str]]]]
    ) -> dict[str, TaskInfo]:
        format_query = {}

        for task, query_dict in format_spec.items():
            combined_snippets = []

            for question, answers in query_dict.items():
                for snippet in answers:
                    combined_snippets.append(snippet["snippet"])

            extracted = self.extract_task_info(
                task=task,
                snippets=combined_snippets
            )

            format_query[task] = extracted

        return format_query

    def extract_task_info(self, task: str, snippets: list[str]) -> TaskInfo:
        prompt = f"""
        Task: {task}

        Search Snippets:
        {snippets}

        Extract the following fields:
        - estimated_duration_hours (float)
        - requirements (list of strings)
        - confidence_score (0 to 1)

        Return a single JSON object only. No explanation, no markdown.
        """

        response = self.client.chat(
            model="phi3:mini",
            messages=[{"role": "user", "content": prompt}]
        )

        content = response["message"]["content"].strip()

        # Strip markdown code fences if the model adds them
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
            content = content.strip()

        try:
            parsed = json.loads(content)
            # Ensure it's a dict, not a list
            if isinstance(parsed, list):
                parsed = parsed[0] if parsed else {}
            return parsed
        except json.JSONDecodeError:
            return {
                "estimated_duration_hours": None,
                "requirements": [],
                "confidence_score": 0.0,
                "raw": content
            }