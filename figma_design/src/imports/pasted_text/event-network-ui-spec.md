# High-Fidelity UI — Event-Based Student Network (Academic Blue)

This is a **Figma-style UI specification** with precise layout, spacing, typography, and component definitions. You can directly translate this into Figma frames.

---

# 1. DESIGN SYSTEM

## 🎨 Color Palette

Primary Blue: #1E3A8A
Secondary Blue: #3B82F6
Accent Blue: #93C5FD
Background: #F8FAFC
Surface: #FFFFFF
Border: #E5E7EB
Text Primary: #111827
Text Secondary: #6B7280
Success: #10B981

---

## 🔤 Typography (Inter / SF Pro)

* H1: 24px / Bold
* H2: 20px / Semibold
* H3: 16px / Semibold
* Body: 14px / Regular
* Caption: 12px / Medium

---

## 📐 Spacing System (8pt grid)

* XS: 4px
* SM: 8px
* MD: 16px
* LG: 24px
* XL: 32px

---

## 🧱 Components

### Button

Primary:

* Background: #1E3A8A
* Text: White
* Radius: 12px
* Padding: 12px 16px

Secondary:

* Border: 1px #E5E7EB
* Background: White

---

### Card

* Background: White
* Radius: 16px
* Shadow: 0 4px 12px rgba(0,0,0,0.05)
* Padding: 16px

---

### Tag

* Background: #EFF6FF
* Text: #1E3A8A
* Radius: 999px
* Padding: 4px 10px

---

# 2. HOME SCREEN (HIGH-FIDELITY)

Frame: 390x844 (mobile)

```
[Top Bar - 64px height]
-------------------------------------------------
🔍 Search field (rounded, light gray bg)
                                👤 Avatar

[Section: Upcoming Events]
-------------------------------------------------
Title (H2)

[Horizontal Cards]
┌──────────────────────────────┐
| Event Title                  |
| 📍 Location  🕒 Time         |
| 👥 120 attending             |
└──────────────────────────────┘

[Section: Matches]
-------------------------------------------------
"5 people match with you"
[View Matches Button]

[Section: Suggested Events]
-------------------------------------------------
Vertical Cards (same style)
```

---

# 3. EVENT PAGE (FLAGSHIP SCREEN)

```
[Header Image Banner - optional]

[Event Info Card]
-------------------------------------------------
Title (H1)
📍 Location | 🕒 Time
👥 Attendees count

[Buttons]
[ Join Event ] [ Message ]

[Tabs]
Overview | People | Sub-events | Matches
(active = blue underline)
```

---

## PEOPLE TAB

```
[Filter Chips]
[ Same Program ] [ Same Interests ] [ Top Match ]

[List Items]
-------------------------------------------------
(Avatar 40x40)
Name (H3)
Tags (chips)
Match Bar (progress 0–100%)
[ Connect Button ]

Spacing: 12px between items
```

---

## MATCHES TAB (SWIPE CARDS — TINDER-LIKE)

This tab becomes a **full-screen swipe experience** for fast, intuitive discovery.

---

### Layout

```
[Top Bar]
← Back                Matches

[Card Stack Area]
(only top card fully visible, next card peeking behind)

┌──────────────────────────────┐
| [Avatar Image - tappable]    |
|                              |
| Name, Program                |
| "87% Match" (badge)         |
|                              |
| Shared Highlights            |
| • 2 events                   |
| • 1 course                   |
| • 3 interests                |
|                              |
| Tags                         |
| [AI] [Systems] [Cloud]       |
|                              |
| Actions (bottom overlay)     |
| ❌ Pass    ⭐ Save    ❤️ Connect |
└──────────────────────────────┘

[Hint Text]
"Swipe right to connect, left to skip"
```

---

### Interactions

* **Swipe Right (❤️)** → Send connection request
* **Swipe Left (❌)** → Skip
* **Tap Card** → Expand quick details (modal)
* **Tap Avatar Image** → Open full profile screen
* **Swipe Up (optional)** → Open Profile Comparison Screen

