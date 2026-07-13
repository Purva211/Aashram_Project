import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable Scroll Reveal Animation Wrapper
 * Uses framer-motion to smoothly reveal elements when they enter the viewport.
 */
const ScrollReveal = ({ 
  children, 
  as: Component = 'div', // Tag to render (div, section, p, h1, etc.)
  direction = 'up', // up, down, left, right, scale, fade
  duration = 0.8, 
  delay = 0,
  className = '',
  amount = 0.1, // Element visibility ratio before triggering
  once = false, // Play continuously on every scroll
  ...props 
}) => {
  // Determine if framer-motion v12 create() API is available, fallback to motion[tag]
  let MotionTag;
  if (typeof Component === 'string') {
    MotionTag = motion[Component] || motion.div;
  } else {
    // For custom components
    MotionTag = motion(Component);
  }

  const getVariants = () => {
    switch (direction) {
      case 'up': return { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0 } };
      case 'down': return { hidden: { opacity: 0, y: -60 }, visible: { opacity: 1, y: 0 } };
      case 'left': return { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } };
      case 'right': return { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } };
      case 'scale': return { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } };
      case 'scale-up': return { hidden: { opacity: 0, scale: 0.8, y: 30 }, visible: { opacity: 1, scale: 1, y: 0 } };
      case 'fade': return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
      default: return { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0 } };
    }
  };

  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }} // Premium smooth easing curve
      variants={getVariants()}
      className={className}
      {...props}
    >
      {children}
    </MotionTag>
  );
};

export default ScrollReveal;
