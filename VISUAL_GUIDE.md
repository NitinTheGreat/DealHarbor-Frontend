# 🎨 Visual Guide - DealHarbor Messaging UI

## 📱 Screenshots Description

### 1. Messages Page Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  CONVERSATIONS SIDEBAR      │      CHAT AREA                    │
│  (Left 384px)               │      (Right - Flexible)           │
├─────────────────────────────┼───────────────────────────────────┤
│  ┌─────────────────────┐    │  ┌─────────────────────────────┐ │
│  │   Messages          │    │  │  👤 Priya Sharma  ⚫ Online │ │
│  │   (College Font)    │    │  │  📞 📹 ℹ️ ⋮                  │ │
│  └─────────────────────┘    │  └─────────────────────────────┘ │
│  ┌─────────────────────┐    │  ┌─────────────────────────────┐ │
│  │  🔍 Search...       │    │  │  📦 iPhone 14 Pro Max       │ │
│  └─────────────────────┘    │  │  ₹89,999  [View Product]    │ │
│                              │  └─────────────────────────────┘ │
│  ┌─────────────────────┐    │                                   │
│  │ PS  Priya Sharma ⚫ │    │  ┌─────────────────────────────┐ │
│  │ 📦 iPhone 14...     │    │  │    Hi! I'm interested...    │ │
│  │ Is it still...   2m │ 2  │  │    10:30 AM                 │ │
│  └─────────────────────┘    │  └─────────────────────────────┘ │
│                              │                                   │
│  ┌─────────────────────┐    │         ┌──────────────────┐     │
│  │ RV  Rahul Verma     │    │         │ Yes! It includes  │     │
│  │ 🎧 Sony WH-1000... │    │         │ original box... ✓✓│     │
│  │ Can we meet...  1h  │    │         │ 10:32 AM          │     │
│  └─────────────────────┘    │         └──────────────────┘     │
│                              │                                   │
│  ┌─────────────────────┐    │  ┌─────────────────────────────┐ │
│  │ AP  Ananya Patel ⚫ │    │  │    Is it still available?   │ │
│  │ 💻 MacBook Air M2   │    │  │    10:45 AM                 │ │
│  │ Thanks for...   3h  │    │  └─────────────────────────────┘ │
│  └─────────────────────┘    │                                   │
│                              │  ┌─────────────────────────────┐ │
│                              │  │ 📎 🖼️  Type a message... 😊 ✈️│ │
│                              │  └─────────────────────────────┘ │
└─────────────────────────────┴───────────────────────────────────┘
```

---

## 🎨 Color Palette

### Primary Colors
```
Pink Primary:     #D97E96  ████████
Pink Hover:       #E598AD  ████████
Background:       #FEF5F6  ████████
White:            #FFFFFF  ████████
```

### Text Colors
```
Heading:          #2D3748  ████████
Text:             #333333  ████████
Subheading:       #718096  ████████
Muted:            #CBD5E0  ████████
```

### Status Colors
```
Online Green:     #10B981  ████████
Read Blue:        #3B82F6  ████████
Warning Yellow:   #F59E0B  ████████
Error Red:        #EF4444  ████████
```

---

## 📐 Spacing & Sizing

### Border Radius
- Small: `8px`  (rounded-lg)
- Medium: `12px` (rounded-xl)
- Large: `16px` (rounded-2xl)
- Full: `9999px` (rounded-full)

### Padding
- Small: `8px`
- Medium: `16px`
- Large: `24px`

### Font Sizes
- Heading: `30px` (3xl)
- Subheading: `20px` (xl)
- Body: `15px` (base)
- Small: `12px` (xs)

---

## 🎭 Component States

### Conversation Item
```
┌─────────────────────────────────┐
│ Normal State                    │
│ ├─ White background             │
│ ├─ Hover: White/50 background   │
│ └─ Selected: Pink gradient bg   │
└─────────────────────────────────┘
```

### Message Bubble
```
┌─────────────────────────────────┐
│ Own Message                     │
│ ├─ Pink gradient background     │
│ ├─ White text                   │
│ └─ Rounded corners (right tail) │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Other's Message                 │
│ ├─ White/90 background          │
│ ├─ Dark text                    │
│ └─ Rounded corners (left tail)  │
└─────────────────────────────────┘
```

### Button States
```
┌─────────────────────────────────┐
│ Primary Button                  │
│ ├─ Pink gradient background     │
│ ├─ White text                   │
│ ├─ Hover: Shadow-lg effect      │
│ └─ Disabled: Opacity 50%        │
└─────────────────────────────────┘
```

---

## 📱 Responsive Breakpoints

### Mobile (< 768px)
- Sidebar: Full width
- Chat area: Hidden until conversation selected
- Stack layout

### Tablet (768px - 1024px)
- Sidebar: 384px fixed
- Chat area: Remaining width
- Side-by-side layout

### Desktop (> 1024px)
- Sidebar: 384px fixed
- Chat area: Flexible width
- Full featured layout

---

## 🎬 Animations

### fadeIn (Messages)
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* Duration: 0.3s */
```

