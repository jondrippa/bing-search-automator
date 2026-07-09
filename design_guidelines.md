# Accessibility-First UI/UX Design Guidelines for Bing Rewards Automator

This document outlines the design principles and guidelines for redesigning the Bing Rewards Automator mobile application to ensure optimal usability and accessibility for users across a wide age range (10-80 years old). The goal is to create an intuitive, clutter-free, and easy-to-navigate interface.

## 1. General Principles

-   **Simplicity**: Prioritize essential information and actions. Remove unnecessary elements to reduce cognitive load.
-   **Consistency**: Maintain a consistent visual language, interaction patterns, and terminology across all screens.
-   **Clarity**: Use clear, concise language and avoid jargon. Ensure all interactive elements have a clear purpose.
-   **Feedback**: Provide immediate and understandable feedback for all user actions.
-   **Forgiveness**: Design for error prevention and provide clear ways to recover from mistakes.

## 2. Layout and Spacing

-   **Generous Spacing**: Implement ample padding and margins around elements to prevent a cramped feel and improve readability. Aim for a minimum of 16dp (density-independent pixels) spacing between major components.
-   **Large Touch Targets**: All interactive elements (buttons, toggles, list items) must have a minimum touch target size of 48x48dp, as recommended by Material Design and Apple Human Interface Guidelines [1] [2].
-   **Clear Visual Hierarchy**: Use size, color, and placement to guide the user's eye to the most important information and actions.
-   **Single-Column Layout (Primary Content)**: For main content areas, prefer a single-column layout on mobile to simplify scanning and reduce horizontal scrolling.
-   **Logical Grouping**: Group related information and actions together visually.

## 3. Typography

-   **Legible Fonts**: Use clear, sans-serif fonts (e.g., Roboto, San Francisco) that are easy to read at various sizes.
-   **Minimum Font Size**: Ensure a minimum font size of 16sp (scale-independent pixels) for body text. Headings and important labels should be larger.
-   **High Contrast**: Maintain a high contrast ratio between text and background colors (minimum 4.5:1 for normal text, 3:1 for large text) to aid readability, especially for users with visual impairments [3].
-   **Limited Font Styles**: Use a maximum of 2-3 font weights/styles per screen to maintain visual consistency and avoid clutter.

## 4. Color and Contrast

-   **Light Theme Focus**: Adhere to the user's request for a light theme. Ensure all elements are clearly distinguishable in this theme.
-   **Meaningful Color Use**: Use color to convey meaning (e.g., green for success, red for error, blue for interactive elements) but do not rely on color alone to convey information.
-   **Sufficient Contrast**: As mentioned in typography, ensure high contrast for all text and interactive elements.

## 5. Navigation

-   **Clear Tab Bar Labels**: All tab bar icons must have clear, concise text labels in addition to icons.
-   **Predictable Navigation**: Users should always know where they are in the app and how to get back to previous screens.
-   **Reduced Complexity**: Avoid deep navigation hierarchies. Keep the most important features easily accessible.

## 6. Interactive Elements (Buttons, Toggles, Inputs)

-   **Descriptive Labels**: All buttons and controls should have clear, descriptive labels that indicate their action.
-   **Visual Feedback**: Provide clear visual feedback (e.g., press states, loading indicators) when an interactive element is tapped or activated.
-   **Input Field Clarity**: Use clear labels, placeholder text, and appropriate input types for forms. Ensure sufficient spacing around input fields.
-   **Toggle Switches**: Use large, easy-to-tap toggle switches for on/off states.

## 7. Data Visualization (Charts, Counters)

-   **Simplicity**: Charts should convey information quickly and clearly. Avoid overly complex visualizations.
-   **Large Labels**: Ensure chart labels, legends, and data points are large enough to be easily read.
-   **Color Blindness Consideration**: Use color palettes that are distinguishable for users with color vision deficiencies [4].
-   **Clear Counters**: Point and search counters should be prominent, easy to locate, and use large, readable numbers.

## References

1.  [Material Design - Accessibility](https://m2.material.io/design/usability/accessibility.html)
2.  [Apple Human Interface Guidelines - Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility/overview/introduction/)
3.  [Web Content Accessibility Guidelines (WCAG) 2.1 - Contrast (Minimum)](https://www.w3.org/TR/WCAG21/#contrast-minimum)
4.  [Color Blindness Simulation and Tools](https://www.color-blindness.com/color-blindness-simulators/)
