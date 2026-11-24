# Prioritisation: RICE, MoSCoW, value vs effort and cost of delay

## In one minute
Prioritisation is deciding what to do **first**, and being able to explain why. First take out the **must-dos**: legal deadlines, bugs losing money, commitments and dependencies. They go first, whatever any formula says. Then rank the rest with a simple, transparent model. **RICE** = Reach × Impact × Confidence ÷ Effort. **Value vs effort** (2×2) finds quick wins. **MoSCoW** (Must, Should, Could, Won't) helps scope a release. **Cost of delay** asks: what do we lose each week we wait?

## RICE in practice
| Factor | Meaning | Typical scale |
|---|---|---|
| **Reach** | Shoppers affected per period | e.g. 120,000 per quarter |
| **Impact** | Effect per shopper | 3 massive, 2 high, 1 medium, 0.5 low, 0.25 minimal |
| **Confidence** | How sure you are | 100%, 80%, 50% |
| **Effort** | Team effort | person-months or sprints |

**Example:** free-delivery progress message: 120,000 × 1 × 0.8 ÷ 2 = **48,000**.

## Value vs effort 2×2
| | Low effort | High effort |
|---|---|---|
| **High value** | Quick wins: do first | Big bets: plan |
| **Low value** | Fill-ins | Money pits: avoid |

## Cost of delay
Useful when timing matters: a feature worth €10k/week that takes 2 weeks should usually come before one worth €12k/week that takes 6 weeks. (Cost of delay ÷ duration = "CD3" or WSJF.)

## Must-dos come first
- **Legal/compliance** with a deadline (e.g. consent banner)
- **Bugs losing money now** (checkout, payment, wrong prices)
- **Commitments** already made (other teams, campaigns)
- **Dependencies** that unblock others
- **Freeze deadlines** (work that must ship before Black Friday)

## Checklist
- [ ] Must-dos identified and on top
- [ ] Scores calculated consistently, assumptions written down
- [ ] Low-confidence items flagged for discovery
- [ ] Ranking explained in one sentence per item

## Common mistakes
- Letting a formula override a legal deadline
- False precision: treating RICE as truth, not a conversation starter
- Ranking by who shouts loudest
- Not writing down the assumptions behind the numbers
