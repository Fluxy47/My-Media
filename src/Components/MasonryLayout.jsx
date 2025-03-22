import React from "react";
import Masonry from "react-masonry-css";
import Pin from "./Pin";
import Spinner from "./Spinner";

const breakpointColumnsObj = {
  default: 4,
  3000: 6,
  2000: 5,
  1200: 3,
  1000: 2,
  500: 1,
};

const MasonryLayout = ({ pins, isLoading, ideaName }) => {
  console.log("pins", pins);

  return (
    <div>
      {/* Show the filter applied */}
      {ideaName && (
        <h2 className="text-xl font-bold text-white mb-4">
          Showing results for: <span className="text-[red]">{ideaName}</span>
        </h2>
      )}

      <Masonry
        className="flex animate-slide-fwd"
        breakpointCols={breakpointColumnsObj}
      >
        {isLoading ? (
          <Spinner />
        ) : pins.length === 0 ? (
          <div className="absolute left-1/2 -translate-x-1/2 font-bold text-2xl text-white pb-[100px]">
            No Pins Found!
          </div>
        ) : (
          pins?.map((pin) => <Pin key={pin?.uid} pin={pin} className="w-max" />)
        )}
      </Masonry>
    </div>
  );
};

export default MasonryLayout;
