# Sprint planning: capacity, carry-over and the sprint goal

## In one minute
Sprint planning answers two questions: **why** this sprint matters (the sprint goal) and **what** fits. Start from **capacity**: how many developer-days are really available after holidays and public holidays. Scale the team's average **velocity** to that capacity. Put **must-dos** in first (carry-over commitments, money-losing bugs, legal deadlines, dependencies), then fill the rest in backlog order. Never plan above capacity "to be ambitious".

## How to calculate capacity
1. Full capacity = developers × working days in the sprint
2. Subtract holidays, public holidays, training, support rota
3. Points available ≈ average velocity × (available days ÷ full days)

**Example:** 5 developers × 10 days = 50 dev-days. Holidays: 3 + 2 days, one public holiday for 2 UK developers = 7 days off, so 43 days available. Average velocity 30 points at full capacity → 30 × 43/50 ≈ **26 points**.

## Carry-over
Unfinished work from the last sprint is not automatically "done-ish". Re-estimate the **remaining** work and decide consciously whether it continues. Usually it does if it serves the goal.

## Order of filling the sprint
1. **Must-dos:** bugs losing money, legal/compliance deadlines, commitments to other teams, work that unblocks others, pre-freeze tasks
2. **Sprint goal work** in backlog order
3. **Small items** that fill remaining space and are ready
4. Leave out anything that is **not ready** (no ACs, unknown dependencies)

## A good sprint goal
- One or two sentences, outcome-focused: *"Shoppers on Chemist & Co can reserve an item and get a confirmation"*
- Not: *"Do HB-105, HB-106, HB-110"*

## Checklist
- [ ] Capacity calculated from real availability
- [ ] Must-dos in first
- [ ] Total ≤ capacity
- [ ] Unready items excluded
- [ ] Goal is an outcome, not a list

## Common mistakes
- Planning at full velocity while people are on holiday
- Forgetting carry-over
- Filling the sprint with the BU's loudest request instead of must-dos
- Taking in stories without acceptance criteria
