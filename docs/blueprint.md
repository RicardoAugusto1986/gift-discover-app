# **App Name**: Gift Discover

## Core Features:

- Product Video Feed: Display a continuous, scrollable feed of product videos sourced from an API.
- API Content Integration: Fetch video content and product information dynamically from a specified API endpoint.
- Interactive Product Banners: Allow users to tap product banners, redirecting them to external links for purchases or more info.
- Themed UI Toggling: Users can switch between light and dark UI themes, as is already present in the code.
- Interactive Like Function: Users can like items
- Interactive Share Function: Users can share the link for each item with others.
- AI Content Suggestion Tool: Based on user interactions (likes, shares, clicks), the AI tool suggests relevant products for the user to display more products the user is likely to interact with, increasing user retention. The Nextjs backend provides endpoints consumed by the client, which in turn call and proxy LLM calls.

## Style Guidelines:

- Primary color: Deep Indigo (#3F51B5) for a sense of trust and discovery.
- Background color: Very light gray (#F5F5F5) to ensure content focus and readability in light mode; Dark charcoal (#121212) for dark mode.
- Accent color: Vivid Blue (#29ABE2) for interactive elements and call-to-action buttons.
- Body and headline font: 'Inter' sans-serif for a clean, modern user experience.
- Simple, outlined icons from Font Awesome to maintain a consistent, minimalist style.
- Use a full-screen video layout with overlaid text and interactive elements for maximum engagement.
- Subtle transition animations for theme changes and content loading to create a smooth user experience.