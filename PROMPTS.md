# AI Prompts Used

This project was built with AI-assisted coding using Claude. Below are the key prompts
that guided architectural decisions — I directed the design and debugged the implementation.

## Architecture Design

"I have an existing Canvas AI agent built with FastAPI, Azure OpenAI, and a custom SKYWORK
agent framework. I want to port it to Cloudflare using Llama 3.3 on Workers AI and
Durable Objects for state. What's the best mapping of components?"

"The assignment requires: LLM, workflow/coordination, user input via chat, and memory/state.
How should I structure this on Cloudflare?"

## Agent Pattern

"Llama 3.3 on Workers AI is outputting raw tool call JSON instead of executing tools through
the AI SDK. What's the most reliable way to implement tool calling without relying on the
AI SDK's built-in tool protocol?"

"I want the agent to follow a plan→execute→aggregate pattern like my original SKYWORK
implementation — where the LLM plans which tools to call, TypeScript executes them,
then the LLM summarizes the results. How do I implement this?"

"How do I make sure the aggregation step (step 3) has the original user question so
Llama doesn't lose context after seeing the Canvas data?"

## Prompt Engineering

"How should I structure the system prompt so Llama knows when to call Canvas tools vs
answer from its own knowledge, and handles empty results gracefully without outputting
raw JSON?"

"Should I include the list of supported tools in the system prompt? What's the tradeoff
between token usage and model awareness?"

## Architecture & Maintainability

"Think about the structure of this project so any kind of request can be answered,
including edge cases, and consider maintainability and scalability."

## Debugging

"The WebSocket is connecting but messages aren't being received by the agent. The browser
console shows cf_agent_use_chat_response messages with body containing JSON. How do I
parse the UI message stream format correctly?"

"Workers AI is returning: context window limit (7968) exceeded. How do I restructure
the agent to stay within the token limit while still returning useful Canvas data?"
