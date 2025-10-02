# Workflow Builder - My Design Exploration

## What I Was Trying to Build

I tried to make a workflow builder that isn’t frustrating to use. A lot of other builders are either way too complicated or way too simple. My first thought was, why can’t building workflows be as simple as doing a whiteboard sketch?  

The main reason I decided to build this was that I realized most people configure systems in a flow. Picture yourself describing a complicated system or a process to a friend; you’ll draw a flow diagram, right? However, software designers tend to ignore that way of thinking and focus instead on complicated dropdowns and forms. I wanted to change that.

## The Sample Workflow - Why Hiring?

The hiring workflow functions as a demonstration of what I hoped to accomplish in this project: how intricate and realistic workflows could be visualized and handled.

Consider hiring: it is chaotic and messy, it involves many people, and integration of different software, tools, and systems, and has many decision and follow-up points that move in various directions based on a candidate’s response. It is the perfect workflow for tools that currently exist to either greatly simplify or make ridiculously complicated.

In the workflow I created for this project, I was able to demonstrate virtually every stage of the candidate journey. I captured everything: applications, automated AI resume screening, the system spinning initial screening decisions, interview scheduling for various rounds, gathering feedback, making hiring decisions, sending offers, communication follow-up and more. I built steps with real integrations to OpenAI, Calendly, Gmail, and Twilio.

But most significantly, it all works, and works neatly. You see the flow, the decision points, and the various paths that a candidate can take in the so-called hiring process. You can organize the system as a hierarchy, or cascade to follow a specific part, and sequence entire interview models as templates that can be reused for different roles or adjusted the criteria for decision making without breaking the entire workflow.

## What I Built

The visual canvas works. You can drag nodes, link them together and you can even create new ones by just dropping edges wherever there is empty space. Smooth, highly animateable system for gradually building workflows step by step You collapse and expand subtrees, you can copy entire branches or delete parts.

This demonstrates true complexity in hiring workflow — multiple touch-points, decision points and follow-ups along with real service integrations. It demonstrates what this could look like in practice with actual business processes.

Workload stats, navigation minimap. It is all built with React (and Fortmatic), typescript and it uses Framer Motion for animations.

## Current Limitations and What's Missing

Right now this is just a visual designer. In reality, you are not able to execute workflows but just design them. You just insert the snippet, there is no backend, no extensive integrations and certainly not user accounts. More Sample Hardcoded Node Configurations — no Dynamic Forms here

Additionally, It is bound to 4 node types Loops, parallel processing, conditional routing and custom integrations -> For a real workflow The current one acts like a PoC (Proof of Concept) for the interaction patterns.

This undoubtedly gets ugly performance-wise, with very large workflows. No Virtual Scrolling, No Optimizations for hundreds of nodes. This is all desktop focused — mobile would be an entirely different ballgame.

Editing each node configuration is a way more complex that I initially thought and it just has limited configuration options but still with core ideas. And even, there should be AI integration which can recommend the workflow ideas.

## Where This Could Go

From there, the next step would be to convert it into a truly useful system. The current implementation is just that, a designer — the magic happens at execution. This includes building a runtime engine, implementing integrations and state management between long running processes.

I would like to include more node types, as loops or parallel processing; conditional branches; custom integrations. This is only the ground 4 forms supported now. In reality, proper workflows require a lot more flexibility.

The configuration system itself should be dynamic. Rich forms — customizable and node type specific whereas instead of some hardcoded examples users should be able to create their own. That is an entire form builder issue.

Collaboration would be huge. Collaborative workflow design, change control a la Git(simultaneous changes & ability to merge back). Think Git for workflows.

Eventually, AI integration makes sense. Natural Language -> Workflow Creation, Optimization Recommendations and Predictive Analytics for bottlenecks. But that's way down the road.

## I'm stopping here

What started as a simple workflow builder exploration turned into something way more complex than I initially thought. I kept adding features - progressive loading, subtree management, smart edge creation, context-aware controls. Each solution led to new problems, each feature suggested three more that would make it better.

At some point I realized I wasn't just building a workflow designer anymore. I was building a whole platform. The visual canvas, the animation system, the hierarchical node management, the interaction patterns - this became a full-fledged application with its own architecture and design system.

The hiring workflow made it even clearer. Once you start modeling real business processes, you realize how much complexity is involved. Multiple user roles, state management across long-running processes, error handling, integrations, permissions, notifications. The visual designer is just the tip of the iceberg.

I hit a natural stopping point where I had to choose: keep going and build a complete platform, or pause and reflect on what I'd already created. I chose to pause. This demonstrates the core ideas effectively, and going further would require a completely different level of commitment and resources.

## Running the Demo

Clone it, run npm install and npm run dev. Start in view mode to see the hiring workflow, toggle to edit mode to play with the interactions. Click "Load Example Workflow" to see the progressive loading in action.

The interesting parts are dragging edges to empty space to create nodes, collapsing subtrees to manage complexity, and how the interface adapts based on what you're doing.

## Development Notes

AI helped with generating the sample workflow data and some boilerplate, but the core ideas - the interaction patterns, the architecture decisions, the UX innovations - those came from thinking through the problem from first principles.

The biggest learning was how much the interaction model matters. Small changes in how people create and connect nodes completely change how they think about building workflows. Getting those micro-interactions right is what makes the difference between a tool people tolerate and one they actually enjoy using.