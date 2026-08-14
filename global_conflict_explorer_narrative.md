# Global Conflict Explorer — Scrollytelling Narrative

## Project purpose

Turn the existing **Global Conflict Explorer** into a Pudding-style scrollytelling data narrative.

**Important: the existing dashboard is FINAL and LOCKED.**

Do not redesign, restructure, or rewrite the existing dashboard. It remains the central interactive exploration tool.

The new work goes **below the existing dashboard** and tells a story through:

1. Cinematic opening
2. Introduction to the conflict data
3. Existing Conflict Explorer dashboard
4. Transition from countries to people
5. Annual battle-death-rate calculator
6. Lifetime conflict-exposure calculator
7. Final reflection

---

# 01 — HERO / CINEMATIC OPENING

## Visual

Use the 10-second sketch-style animation created for the project.

Visual progression:

1. A person fires a bullet.
2. The bullet travels forward.
3. The bullet transforms into a larger projectile.
4. The projectile becomes increasingly destructive.
5. Introduce the historical names **Little Boy** and **Fat Man** only if the visual context clearly identifies them as atomic bombs.
6. The final impact becomes a disturbing blood/crying visual.
7. Hold the final frame briefly.

The visual should be controlled by scroll position.

## Interaction

Use scroll-driven frame progression.

As the reader scrolls:

Frame 1 → Frame 2 → Frame 3 → ... → Final frame

Do not autoplay independently of scrolling.

The visual should remain sticky while explanatory text moves upward.

## Text sequence

### Text 01

> **Conflict can begin with something as small as a single shot.**

### Text 02

> **But violence can escalate quickly.**

### Text 03

> **From bullets to bombs, the scale of destruction can grow far beyond the battlefield.**

### Text 04

> **And behind every statistic is a person living through that year.**

### Final text over/near the final visual

> **So where does conflict happen — and what does it mean for the people living there?**

Then transition into the data story.

---

# 02 — INTRODUCE THE DATA

## Heading

> **Where does conflict happen?**

## Subtitle

> **Explore 36 years of armed conflict, battle deaths, and international involvement across the world.**

## Body text

> Between 1989 and 2025, conflicts occurred across dozens of countries and took many different forms. Some lasted for decades. Others were short but devastating. Some remained within national borders, while others crossed them.

> This story uses conflict records to look at three things: **where conflict happens, how often it happens, and how deadly it becomes.**

## Transition text

> **Start with the map.**

---

# 03 — EXISTING CONFLICT EXPLORER

## Important

Embed the existing finalized dashboard here.

Do not change its:

- map
- timeline
- filters
- sidebar
- country colors
- interstate arrows
- scatterplot toggle
- interactions
- layout
- styling

The dashboard should remain fully functional.

## Intro text above dashboard

> **Explore the conflicts year by year.**

## Short instruction

> Move through the timeline, select a country, and explore how conflict intensity and type change across time.

## After-dashboard narrative

### Heading

> **But a map only tells us where conflict happens.**

### Body

> A country can experience thousands of battle deaths in a single year. But a raw death count does not tell us how large that loss is relative to the population living there.

> To understand the scale of that loss, we need to put battle deaths and population side by side.

---

# 04 — TRANSITION TO THE FIRST CALCULATOR

## Heading

> **What does one year of conflict mean for a population?**

## Body

> Imagine two countries recording the same number of battle deaths.

> In a country of one million people, that number represents a very different share of the population than it does in a country of one hundred million.

> So instead of looking only at the number of deaths, we can calculate a population-level battle-death rate.

## Methodology line

> **Battle-death rate = battle deaths ÷ population**

## Important wording

Do not describe this calculation as a literal personal probability of death.

Use:

> **Estimated annual battle-death rate**

and:

> **This is a population-level rate based on recorded battle deaths and total population. It does not represent an individual's personal probability of death.**

---

# 05 — CALCULATOR 01

# Title

> **What was the risk of dying in conflict where you lived?**

## Intro text

> Choose a country and a year to see how many battle deaths were recorded relative to the population living there.

## Inputs

### Country

> **Choose a country**

### Year

> **Choose a year**

Range:

> 1989–2025

## Output card

Show:

### Population

> [year-specific population]

### Battle deaths

> [year-specific battle deaths]

### Estimated annual battle-death rate

> [percentage]

Then convert the result into a human-readable ratio:

### Main human-scale result

> **About 1 in [X] people**

Use the ratio only when mathematically meaningful and calculate it from:

> population ÷ battle deaths