---

### Card States

**Default:**

* Clean, minimal
* Focus on match % + shared context

**Expanded (on tap):**

* Shows more shared details
* Mini timeline preview

---

### Visual Design

* Card Radius: 20px
* Shadow: stronger than normal cards (depth effect)
* Match Badge: top-right, blue gradient
* Overlay gradient at bottom for text readability

---

### Micro-interactions

* Swipe → smooth rotation + opacity fade
* Match % → animated on card appear
* Card stack → slight parallax
* Connect → heart animation + subtle vibration (mobile)

---

### UX Rationale

* Reduces friction vs scrolling lists
* Encourages exploration
* Feels familiar (learned behavior)
* Keeps focus on **one person at a time**

---

### Safeguards (Important)

* Limit daily swipes (optional, prevents spam behavior)
* Prioritize high-match profiles first
* Avoid showing same person repeatedly

---

### Integration with Rest of App

* Entry from Event → Matches Tab
* After connect → option to message or invite to sub-event
* History of swiped profiles stored (for revisit)

---

### Key Principle

"Decide fast. Connect smart."

---

Avatar (56px)
Name
"2 shared events • 1 course"
Match Score: 91% (progress bar animated)
[ Connect ]

[Secondary Matches List]
(same as people but highlighted border in blue)

```

---

## SUB-EVENTS TAB

```

[+ Create Sub-event Button]

## [List]

Card
Title
Small description
Attendee count
Chevron →

```

---

# 4. PROFILE PAGE

```

[Header]
Avatar (80px)
Name (H2)
Program

[Interest Tags]

## [Event Timeline Card]

Vertical timeline with dots:
• Jan — Course A
• Feb — Hackathon
• Mar — Seminar

[Events Joined]
Grid cards (2 columns)

```

---

# 5. PROFILE COMPARISON SCREEN (KEY FEATURE)

This is triggered when a user taps on another person's profile from an event.

---

## Layout

```

[Top Bar]
← Back                      Compare Profiles

## [Dual Profile Header]

(Left) You              (Right) Other User
Avatar                  Avatar
Name                    Name
Program                 Program

## [Match Score - Center Highlight]

Large Circle / Badge
"87% Match"
(animated progress ring)

## [Shared Data Section]

Shared Events
• Advanced Systems
• AI Workshop

Shared Courses
• Distributed Systems

Shared Interests
[ AI ] [ Cloud ] [ Systems ]

## [Differences Section]

Only You:
• Security

Only Them:
• Data Science

## [Action Bar]

[ Connect ]   [ Message ]   [ Invite to Sub-event ]

```

---

## UX DETAILS

- Side-by-side comparison reduces cognitive load
- Highlight similarities FIRST (positive reinforcement)
- Differences shown secondary
- Match score is the visual anchor

---

## MICRO-INTERACTIONS

- Match % animates on load
- Shared tags pulse slightly
- Connect → instant feedback (checkmark + color change)

---

## DESIGN NOTES

- Use Accent Blue (#93C5FD) for shared items highlight
- Use subtle gray for differences
- Keep symmetry between left and right profiles

---

# 6. MICRO-INTERACTIONS

- Button press → slight scale (0.97)
- Connect → checkmark animation + fade
- Match bar → animate from 0 → %
- Card hover → subtle lift

---

# 6. EMPTY STATES (CRITICAL)

```

Illustration (minimal)
"No one here yet"
[ Invite classmates ]

```

---

# 7. NAVIGATION

Bottom Tab Bar:

[ Home ] [ Explore ] [ Events ] [ Messages ] [ Profile ]

Active icon: blue
Inactive: gray

---

# 8. DESIGN FEEL

- Clean, academic, calm
- Blue = trust + intelligence
- Avoid clutter
- Emphasize people + match

---

# FINAL DESIGN PRINCIPLE

"People don’t browse. They scan."

Your UI should make users instantly see:
- who is attending
- who matches them
- what to do next

Everything else is secondary.

```
