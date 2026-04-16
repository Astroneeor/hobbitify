import { Skill } from '../types/skill';

/**
 * Example skill tree for CSS learning (1-100 difficulty scale)
 * Used for testing when backend is unavailable
 */
export const CSS_SKILL_TREE: Skill[] = [
  {
    Name: "Creating advanced CSS designs",
    Description: "Master advanced CSS techniques for complex and visually appealing web designs",
    Completion: "Build a fully responsive portfolio site using only CSS (no frameworks) with animations, grid layouts, and dark/light theme toggle",
    Children: ["Advanced Layout Techniques", "CSS Animations", "Responsive Design"],
    Difficulty: 10
  },
  {
    Name: "Advanced Layout Techniques",
    Description: "Learn complex layout methods in CSS",
    Completion: "Recreate a complex magazine-style layout using both Grid and Flexbox without any fixed dimensions",
    Children: ["CSS Grid", "Flexbox Mastery"],
    Difficulty: 25
  },
  {
    Name: "CSS Grid",
    Description: "Master CSS Grid for complex two-dimensional layouts",
    Completion: "Build a responsive dashboard with overlapping grid areas, named lines, and subgrid",
    Children: ["Grid Challenge"],
    Difficulty: 35
  },
  {
    Name: "Grid Challenge",
    Description: "Create a responsive dashboard layout using advanced CSS Grid features",
    Completion: "Build a fully responsive admin dashboard that adapts from mobile to 4K without media queries, using auto-fill, minmax, and container queries",
    Children: [],
    Difficulty: 55
  },
  {
    Name: "Flexbox Mastery",
    Description: "Deepen understanding of Flexbox for flexible one-dimensional layouts",
    Completion: "Build a complex multi-level navigation system with dropdowns using only Flexbox",
    Children: ["Flexbox Challenge"],
    Difficulty: 20
  },
  {
    Name: "Flexbox Challenge",
    Description: "Build a complex navigation menu using Flexbox",
    Completion: "Create an accessible, keyboard-navigable mega-menu with animated transitions",
    Children: [],
    Difficulty: 45
  },
  {
    Name: "CSS Animations",
    Description: "Create engaging animations using CSS transitions and keyframes",
    Completion: "Build a multi-step animated onboarding flow with sequenced keyframe animations",
    Children: ["Keyframe Animations"],
    Difficulty: 30
  },
  {
    Name: "Keyframe Animations",
    Description: "Master keyframe animations for complex choreographed motion",
    Completion: "Create a CSS-only animated infographic with synchronized data visualizations",
    Children: ["Advanced Animation Challenge"],
    Difficulty: 50
  },
  {
    Name: "Advanced Animation Challenge",
    Description: "Create complex, performance-optimized CSS animations",
    Completion: "Build a CSS-only interactive game or physics simulation using animations, transforms, and checkbox hacks",
    Children: [],
    Difficulty: 88
  },
  {
    Name: "Responsive Design",
    Description: "Create designs that adapt seamlessly to any screen size and device",
    Completion: "Build a content-heavy site that works perfectly from smartwatch to ultrawide without breakpoints",
    Children: ["Responsive Images"],
    Difficulty: 25
  },
  {
    Name: "Responsive Images",
    Description: "Implement responsive images for optimal performance across devices",
    Completion: "Create an image gallery with art direction, resolution switching, and lazy loading using only HTML/CSS",
    Children: ["Responsive Design Challenge"],
    Difficulty: 35
  },
  {
    Name: "Responsive Design Challenge",
    Description: "Create a fully responsive, production-grade landing page",
    Completion: "Build a pixel-perfect responsive clone of a complex SaaS landing page that scores 100 on Lighthouse performance and accessibility",
    Children: [],
    Difficulty: 72
  }
];
