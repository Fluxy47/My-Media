import React, { useState } from "react";
import shareVideo from "../assets/assets/share.mp4";
import logo from "../assets/assets/logowhite.png";

import { GoogleAuthProvider } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
import { auth, database } from "../firebaseConfig";
import { get, ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";

function Login() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const { displayName, uid, photoURL } = result.user;

      const userRef = ref(database, "users/" + uid);
      const userSnapshot = await get(userRef);

      if (!userSnapshot.exists()) {
        // If the user doesn't exist, create a new entry
        await set(userRef, {
          displayName,
          photoURL,
          uid,
        });
      }
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // const handleLogin = async () => {
  //   setIsLoading(true);
  //   try {
  //     const provider = new GoogleAuthProvider();
  //     const result = await signInWithPopup(firebaseApp.auth(), provider);
  //     const { displayName, uid, photoURL } = result.user;
  //     const doc = {
  //       _id: uid,
  //       _type: 'user',
  //       userName: displayName,
  //       image: photoURL,
  //     };

  //     // check if the user already exists in the Sanity backend
  //     const userExists = await client.getDocument(uid);
  //     if (userExists) {
  //       // user already exists, update the user document in the Sanity backend
  //       await client.patch(uid).set({ image: photoURL });
  //     } else {
  //       // user doesn't exist, create a new document in the Sanity backend
  //       await client.create(doc);
  //     }

  //     // store the user information in local storage
  //     localStorage.setItem('user', JSON.stringify(result.user));

  //     // navigate to the home page
  //     navigate('/', { replace: true });
  //   } catch (error) {
  //     console.error('Error:', error);
  //     setError(error.message);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleLoginFailure = (error) => {
  //   console.error('Error:', error);
  //   setError(error.message);
  //   setIsLoading(false);
  // };
  return (
    <div className="flex justify-start items-center flex-col h-screen overflow-hidden">
      <div className=" relative w-full h-full">
        <video
          src={shareVideo}
          type="video/mp4"
          loop
          controls={false}
          muted
          autoPlay
          className="w-full h-full object-cover"
        />

        <div className="absolute flex flex-col justify-center items-center top-0 right-0 left-0 bottom-0    bg-blackOverlay">
          <div className="p-5">
            <img src={logo} width="130px" alt="logo" />
          </div>

          <div className="shadow-2xl">
            <button onClick={handleClick}>Sign in</button>
            {isLoading && <p>Loading...</p>}
            {error && (
              <p className="text-red-700 font-[300px] text-[20px] mt-[20px] ml-5">
                Error: {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
