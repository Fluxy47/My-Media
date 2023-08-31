import React, { useEffect, useState } from "react";

import MasonryLayout from "./MasonryLayout";
import { client } from "../client";
import { feedQuery, searchQuery } from "../Utils/data";
import Spinner from "./Spinner";
import { database } from "../firebaseConfig";
import { AnimatePresence } from "framer-motion";
import { endAt, get, orderByChild, ref, startAt } from "firebase/database";

const Search = ({ searchTerm }) => {
  const [pins, setPins] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const pinsRef = ref(database, "pins");

    if (searchTerm !== "") {
      const query = orderByChild(pinsRef, "titleLower");
      const startAtQuery = startAt(query, searchTerm.toLowerCase());
      const endAtQuery = endAt(
        startAtQuery,
        searchTerm.toLowerCase() + "\uf8ff"
      );

      get(endAtQuery)
        .then((snapshot) => {
          const searchData = snapshot.val() || {};
          const searchPins = Object.values(searchData);
          setPins(searchPins);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching search results:", error);
          setLoading(false);
        });
    } else {
      get(pinsRef)
        .then((snapshot) => {
          const feedData = snapshot.val() || {};
          const feedPins = Object.values(feedData);
          setPins(feedPins);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching feed pins:", error);
          setLoading(false);
        });
    }
  }, [searchTerm]);

  return (
    <AnimatePresence mode="wait">
      {loading && <Spinner message="Searching pins" />}
      {pins?.length !== 0 && <MasonryLayout pins={pins} />}
      {pins?.length === 0 && searchTerm !== "" && !loading && (
        <div className="mt-10 text-center text-xl ">No Pins Found!</div>
      )}
    </AnimatePresence>
  );
};

export default Search;
