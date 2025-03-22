import React, { useEffect, useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { motion } from "framer-motion";
import { database, storage } from "../firebaseConfig";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import { ref as dbRef, push, set, query, onValue } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import { categories } from "../Utils/data";
import Spinner from "./Spinner";

function CreatePin({ user }) {
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState(false);
  const [category, setCategory] = useState(null);
  const [imageData, setImageData] = useState({
    imageUrl: null,
    width: null,
    height: null,
  });
  console.log("imagedata", imageData);

  const { imageUrl, width, height } = imageData;
  console.log("url", imageUrl);
  console.log("height", height);
  console.log("width", width);

  const [wrongImageType, setWrongImageType] = useState(false);

  const navigate = useNavigate();

  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadImage = async (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile.type.startsWith("image/")) {
      const storageRef = ref(
        storage,
        `images/${uuidv4()}_${selectedFile.name}`
      );

      try {
        setLoading(true);
        const dimensions = await getImageDimensions(selectedFile);

        await uploadBytes(storageRef, selectedFile);
        const imageUrl = await getDownloadURL(storageRef);
        // setImageUrl(url);
        // setImageDimensions(dimensions);
        setImageData({
          imageUrl,
          width: dimensions.width,
          height: dimensions.height,
        });

        setLoading(false);
        setWrongImageType(false);
      } catch (error) {
        console.error("Image upload error:", error);
        setLoading(false);
      }
    } else {
      setLoading(false);
      setWrongImageType(true);
    }
  };

  const cleanupOrphanedImages = async () => {
    // Initialize Firebase references here
    const storageRef = ref(storage, "images/"); // Adjust the storage path as needed

    // Retrieve pinned image URLs from all pins in your database
    const pinnedImageNames = [];

    // Query your database to get all pins
    const pinsQuery = query(dbRef(database, "pins"));

    // Attach a listener to the pins query to retrieve all pins
    onValue(pinsQuery, (snapshot) => {
      try {
        const allPins = snapshot.val();

        // Iterate through all pins and extract 'filename' property
        for (const key in allPins) {
          if (allPins.hasOwnProperty(key)) {
            const filename = allPins[key].filename;
            if (filename) {
              pinnedImageNames.push(filename);
            }
          }
        }
        // List all images in Firebase Cloud Storage
        listAll(storageRef)
          .then((result) => {
            const allImages = result.items;

            // Extract filenames from allImages
            const imageFilenames = allImages.map((image) => {
              const parts = image.fullPath.split("/");
              return parts[parts.length - 1];
            });

            // Filter out the orphaned images
            const orphanedImageFilenames = imageFilenames.filter((filename) => {
              return !pinnedImageNames.includes(filename);
            });

            // Delete orphaned images
            const deletePromises = orphanedImageFilenames.map(
              async (filename) => {
                const imageRef = ref(storage, `images/${filename}`);
                await deleteObject(imageRef);
              }
            );

            return Promise.all(deletePromises);
          })
          .catch((error) => {
            console.error("Error listing images:", error);
          });
      } catch (error) {
        console.error("Error fetching all pins:", error);
      }
    });
  };

  useEffect(() => {
    cleanupOrphanedImages();
  }, []);

  const savePin = () => {
    if (title && about && imageUrl && category) {
      // Extract the UUID and filename from the imageUrl
      const filename = imageUrl.split("%2F")[1].split("?")[0];

      // Extract only the UUID part
      const uuid = filename.split("_")[0];

      const pinsRef = dbRef(database, "pins"); // Use the database reference from firebaseConfig
      const newPinRef = push(pinsRef); // Generate a unique ID and get reference
      const pinId = newPinRef.key; // Get the unique ID
      const pinData = {
        pinId,
        title,
        about,
        imageUrl,
        width,
        height,
        filename,
        uuid, // Add the UUID to the pinData
        postedBy: {
          userId: user.uid,
          userName: user.displayName,
          userImage: user.photoURL,
        },
        category,
      };

      set(newPinRef, pinData)
        .then(() => {
          navigate("/");
        })
        .catch((error) => {
          console.error("Error creating pin:", error);
        });
    } else {
      setFields(true);

      setTimeout(() => {
        setFields(false);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mt-5 lg:h-4/5 overflow-hidden">
      {fields && (
        <p className="text-red-500 mb-5 text-xl transition-all duration-150 ease-in ">
          Please add all fields.
        </p>
      )}
      <motion.div
        className=" flex lg:flex-row flex-col justify-center items-center bg-[#B93131] lg:p-5 p-3 lg:w-4/5  w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="bg-black text-white p-3 flex flex-0.7 w-full">
          <div className=" flex justify-center items-center flex-col border-2 border-dotted border-red-500 p-3 w-full h-420">
            {loading && <Spinner />}
            {wrongImageType && <p>It&apos;s wrong file type.</p>}
            {!imageUrl ? (
              <label>
                <div className="flex flex-col items-center justify-center h-full ">
                  <div className="flex flex-col justify-center items-center">
                    <p className="font-bold text-2xl">
                      <AiOutlineCloudUpload />
                    </p>
                    <p className="text-lg">Click to upload</p>
                  </div>

                  <p className="mt-32 text-gray-400">
                    Recommendation: Use high-quality JPG, JPEG, SVG, PNG, GIF or
                    TIFF less than 20MB
                  </p>
                </div>
                <input
                  type="file"
                  name="upload-image"
                  onChange={uploadImage}
                  className="w-0 h-0"
                />
              </label>
            ) : (
              <div className="relative h-full">
                <img
                  src={imageUrl}
                  alt="uploaded-pic"
                  className="h-full w-full"
                />
                <button
                  type="button"
                  className="absolute bottom-3 right-3 p-3 rounded-full bg-black text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out"
                  onClick={() =>
                    setImageData({
                      imageUrl: null,
                      width: null,
                      height: null,
                    })
                  }
                >
                  <MdDelete />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-6 lg:pl-5 mt-5 w-full bg-[#B93131]">
          {user && (
            <div className="flex gap-2 mt-2 mb-2 items-center bg-transparent rounded-lg relative  ">
              <img
                src={user.photoURL}
                className="w-[50px] h-[50px] rounded-full"
                alt="user-profile"
              />
              <p className="font-bold bg-[#B93131] text-black">
                {user.displayName}
              </p>
            </div>
          )}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add your title"
            className="outline-none text-2xl sm:text-3xl font-bold border-b-2 text-white bg-black border-red-800 p-2"
          />

          <input
            type="text"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Tell everyone what your Pin is about"
            className="outline-none text-base sm:text-lg border-b-2 text-white bg-black border-red-800 p-2"
          />

          <div className="flex flex-col bg-[#B93131]">
            <div className="bg-[#B93131]">
              <p className="mb-2 font-semibold text:lg sm:text-xl bg-[#B93131] text-white">
                Choose Pin Category
              </p>
              <select
                onChange={(e) => {
                  setCategory(e.target.value);
                }}
                className="border-2 outline-none w-full text-base border-b-2 bg-black border-red-800 text-white p-2 rounded-md cursor-pointer"
              >
                <option value="others" className="sm:text-bg bg-black">
                  Select Category
                </option>
                {categories.map((item) => (
                  <option
                    key={item.name}
                    className="text-base border-0 outline-none capitalize bg-black text-white "
                    value={item.name}
                    id={uuidv4()}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end items-end mt-5 bg-[#B93131]">
              <button
                type="button"
                onClick={savePin}
                className="bg-red-500 text-white font-bold p-2 rounded-full w-28 outline-none"
              >
                Save Pin
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CreatePin;
