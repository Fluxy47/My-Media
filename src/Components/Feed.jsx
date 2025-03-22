import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { database } from "../firebaseConfig";
import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";
import { ref, get } from "firebase/database";
import { AnimatePresence } from "framer-motion";

const Feed = () => {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Set loading to true initially
  const { categoryId } = useParams();

  useEffect(() => {
    const fetchPinsData = async () => {
      setLoading(true); // ✅ Ensure loading is set to true before fetching
      try {
        const pinsRef = ref(database, "pins/");
        const pinsSnapshot = await get(pinsRef);

        if (pinsSnapshot.exists()) {
          const pinsData = pinsSnapshot.val();
          const pinsArray = Object.values(pinsData); // Convert object to array

          if (categoryId) {
            const filteredPins = pinsArray.filter(
              (pin) => pin.category === categoryId
            );
            setPins(filteredPins);
          } else {
            setPins(pinsArray);
          }
        } else {
          setPins([]); // Handle case when no data exists
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false); // ✅ Ensure loading is set to false after fetch
      }
    };

    fetchPinsData();
  }, [categoryId]);

  const ideaName = categoryId || "";

  if (loading) {
    return <Spinner message={`We are adding ideas to your feed!`} />;
  }

  return (
    <AnimatePresence mode="wait">
      <MasonryLayout ideaName={ideaName} pins={pins} isLoading={loading} />
    </AnimatePresence>
  );
};

export default Feed;
