import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

// Animation variants for page transitions
const pageVariants = {
  initial: {
    opacity: 0,
    y: "15%",
  },
  in: {
    opacity: 1,
    y: "0%",
  },
};

// Animation transition configuration
const pageTransition = {
  type: "spring",
  ease: "easeOut",
  duration: 0.75,
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
        variants={pageVariants}
        transition={pageTransition}
        className="flex w-full flex-1 flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
