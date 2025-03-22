import React, { useEffect, useState } from "react";

import MasonryLayout from "./MasonryLayout";
import { database } from "../firebaseConfig";
import { AnimatePresence } from "framer-motion";
import { get, ref } from "firebase/database";

const Search = ({ searchTerm }) => {
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pinsRef = ref(database, "pins");
        const snapshot = await get(pinsRef);

        if (snapshot.exists()) {
          const pins = [];
          snapshot.forEach((childSnapshot) => {
            const pin = childSnapshot.val();
            pins.push(pin);
          });

          // If there's a search term, filter results; otherwise, show all pins
          if (searchTerm) {
            const filteredPins = pins.filter(
              (pin) =>
                pin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pin.about.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(filteredPins);
          } else {
            setSearchResults(pins); // Show all pins when search is empty
          }
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [searchTerm]);

  return (
    <AnimatePresence mode="wait">
      {searchResults.length > 0 && <MasonryLayout pins={searchResults} />}
      {searchResults.length === 0 && searchTerm !== "" && (
        <div className="mt-10 text-center text-xl text-white">
          No Pins Found!
        </div>
      )}
    </AnimatePresence>
  );
};

export default Search;
