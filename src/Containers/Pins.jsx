import React, { Suspense } from "react";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Spinner from "../Components/Spinner";
import NavBar from "../Components/NavBar";

const Feed = React.lazy(() => import("../Components/Feed"));
const PinDetail = React.lazy(() => import("../Components/PinDetail"));
const CreatePin = React.lazy(() => import("../Components/CreatePin"));
const Search = React.lazy(() => import("../Components/Search"));

function Pins({ user, sideBarFunction, toggleSidebar }) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="px-2 md:px-5 bg-black">
      <div className="bg-gray-50">
        <NavBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          user={user && user}
          sideBarFunction={sideBarFunction}
          toggleSidebar={toggleSidebar}
        />
      </div>
      <div className="h-full">
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/category/:categoryId" element={<Feed />} />
            <Route
              path="/pin-detail/:pinId"
              element={<PinDetail user={user} />}
            />
            <Route path="/create-pin" element={<CreatePin user={user} />} />
            <Route
              path="/search"
              element={
                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              }
            />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

export default Pins;
