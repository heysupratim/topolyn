import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

// Animation variants for page transitions
const pageVariants = {
  initial: {
    opacity: 0,
    x: "5%", // Start slightly to the right for enter, left for exit
  },
  in: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: "-5%",
  },
};

// Animation transition configuration
const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3, // Quick but smooth transition
};

interface AnimatedRoutesProps {
  children: ReactNode;
}

export function AnimatedRoutes({ children }: AnimatedRoutesProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {/* Key must be directly on the child of AnimatePresence */}
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="flex w-full flex-1 flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
