import React from "react";
import Masonry from "react-masonry-css";
import Pin from "./Pin";
import { AnimatePresence } from "framer-motion";

const breakpointColumnsObj = {
  default: 4,
  3000: 6,
  2000: 5,
  1200: 3,
  1000: 2,
  500: 1,
};

const MasonryLayout = ({ pins }) => {
  console.log("ahHH", pins);
  return (
    <Masonry
      className="flex animate-slide-fwd"
      breakpointCols={breakpointColumnsObj}
    >
      {pins.length === 0 && (
        <h2 className="text-center font-bold text-2xl break-keep text-white ">
          Currently There are no Pins
        </h2>
      )}
      {pins?.map((pin) => (
        <Pin key={pin?.category} pin={pin} className="w-max" />
      ))}
    </Masonry>
  );
};

export default MasonryLayout;
