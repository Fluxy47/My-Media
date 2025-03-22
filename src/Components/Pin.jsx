import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { MdDownloadForOffline } from "react-icons/md";
import { AiTwotoneDelete } from "react-icons/ai";
import { BsFillArrowUpRightCircleFill } from "react-icons/bs";
import { AnimatePresence, motion } from "framer-motion";
import { auth, database, storage } from "../firebaseConfig";
import { get, push, ref, remove, set, update } from "firebase/database";
import { deleteObject, ref as storageRef } from "@firebase/storage";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Pin = ({ pin }) => {
  const [postHovered, setPostHovered] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  const { imageUrl, height, width, pinId, postedBy } = pin;

  const { userId, userImage, userName } = postedBy;

  const deletePin = async (pinId) => {
    const pinRef = ref(database, "pins/" + pinId);
    const pinSnapshot = await get(pinRef);

    if (pinSnapshot.exists()) {
      const pinData = pinSnapshot.val();
      const imageRef = pinData.filename;

      // Delete the pin data from the database
      await remove(pinRef);

      const ImageRef = storageRef(storage, `images/${imageRef}`);

      // Delete the file
      try {
        await deleteObject(ImageRef);
        window.location.reload();
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    } else {
      console.log("Pin not found");
    }
  };

  const savePin = async (pinId) => {
    try {
      setSavingPost(true); // Start showing "Saving"

      if (currentUser) {
        const userRef = ref(database, "users/" + currentUser.uid);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          let savedPins = userData.savedPins || [];

          if (!savedPins.includes(pinId)) {
            savedPins.push(pinId);

            const updates = { savedPins };
            await update(userRef, updates);
          }
        } else {
          console.log("User data not found");
        }
      } else {
        console.log("No user is currently logged in");
      }

      setSavingPost(false); // Stop showing "Saving" after completion
    } catch (error) {
      console.error("Error:", error);
      setSavingPost(false); // Ensure it resets on error
    }
  };

  const [userSavedPins, setUserSavedPins] = useState([]);

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      const userRef = ref(database, "users/" + currentUser.uid);
      get(userRef)
        .then((userSnapshot) => {
          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            setUserSavedPins(userData.savedPins || []);
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [savePin, pinId]);

  const isPinSaved = userSavedPins.includes(pinId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="m-2"
    >
      <div
        onMouseEnter={() => setPostHovered(true)}
        onMouseLeave={() => setPostHovered(false)}
        onClick={() => navigate(`/pin-detail/${pinId}`)}
        className=" relative cursor-pointer w-auto hover:shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out border-[1px] border-solid border-red-400 "
      >
        {!imageLoaded && (
          <div
            exit={{ opacity: 0 }}
            className="rounded-lg w-full relative overflow-hidden"
            style={{
              width: width,
              paddingTop: `${(height / width) * 93}%`, // Maintain aspect ratio
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
              }}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
              duration={1.5} // Slower shimmer for a subtle effect
              containerClassName="animate-fadeIn" // Custom fade-in animation
            />
          </div>
        )}

        {imageUrl && (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg w-full"
            src={imageUrl}
            onLoad={() => setImageLoaded(true)}
            alt="user-post"
          />
        )}

        {postHovered && (
          <div
            className="absolute top-0 w-full h-full flex flex-col justify-between p-1 pr-2 pt-2 pb-2 z-50"
            style={{ height: "100%" }}
          >
            <div className="flex items-center justify-between">
              {isPinSaved ? (
                <button
                  type="button"
                  className="bg-red-500 opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl hover:shadow-md outline-none"
                >
                  Saved
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    savePin(pinId);
                  }}
                  type="button"
                  className="bg-red-500 opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl hover:shadow-md outline-none"
                >
                  {savingPost ? "Saving..." : "Save"}
                </button>
              )}
            </div>
            <div className=" flex justify-end items-center gap-2 w-full">
              {currentUser.uid === userId && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePin(pinId);
                  }}
                  className="bg-white  p-2 rounded-full w-8 h-8 flex items-center justify-center text-dark opacity-75 hover:opacity-100 outline-none"
                >
                  <AiTwotoneDelete className="bg-white" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <Link
        to={`/user-profile/${userId}`}
        className="flex gap-2 mt-2 items-center"
      >
        <img
          className="w-8 h-8 rounded-full object-cover"
          src={userImage}
          alt="user-profile"
        />
        <p className="font-semibold capitalize text-white">{userName}</p>
      </Link>
    </motion.div>
  );
};

export default Pin;
