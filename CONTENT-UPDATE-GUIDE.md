# Content Update Guide

This guide explains how to update assessment questions, explanations, and guidance text without technical coding knowledge.

## Overview

The SME Exit Readiness Assessment content is stored in two main locations:

1. **public/assessment.json** - Questions, levels, domains, and sector benchmarks
2. **src/app/services/recommendation.service.ts** - Recommendation logic and messages

This guide focuses on the most common updates you'll make to `assessment.json`.

## Before You Start

### Required Tools

- **Text Editor**: VS Code (recommended), Sublime Text, or Notepad++
- **Git** (optional): For version control
- **Node.js**: To test changes locally

### JSON Basics

JSON (JavaScript Object Notation) is a simple data format. Key rules:

- **Strings**: Text in double quotes: `"This is text"`
- **Numbers**: No quotes: `42`, `3.5`
- **Arrays**: Lists in square brackets: `[1, 2, 3]` or `["a", "b", "c"]`
- **Objects**: Key-value pairs in curly braces: `{ "name": "Financial", "id": "fin" }`
- **Commas**: Separate items, but NO comma after last item
- **Indentation**: For readability only (doesn't affect data)

### Validation

Use [JSONLint](https://jsonlint.com/) to check your JSON is valid before saving.

## Updating Questions

### File Location
`public/assessment.json`

### Adding a New Question

1. **Open** `public/assessment.json` in your text editor

2. **Find the domain** where you want to add the question:
   - `"fin"` - Financial
   - `"leg"` - Legal & Corporate
   - `"com"` - Commercial
   - `"ops"` - Operational
   - `"ppl"` - People & Organisation
   - `"esg"` - ESG & Risk

3. **Locate the questions array** within that domain

4. **Add your question** at the end of the array:

```json
{
  "id": "fin7",
  "text": "Your question text here?",
  "explanations": [
    "Level 0: What this means if incomplete",
    "Level 1: What this means at initial stage",
    "Level 2: What this means when defined",
    "Level 3: What this means when managed",
    "Level 4: What this means when optimised"
  ]
}
```

5. **Important**:
   - Use a unique ID (e.g., `fin7` for 7th financial question)
   - Include exactly 5 explanations (one per level 0-4)
   - Add a comma before your new question if there are questions above it
   - NO comma after your question if it's the last one

### Editing an Existing Question

1. **Find the question** by searching for its ID (e.g., `"fin1"`)

2. **Update the text**:
```json
"text": "Updated question text here?"
```

3. **Update explanations** if needed:
```json
"explanations": [
  "Updated Level 0 explanation",
  "Updated Level 1 explanation",
  "Updated Level 2 explanation",
  "Updated Level 3 explanation",
  "Updated Level 4 explanation"
]
```

### Removing a Question

1. **Find the question** by ID
2. **Delete the entire question object** (including curly braces)
3. **Fix commas**: Ensure no trailing comma after the last question in the array

## Updating Domain Information

### Editing Domain Name or Description

```json
{
  "id": "fin",
  "name": "Financial",
  "description": "Updated description of what this domain covers",
  "critical": true,
  "minAcceptable": 2,
  "questions": [...]
}
```

### Critical Domains

Three domains are marked as **critical** with minimum acceptable scores:

- **Financial** (`critical: true`, `minAcceptable: 2`)
- **Legal & Corporate** (`critical: true`, `minAcceptable: 2`)
- **People & Organisation** (`critical: true`, `minAcceptable: 2`)

**To make a domain critical:**
```json
{
  "id": "ops",
  "name": "Operational",
  "critical": true,
  "minAcceptable": 2,
  "questions": [...]
}
```

**To remove critical status:**
```json
{
  "id": "com",
  "name": "Commercial",
  "questions": [...]
}
```
(Simply remove `critical` and `minAcceptable` fields)

## Updating Maturity Levels

### Level Definitions

Located in the `scale.labels` section:

```json
"scale": {
  "min": 0,
  "max": 4,
  "labels": [
    {
      "value": 0,
      "name": "Incomplete",
      "description": "What Level 0 means overall",
      "color": "#dc2626"
    },
    {
      "value": 1,
      "name": "Initial",
      "description": "What Level 1 means overall",
      "color": "#f97316"
    },
    ...
  ]
}
```

### Editing Level Names or Descriptions

1. **Find the level** by `value` (0-4)
2. **Update** `name` or `description`
3. **Don't change** `value` or `color` unless you understand the impact

## Updating Sector Benchmarks

### File Location
Same file: `public/assessment.json`, in the `sectors` array at the bottom.

### Editing Sector Scores

```json
{
  "sectorName": "Technology / SaaS",
  "domainScores": {
    "fin": 2.8,
    "leg": 2.5,
    "com": 3.2,
    "ops": 3.5,
    "ppl": 2.7,
    "esg": 2.3
  }
}
```

**To update a sector's baseline scores:**
1. Find the sector by `sectorName`
2. Update the scores (0.0 to 4.0)
3. Ensure all 6 domains have scores

### Adding a New Sector

```json
{
  "sectorName": "New Sector Name",
  "domainScores": {
    "fin": 2.5,
    "leg": 2.3,
    "com": 2.7,
    "ops": 2.8,
    "ppl": 2.4,
    "esg": 2.2
  }
}
```

Add this to the `sectors` array with a comma before it.

### Removing a Sector

1. Find the sector object
2. Delete the entire object (including curly braces)
3. Fix commas

## Testing Your Changes

### Step 1: Validate JSON

1. Copy entire contents of `assessment.json`
2. Paste into [JSONLint](https://jsonlint.com/)
3. Click "Validate JSON"
4. Fix any errors reported

### Step 2: Test Locally

```bash
# Navigate to project directory
cd Exit-Readiness-Assessment

# Install dependencies (first time only)
npm install

# Start development server
npm start
```

Open [http://localhost:4200](http://localhost:4200) and:

1. **Check home page** loads
2. **Start assessment** and verify questions appear correctly
3. **Answer questions** and check explanations display
4. **View report** and verify recommendations and sectors work

### Step 3: Check for Errors

Open browser console (F12 → Console tab) and look for errors:
- Red error messages indicate problems
- Fix issues and refresh

## Common Mistakes & How to Fix

### Syntax Errors

**Missing comma:**
```json
{
  "id": "fin1",
  "text": "Question 1"    ← Missing comma here
  "explanations": [...]
}
```

**Fix:** Add comma after `"Question 1"`

**Trailing comma:**
```json
"questions": [
  { "id": "fin1", ... },
  { "id": "fin2", ... },  ← Extra comma (last item)
]
```

**Fix:** Remove comma after last item

**Wrong quotes:**
```json
"text": 'This uses single quotes'  ← Wrong
"text": "This uses double quotes" ← Correct
```

**Fix:** Always use double quotes for strings

### Content Errors

**Wrong number of explanations:**
```json
"explanations": [
  "Level 0",
  "Level 1",
  "Level 2"
]
```

**Fix:** Always include exactly 5 explanations (0-4)

**Duplicate IDs:**
```json
{ "id": "fin1", ... }
{ "id": "fin1", ... }  ← Duplicate
```

**Fix:** Use unique IDs (fin1, fin2, fin3, etc.)

## Version Control (Recommended)

### Using Git

**Before making changes:**
```bash
# Create a backup branch
git checkout -b content-updates-2026-01-03

# Make your changes to assessment.json

# Test locally

# Commit changes
git add public/assessment.json
git commit -m "Updated financial questions and sector benchmarks"

# Push to repository
git push origin content-updates-2026-01-03
```

**If something breaks:**
```bash
# Revert to previous version
git checkout main -- public/assessment.json
```

### Without Git

**Before editing:**
1. Copy `assessment.json`
2. Rename copy to `assessment.json.backup`
3. Edit original
4. If issues arise, restore from backup

## Deployment

After testing locally:

1. **Commit changes** to Git repository
2. **Push to main branch**:
   ```bash
   git push origin main
   ```
3. **Vercel auto-deploys** (if configured)
4. **Verify changes** on production URL
5. **Test all features** in production

## Getting Help

### Validation Tools

- [JSONLint](https://jsonlint.com/) - Validate JSON syntax
- [JSON Editor Online](https://jsoneditoronline.org/) - Visual JSON editor

### Common Issues

**Problem**: Application won't load after changes
**Solution**: Validate JSON at JSONLint, fix syntax errors

**Problem**: Questions don't display
**Solution**: Check question IDs are unique and explanations array has 5 items

**Problem**: Sector comparison broken
**Solution**: Ensure all sectors have all 6 domain scores (fin, leg, com, ops, ppl, esg)

### Technical Support

For complex issues:
1. Revert changes (restore from backup)
2. Open issue in GitHub repository
3. Include:
   - What you changed
   - Error messages (from browser console)
   - Steps to reproduce issue

## Best Practices

### Writing Questions

- **Be specific**: Avoid vague language
- **Use British English**: organisation, optimised, etc.
- **Focus on evidence**: "Do you have X?" not "How good is X?"
- **Keep concise**: 1-2 sentences max

### Writing Explanations

- **Level 0**: Describe what's missing or incomplete
- **Level 1**: Basic awareness, ad-hoc approach
- **Level 2**: Documented, consistent, repeatable (transaction-ready baseline)
- **Level 3**: Measured, controlled, institutional quality
- **Level 4**: Optimised, continuously improved, best-in-class

### Sector Benchmarks

- **Based on data**: Use industry research or real assessments
- **Consistent**: Similar maturity across sectors (2.0-3.0 typical)
- **Realistic**: Avoid perfect scores (4.0) or very low scores (<1.5)

## Checklist Before Deploying

- [ ] JSON validated with JSONLint (no errors)
- [ ] All questions have unique IDs
- [ ] All questions have exactly 5 explanations
- [ ] All domain IDs correct (fin, leg, com, ops, ppl, esg)
- [ ] All sectors have all 6 domain scores
- [ ] Tested locally (npm start)
- [ ] No console errors in browser
- [ ] Questions display correctly
- [ ] Explanations display correctly
- [ ] Report page loads without errors
- [ ] Sector comparison works
- [ ] Committed to Git with descriptive message
- [ ] Deployed and tested in production

## Example: Adding a Complete Question

Here's a full example of adding a new financial question:

```json
{
  "id": "fin7",
  "text": "Does your business have documented financial controls and delegated authority limits?",
  "explanations": [
    "No documented controls or authority limits. Financial decisions are ad-hoc with no clear approval process.",
    "Basic controls exist but are informal. Authority limits are understood verbally but not documented.",
    "Comprehensive financial controls documented in a financial manual. Clear delegated authority limits defined and communicated to all staff.",
    "Controls are regularly reviewed and tested. Authority limits are systematically enforced with approval workflows in accounting system.",
    "Financial controls are benchmarked against best practice. Continuous improvement process with regular internal audit and management review."
  ]
}
```

Add this inside the `"questions"` array of the Financial domain (`"fin"`), with appropriate commas.

---

**Remember**: Always validate, test locally, and keep backups before deploying changes!
