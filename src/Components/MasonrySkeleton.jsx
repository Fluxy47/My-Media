import React from 'react'
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

function MasonrySkeleton({pin}) {

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="m-2"
    >
      <div

        className=" relative cursor-pointer w-auto hover:shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out border-[1px] border-solid border-red-400 "
      >
        
        <AnimatePresence mode="wait">
      <div
        className="rounded-lg w-full relative overflow-hidden"
        style={{
          width: pin.width,
          paddingTop: `${(pin.height / pin.width) * 93}%`, // Maintain aspect ratio
        }}
      >
       
<Skeleton
height="100%"
width="100%"
style={{
 position: "absolute",
 top: 0,
 left: 0,
 borderRadius: "8px",
 animation: "pulse 1.5s infinite",
}}
baseColor="#e0e0e0"
highlightColor="#f5f5f5"
/>
      </div>
    </AnimatePresence>

      </div>
      <div className="flex gap-2 mt-2 items-center">
<Skeleton
  circle
  width={32}
  height={32}
  baseColor="#ddd"
  highlightColor="#eee"
  duration={1.2}
/>
<Skeleton
  width={100}
  height={16}
  baseColor="#ddd"
  highlightColor="#f0f0f0"
  duration={1.2}
/>
</div>
    </motion.div>
  )
}

export default MasonrySkeleton