If battle deaths are zero:

> **No battle deaths were recorded in this year.**

Do not show "1 in infinity."

## Example wording

> **0.02%**

> **About 1 in 5,000 people**

Do not invent these numbers. They must be calculated dynamically from the selected country and year.

---

# 06 — MAKE THE FIRST CALCULATOR A SCROLLING REVEAL

After the user selects a country/year, use the surrounding narrative to explain the number.

## Text block 01

> **The raw number can be misleading.**

## Text block 02

> [X] battle deaths may sound like a large number.

## Text block 03

> But the population of [COUNTRY] was [POPULATION] that year.

## Text block 04

> Relative to the population, the estimated annual battle-death rate was:

## Large result

> **[X%]**

## Then

> That's approximately **1 in [X] people**.

## Important clarification

> This does not mean that one person in every [X] had a literal individual probability of dying. It is a population-level rate calculated from aggregate battle deaths and population.

## Transition

> **But one year is only one moment.**

---

# 07 — TRANSITION TO LIFETIME EXPOSURE

## Heading

> **What happens when we stop looking at one year?**

## Body

> Conflict is rarely experienced as a single number on a timeline. For people living in conflict-affected countries, violence can continue for years, disappear, and return again.

> So instead of asking what happened in one year, we can ask a different question:

## Large hook

> **What was the conflict risk during your lifetime?**

---

# 08 — CALCULATOR 02

## Title

> **What was the conflict risk during your lifetime?**

## Intro

> Enter where and when you were born. We'll trace the conflict history of that country from your birth year through 2025.

## Inputs

### Country

> **Where were you born?**

### Birth year

> **When were you born?**

Range:

> 1989–2025

## Main output

Create a horizontal lifetime timeline.

Example structure:

> [BIRTH YEAR] ───────────────────── [2025]

Color each year according to whether the country had recorded conflict.

### Conflict year

Use a filled segment.

### No-conflict year

Use an empty/subtle segment.

## Main result

> **[X] of [Y] years overlapped with conflict.**

Then:

> **That is [X%] of the years observed since your birth.**

## Important wording

Do NOT say:

> "You had a [X%] chance of being in danger."

Do NOT say:

> "You had a [X%] chance of dying."

Instead say:

> **"[X%] of the observed years since your birth included recorded conflict in your country."**

---

# 09 — LIFETIME DEATH-RATE DETAIL

Below the lifetime timeline, optionally show:

## Highest annual battle-death rate

> **[YEAR]**

> **[RATE] battle deaths per 100,000 people**

## Highest battle-death year

> **[YEAR]**

> **[DEATHS] recorded battle deaths**

## Total battle deaths during observed lifetime

> **[TOTAL]**

Only display values that can be calculated reliably from the datasets.

---

# 10 — NARRATIVE AFTER THE LIFETIME CALCULATOR

## Heading

> **Conflict is not evenly distributed across a lifetime.**

## Body

> Two people born in the same year can have completely different experiences depending on where they were born.

> One person may grow up in a country with almost no recorded conflict. Another may spend a large part of their life in a country where conflict repeatedly appears in the data.

## Next paragraph

> Looking at conflict through a lifetime changes the question.

> It is no longer only about how many people died in a particular battle or year.

> It becomes about **how often conflict was present during the years people were living through.**

---

# 11 — CONNECT THE TWO CALCULATORS

## Short comparison section

### Heading

> **One year tells us intensity. A lifetime tells us exposure.**

## Body

> The annual battle-death rate shows the scale of loss relative to a country's population in a particular year.

> The lifetime view shows how frequently recorded conflict appeared during the years a person could have been living there.

> Neither measure tells the complete human story. Together, they show why looking only at total deaths can hide important differences between countries and across time.

---

# 12 — RETURN TO THE ORIGINAL QUESTION

## Heading

> **So, where does conflict happen?**

## Body

> It happens in different places, for different lengths of time, and with very different levels of intensity.

> Some countries experience many years of lower-intensity conflict. Others experience shorter periods with devastating battle deaths.

> The map shows where those conflicts occur.

> The data shows how often they occur.

> And the population-adjusted rates show how large those losses are relative to the people living there.

---

# 13 — FINAL CONCLUSION

Use a quiet, minimal ending.

## Main sentence

> **Conflict is measured in battles, years, countries, and deaths. But every number represents people living through a particular place and time.**

## Final sentence

> **A map can show us where conflict happens. Data can show us how much it costs. Understanding the human scale is harder.**

