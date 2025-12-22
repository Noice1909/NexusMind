// Note templates for quick start
export const noteTemplates = [
    {
        id: 'blank',
        name: 'Blank Note',
        icon: '📝',
        title: '',
        body: '',
    },
    {
        id: 'meeting',
        name: 'Meeting Notes',
        icon: '👥',
        title: 'Meeting Notes - [Date]',
        body: `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Attendees:** 
**Location:** 

## Agenda
1. 
2. 
3. 

## Discussion Points
- 

## Action Items
- [ ] 
- [ ] 

## Next Steps
- 

## Notes
`,
    },
    {
        id: 'daily',
        name: 'Daily Journal',
        icon: '📅',
        title: `Daily Journal - ${new Date().toLocaleDateString()}`,
        body: `# Daily Journal - ${new Date().toLocaleDateString()}

## 🌅 Morning
**Mood:** 
**Goals for today:**
- [ ] 
- [ ] 
- [ ] 

## 🌞 Afternoon
**Progress:**
- 

**Challenges:**
- 

## 🌙 Evening
**Accomplishments:**
- 

**Grateful for:**
- 

**Tomorrow's priorities:**
1. 
2. 
3. 

## 💭 Reflections
`,
    },
    {
        id: 'project',
        name: 'Project Plan',
        icon: '🚀',
        title: 'Project: [Name]',
        body: `# Project: [Name]

## 📋 Overview
**Description:** 
**Start Date:** ${new Date().toLocaleDateString()}
**Target Date:** 
**Status:** 🟡 In Progress

## 🎯 Objectives
1. 
2. 
3. 

## 📊 Milestones
- [ ] Milestone 1
- [ ] Milestone 2
- [ ] Milestone 3

## 👥 Team
- **Project Lead:** 
- **Team Members:** 

## 📝 Tasks
### Phase 1
- [ ] Task 1
- [ ] Task 2

### Phase 2
- [ ] Task 1
- [ ] Task 2

## 🚧 Blockers
- 

## 📈 Progress
- 

## 📎 Resources
- 
`,
    },
    {
        id: 'code',
        name: 'Code Snippet',
        icon: '💻',
        title: 'Code: [Title]',
        body: `# Code Snippet: [Title]

## Description
Brief description of what this code does.

## Language
\`\`\`javascript
// Your code here
function example() {
  console.log("Hello, World!");
}
\`\`\`

## Usage
\`\`\`javascript
example();
\`\`\`

## Notes
- 
- 

## References
- 
`,
    },
    {
        id: 'research',
        name: 'Research Notes',
        icon: '🔬',
        title: 'Research: [Topic]',
        body: `# Research: [Topic]

**Date:** ${new Date().toLocaleDateString()}
**Source:** 

## 🎯 Research Question
What are we trying to find out?

## 📚 Key Findings
1. 
2. 
3. 

## 📊 Data/Evidence
- 

## 💡 Insights
- 

## 🔗 Related Topics
- 

## 📝 Summary
Brief summary of the research findings.

## 🔖 References
1. 
2. 
`,
    },
    {
        id: 'todo',
        name: 'To-Do List',
        icon: '✅',
        title: `To-Do - ${new Date().toLocaleDateString()}`,
        body: `# To-Do List - ${new Date().toLocaleDateString()}

## 🔴 High Priority
- [ ] 
- [ ] 

## 🟡 Medium Priority
- [ ] 
- [ ] 

## 🟢 Low Priority
- [ ] 
- [ ] 

## ✅ Completed
- [x] 

## 📌 Notes
- 
`,
    },
    {
        id: 'brainstorm',
        name: 'Brainstorm',
        icon: '💡',
        title: 'Brainstorm: [Topic]',
        body: `# Brainstorm: [Topic]

**Date:** ${new Date().toLocaleDateString()}

## 🎯 Goal
What are we brainstorming about?

## 💭 Ideas
1. 
2. 
3. 
4. 
5. 

## ⭐ Best Ideas
- 
- 

## 🚀 Action Items
- [ ] 
- [ ] 

## 🔗 Related Thoughts
- 
`,
    },
];

export const getTemplate = (templateId) => {
    return noteTemplates.find(t => t.id === templateId) || noteTemplates[0];
};