### slideIn (Conversations)
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
/* Duration: 0.3s */
```

### Typing Indicator
```
typing.·.·  (animated dots bounce)
```

---

## 🔔 Status Indicators

### Message Status
```
🔄 Sending    - Spinning loader
✓  Sent       - Single gray check
✓✓ Delivered  - Double gray checks
✓✓ Read       - Double blue checks
```

### User Status
```
⚫ Online     - Green dot (10px)
⚪ Offline    - No dot (gray text)
```

### Connection Status
```
📡 Connected    - Hidden (default)
📴 Disconnected - Red badge top-right
```

---

## 🎨 Glassmorphism Effect

### CSS Properties
```css
background: rgba(255, 255, 255, 0.9);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.3);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### Applied To
- Conversation sidebar
- Chat area background
- Product info banner
- Message input
- Search bar

---

## 📝 Typography

### Font Families
```css
Headings:    'College', serif
Subheadings: 'Rabelo', serif
Body:        'Inter', sans-serif
Buttons:     'Barlow Semi Condensed', sans-serif
Links:       'Poppins', sans-serif
```

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## 🎯 Interactive Elements

### Hover Effects
```
Conversation Item:
- Background: white/50
- Cursor: pointer
- Transition: 200ms ease

Button:
- Shadow: lg
- Transform: scale(1.02)
- Transition: 150ms ease

Input:
- Ring: 2px pink
- Border: pink
- Transition: 150ms ease
```

### Focus States
```
All interactive elements:
- Ring: 2px pink (#D97E96)
- Outline: none
- Transition: 150ms ease
```

---

## 🖼️ Image Handling

### Avatar Sizes
- Small: 40px (h-10)
- Medium: 48px (h-12)
- Large: 64px (h-16)

### Product Image
- Conversation: 64x64px
- Chat banner: 64x64px
- Rounded: 12px (rounded-xl)

### Fallback
- Gradient background
- Initials (2 letters)
- Centered text

---

## 📊 Empty States

### No Conversations
```
     💬
No conversations yet
Start chatting with sellers!
```

### No Messages
```
     👋
Start the conversation
Say hi and ask about the product!
```

### Select Conversation
```
     💬
Select a conversation
Choose a conversation from the left
```

---

## 🌈 Gradient Backgrounds

### Pink Gradient (Primary)
```css
background: linear-gradient(to right, #D97E96, #E598AD);
```

### Background Gradient
```css
background: linear-gradient(to bottom right, 
  #FEF5F6, 
  white, 
  #FEF5F6
);
```

### Section Gradients
```css
/* Header */
background: linear-gradient(to right, 
  rgba(217, 126, 150, 0.1), 
  rgba(229, 152, 173, 0.1)
);

/* Chat Area */
background: linear-gradient(to bottom, 
  transparent, 
  rgba(255, 255, 255, 0.2)
);
```

---

## 🎪 Special Effects

### Scrollbar Styling
```css
width: 8px;
track: rgba(0, 0, 0, 0.05);
thumb: rgba(217, 126, 150, 0.3);
thumb-hover: rgba(217, 126, 150, 0.5);
border-radius: 10px;
```

### Shadow Levels
```css
sm:  0 1px 2px rgba(0, 0, 0, 0.05)
md:  0 4px 6px rgba(0, 0, 0, 0.1)
lg:  0 10px 15px rgba(0, 0, 0, 0.1)
xl:  0 20px 25px rgba(0, 0, 0, 0.1)
```

---

## 🎨 Dark Mode (Future)

### Color Adjustments Needed
- Background: #1A202C
- Surface: #2D3748
- Text: #E2E8F0
- Primary: Keep pink
- Borders: rgba(255, 255, 255, 0.1)

---

This visual guide helps you understand the design system and maintain consistency across the messaging feature! 🎨