## Optional final line

> **Explore the data. Then decide what the numbers mean to you.**

---

# 14 — COMPLETE PAGE FLOW

The final webpage should follow this exact sequence:

CINEMATIC INTRO
→ Bullet → missile → explosion → human cost
→ "What does conflict mean to a person?"
→ WHERE DOES CONFLICT HAPPEN?
→ Introduction to dataset
→ EXISTING CONFLICT EXPLORER
→ User explores dashboard
→ "But a map only tells us where..."
→ "What does one year of conflict mean for a population?"
→ CALCULATOR 01
→ Country + Year
→ Population
→ Battle deaths
→ Annual battle-death rate
→ Human-readable 1-in-X representation
→ "But one year is only one moment."
→ "What happens when we stop looking at one year?"
→ CALCULATOR 02
→ Country + Birth Year
→ Lifetime timeline
→ Years with conflict
→ Percentage of observed lifetime overlapping conflict
→ Highest annual battle-death rate
→ "One year tells us intensity. A lifetime tells us exposure."
→ FINAL CONCLUSION
→ END

---

# 15 — VISUAL / INTERACTION RULES

## Typography

Keep the same typography system as the existing website.

Do not introduce an unrelated visual language.

## Spacing

Use generous vertical spacing between narrative sections.

The story should feel editorial rather than like a long dashboard.

## Sticky visual sections

Use sticky positioning for:

- opening animation
- calculator visualizations where appropriate

Narrative text should scroll over/alongside the sticky visualization.

## Dashboard

The existing dashboard is not sticky unless it already is.

Keep it unchanged.

## Calculator transitions

Use subtle transitions when:

- country changes
- year changes
- birth year changes
- results update

Avoid excessive animation.

---

# 16 — DATA DEFINITIONS

## Annual battle-death rate

For selected country and year:

> Battle deaths ÷ population

Display as:

> percentage

and optionally:

> deaths per 100,000 people

## Human-readable ratio

When battle deaths > 0:

> Population ÷ battle deaths

Round appropriately.

Example:

> 1 in 5,000

Do not imply individual-level certainty.

## Lifetime conflict exposure

For selected country and birth year:

Count the years from birth year through 2025 where the country has recorded conflict.

Then:

> Conflict years ÷ observed years × 100

Display:

> "[X] of [Y] years"

and:

> "[X%] of observed years"

---

# 17 — METHODOLOGY / TRANSPARENCY

At the bottom, add a small methodology section.

## Heading

> **How these numbers are calculated**

## Text

> Battle deaths are taken from the conflict dataset for each country and year. Population values are taken from the corresponding year-specific population dataset.

> The annual battle-death rate is calculated by dividing recorded battle deaths by the total population for that country and year.

> The lifetime conflict measure counts the number of years with recorded conflict between the selected birth year and 2025.

## Limitation

> These calculations describe population-level patterns. They should not be interpreted as an individual's personal probability of dying, because aggregate country-level battle deaths do not capture differences in geography, age, occupation, military status, civilian exposure, or other individual factors.

---

# 18 — EDITORIAL TONE

The writing should be:

- curious
- human
- restrained
- factual
- visually driven
- not sensationalist

Avoid:

> "This country was a death trap."

Avoid:

> "You were likely to die."

Avoid unsupported claims.

Prefer:

> "Conflict appeared in X of the observed years."

> "The annual battle-death rate reached X."

> "X battle deaths were recorded relative to a population of Y."

> "The data reveals a different pattern when we account for population."

---

# 19 — CENTRAL STORY

The entire article should communicate one progression:

> **Where does conflict happen?**

↓

> **How deadly is it relative to the people living there?**

↓

> **How long does that exposure last?**

↓

> **What does that change about how we understand conflict?**

The reader should finish the experience understanding that **a raw death count, a yearly population-adjusted rate, and lifetime conflict exposure are three different ways of looking at the same human cost.**

---

# 20 — IMPLEMENTATION PRIORITY FOR THE FRIDAY PRESENTATION

If development time becomes limited, prioritize in this order:

### Priority 1
Cinematic opening + scroll interaction

### Priority 2
Existing locked dashboard embedded in the narrative

### Priority 3
Annual battle-death-rate calculator

### Priority 4
Lifetime conflict calculator

### Priority 5
Final narrative + methodology

Do not sacrifice the working dashboard to add extra animation.

The strongest presentation is:

**beautiful opening → strong question → working dashboard → meaningful calculator → lifetime perspective → thoughtful conclusion.**
