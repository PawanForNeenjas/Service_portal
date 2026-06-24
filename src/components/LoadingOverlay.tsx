import { AnimatePresence, motion } from "framer-motion";

export function LoadingOverlay({ show, label = "Loading" }: { show: boolean; label?: string }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className="fixed inset-x-0 top-0 z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="h-1 overflow-hidden bg-sky-100">
            <motion.div
              className="h-full w-1/2 bg-primary"
              initial={{ x: "-100%" }}
              animate={{ x: "220%" }}
              transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
            />
          </div>
          <span className="sr-only">{label}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
