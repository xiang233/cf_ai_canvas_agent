# AI Prompts Used


"I have an existing Canvas AI agent built with FastAPI, Azure OpenAI, and a custom SKYWORK
agent framework with 21 Canvas tools. I want to port it to Cloudflare using Llama 3.3 on
Workers AI and Durable Objects for state. Skip RAG for now."

"makes sense, can you write it. switch to AI llama, and since the viewer don't have canvas
token, maybe just use mine. can you let me know what is the token currently used?"


"can you think more deeply about the structure of this project and basically that any kinds
of requests should be answered, like you could answer anything, including saying you are
wrong or something, when the request is not standard. and consider the maintainability
and scalability of the project"

"i am wondering if we should also put the list of currently supported tools in the prompt"


"maybe let the model figure out what tools to execute, then execute the tool, then let
the model aggregate the result? this is what we did for this one [original Canvas AI
hackathon project using SKYWORK agent framework]"

"to make sure on the last step llama has the original question right?"


"make sure this system prompt is considering all kinds of requests, like check grades,
check announcements, check deadlines, etc"

"ig just let it act like a true AI agent with knowledge, like if it gets no resources
or info just say not supported or no deadline, is there a smart prompt engineering way?"

"if you need any cloudflare docs from the internet let me know!"

"can i just create on the web [instead of using CLI]"

"still a few other requirements - repository name must be prefixed with cf_ai_,
must include README.md and PROMPTS.md"
