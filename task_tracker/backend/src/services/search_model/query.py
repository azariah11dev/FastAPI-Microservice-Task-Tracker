import asyncio
import httpx
import os

from schemas.model_schemas import settings


SERPER_API_KEY = settings.SERPER_API_KEY or os.getenv("SERPER_API_KEY")


class Query:
    SEARCH_TEMPLATES = {
        "reading": [
            "how long does it take to read {task}",
            "requirements for reading {task}",
            "average reading time for {task}",
            "materials needed to read {task}"
        ],

        "writing": [
            "how long does it take to write {task}",
            "requirements for writing {task}",
            "outline for writing {task}",
            "writing workflow for {task}"
        ],

        "coding": [
            "how long does it take to code {task}",
            "requirements for coding {task}",
            "tools needed to code {task}",
            "steps to implement {task}"
        ],

        "debugging": [
            "how long does it take to debug {task}",
            "common issues when debugging {task}",
            "tools needed to debug {task}",
            "debugging workflow for {task}"
        ],

        "documentation": [
            "how long does it take to document {task}",
            "documentation requirements for {task}",
            "documentation template for {task}",
            "steps to document {task}"
        ],

        "research": [
            "how long does research on {task} take",
            "research methodology for {task}",
            "resources needed for researching {task}",
            "steps involved in researching {task}"
        ],

        "study": [
            "how long does it take to study {task}",
            "prerequisites for learning {task}",
            "study resources for {task}",
            "recommended study plan for {task}"
        ],

        "planning": [
            "steps required to plan {task}",
            "how long does planning {task} take",
            "resources needed to plan {task}",
            "project planning checklist for {task}"
        ],

        "administrative": [
            "requirements for {task}",
            "documents needed for {task}",
            "average completion time for {task}",
            "process for completing {task}"
        ],

        "errands": [
            "how long does it take to do {task}",
            "what do you need for {task}",
            "average time for errands like {task}",
            "steps to complete {task}"
        ],

        "cleaning": [
            "how long does it take to clean {task}",
            "cleaning supplies needed for {task}",
            "cleaning checklist for {task}",
            "steps to clean {task}"
        ],

        "shopping": [
            "how long does it take to shop for {task}",
            "shopping list for {task}",
            "requirements for buying {task}",
            "steps to shop for {task}"
        ],

        "communication": [
            "how long does it take to {task}",
            "best practices for {task}",
            "requirements for {task}",
            "preparation needed for {task}"
        ],

        "presentation": [
            "how long does it take to prepare {task}",
            "materials needed for {task}",
            "presentation preparation checklist for {task}",
            "steps to create a presentation about {task}"
        ],

        "meeting": [
            "how long should {task} take",
            "agenda template for {task}",
            "meeting preparation checklist for {task}",
            "requirements for {task}"
        ],

        "creative": [
            "how long does it take to create {task}",
            "tools required for {task}",
            "creative workflow for {task}",
            "steps to complete {task}"
        ],

        "data_analysis": [
            "how long does it take to analyze {task}",
            "tools needed for analyzing {task}",
            "data analysis workflow for {task}",
            "requirements for analyzing {task}"
        ],

        "exercise": [
            "how long should {task} take",
            "equipment needed for {task}",
            "exercise plan for {task}",
            "steps to complete {task}"
        ],

        "personal": [
            "how long does it take to complete {task}",
            "requirements for {task}",
            "steps involved in {task}",
            "resources needed for {task}"
        ]
    }
    
    def __init__(self, request: list[str]):
        self.request = request

    async def generate_queries(self, model) -> dict[str, list[str]]:
        queries = {}

        for task in self.request:
            category = model.classify_task(task.lower())
            templates = self.SEARCH_TEMPLATES.get(category, [])
            formatted = [template.format(task=task) for template in templates]
            queries[task] = formatted

        return queries

    async def _serper_search(self, client, query: str):
        """Call Serper.dev for a single query."""
        url = "https://google.serper.dev/search"
        headers = {"X-API-KEY": SERPER_API_KEY}
        payload = {"q": query}

        r = await client.post(url, json=payload, headers=headers)
        data = r.json()

        # Extract top organic results
        parsed = [
            {
                "title": item.get("title"),
                "link": item.get("link"),
                "snippet": item.get("snippet")
            }
            for item in data.get("organic", [])
        ]

        return query, parsed

    async def web_search(self, queries: dict[str, list[str]]):
        """Run ALL Serper queries for ALL tasks in parallel."""
        output = {}

        async with httpx.AsyncClient(timeout=10) as client:
            tasks = []
            for task, query_list in queries.items():
                for q in query_list:
                    tasks.append(self._serper_search(client=client, query=q))

            results = await asyncio.gather(*tasks)

        # Rebuild structure
        for task, query_list in queries.items():
            task_results = {}

            for q in query_list:
                parsed = next(res for query, res in results if query == q)
                task_results[q] = parsed

            output[task] = task_results

        return output