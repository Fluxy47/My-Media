import React, { useEffect, useState } from "react";
import { AiOutlineLogout } from "react-icons/ai";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";
import { FiMenu } from "react-icons/fi";
import { auth, database } from "../firebaseConfig";
import {
  ref,
  query,
  orderByChild,
  equalTo,
  get,
  onValue,
} from "firebase/database";
import { signOut } from "firebase/auth";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const activeBtnStyles =
  "bg-red-500 text-white font-bold p-2 rounded-full w-20 outline-none";
const notActiveBtnStyles =
  "bg-primary bg-white text-black font-bold p-2 rounded-full w-20 outline-none";

const UserProfile = ({ toggleSidebar, sideBarFunction }) => {
  const [user, setUser] = useState();
  const [pins, setPins] = useState([]);
  const [text, setText] = useState("Created");
  const [imageUrl, setImageUrl] = useState(
    sessionStorage.getItem("unsplashImage") || ""
  );

  const [loading, setLoading] = useState(!imageUrl);

  const ApiKey = import.meta.env.VITE_API_UNSPLASH_API_KEY;

  useEffect(() => {
    if (!imageUrl) {
      fetch(`https://api.unsplash.com/photos/random?client_id=${ApiKey}`)
        .then((response) => response.json())
        .then((data) => {
          const newImageUrl = data.urls.full;

          // Preload Image
          const img = new Image();
          img.src = newImageUrl;
          img.onload = () => {
            setImageUrl(newImageUrl);
            setLoading(false);
            sessionStorage.setItem("unsplashImage", newImageUrl);
          };
        })
        .catch((error) => {
          console.error("Error fetching image:", error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const [activeBtn, setActiveBtn] = useState("created");
  const navigate = useNavigate();
  const { userId } = useParams();

  const [savedPins, setSavedPins] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = ref(database, "users/" + userId); // Use the UID of the current user
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
          setUser(userSnapshot.val());
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    if (user && user.savedPins) {
      const fetchSavedPins = async () => {
        try {
          const savedPinsPromises = user.savedPins.map(async (pinId) => {
            const pinRef = ref(database, `pins/${pinId}`);
            const pinSnapshot = await get(pinRef);
            return pinSnapshot.exists() ? pinSnapshot.val() : null;
          });

          const savedPinsData = await Promise.all(savedPinsPromises);
          const filteredSavedPins = savedPinsData.filter((pin) => pin !== null);
          setSavedPins(filteredSavedPins);
        } catch (error) {
          console.error("Error fetching saved pins:", error);
        }
      };

      fetchSavedPins();
    }
  }, [user]);

  useEffect(() => {
    const fetchPins = () => {
      if (!user || !user.uid) {
        // User is not authenticated, or user.uid is not available yet
        return;
      }

      const pinsRef = ref(database, "pins");
      const userPinsQuery = query(
        pinsRef,
        orderByChild("postedBy/userId"),
        equalTo(user?.uid)
      );

      onValue(
        userPinsQuery,
        (snapshot) => {
          try {
            const matchingPosts = snapshot.val();

            // Convert the object into an array
            const matchingPostsArray = Object.values(matchingPosts);

            setPins(matchingPostsArray);
            // Process and store the posts in your state or variable
          } catch (error) {
            console.error("Error fetching posts:", error);
          }
        },
        {
          onlyOnce: true, // Fetch data once and detach the listener
        }
      );
    };

    fetchPins();
  }, [user]);

  async function handleLogout() {
    try {
      await signOut(auth);
      // Additional asynchronous cleanup or actions can go here
      // Example: Clear user-related data from app state
      // await clearUserData();

      navigate("/login", { replace: true });
    } catch {
      console.log("failed to logout");
    }
  }

  if (!user) return <Spinner message="Loading profile" />;

  return (
    <div className="relative pb-2 h-full justify-center items-center">
      <div className="flex flex-col pb-5">
        <section className="flex fixed top-5 z-10 w-full items-center justify-between">
          <motion.div
            className="bg-transparent pl-2"
            initial={{ marginLeft: 0 }}
            animate={{ marginLeft: toggleSidebar ? 200 : 0 }}
            transition={{ duration: 0.7 }}
          >
            <button
              className="w-[2rem] ml-1 bg-transparent "
              onClick={sideBarFunction}
            >
              <FiMenu className="bg-transparent" color="red" fontSize={30} />
            </button>
          </motion.div>

          <div className="pr-7 bg-transparent hidden md:block">
            <button
              className=" bg-white p-2 rounded-full cursor-pointer outline-none shadow-md"
              onClick={handleLogout}
              type="button"
            >
              <AiOutlineLogout className="bg-white" color="red" fontSize={20} />
            </button>
          </div>
        </section>

        <div className="fixed  md:top-[10%] right-2 z-10 bg-transparent md:hidden">
          <button
            className=" bg-white p-2 rounded-full cursor-pointer outline-none shadow-md"
            onClick={handleLogout}
            type="button"
          >
            <AiOutlineLogout className="bg-white" color="red" fontSize={20} />
          </button>
        </div>
        <div className="relative flex flex-col mb-7 ">
          <div className="flex  flex-col justify-center items-center">
            <div className="w-full h-[80vh] 2xl:h-[510px] relative">
              {loading ? (
                <Skeleton
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  baseColor="#e0e0e0" // Light gray for a smooth look
                  highlightColor="#f5f5f5" // Slightly brighter shimmer
                  duration={1.5} // Slower shimmer for a subtle effect
                  containerClassName="animate-fadeIn" // Custom fade-in animation
                />
              ) : (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full shadow-lg object-cover rounded-b-lg"
                  src={imageUrl}
                  alt="Random Unsplash"
                />
              )}
            </div>
            <img
              className="rounded-full w-20 h-20 z-[1] -mt-10 shadow-xl object-cover"
              src={user.photoURL}
              alt="user-pic"
            />

            <h1 className="font-bold text-3xl mt-3 text-white">
              {user.displayName}
            </h1>
          </div>
        </div>
        <div className="flex gap-2 w-full justify-center items-center mb-7 ">
          <button
            type="button"
            onClick={(e) => {
              setText(e.target.textContent);
              setActiveBtn("created");
            }}
            className={`${
              activeBtn === "created" ? activeBtnStyles : notActiveBtnStyles
            }`}
          >
            Created
          </button>
          <button
            type="button"
            onClick={(e) => {
              setText(e.target.textContent);
              setActiveBtn("saved");
            }}
            className={`${
              activeBtn === "saved" ? activeBtnStyles : notActiveBtnStyles
            }`}
          >
            Saved
          </button>
        </div>

        {activeBtn === "saved" && (
          <div className="px-2">
            <MasonryLayout pins={savedPins} />
          </div>
        )}

        {activeBtn === "created" && (
          <div className="px-2">
            <MasonryLayout pins={pins} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
