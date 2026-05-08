import React from "react";
import { FaUserMd } from "react-icons/fa";
import "./CommonCSS.css";

const Topbar = () => {
  return (
    <>
      <div className="MainDiv">
        <div className="Hideshow">
          <h2>E-Health Management Hub</h2>
        </div>
        <div className="SearchDiv">
          <input type="text" placeholder="Search Patient By Health Id...." />
        </div>
        <div className="IconsDiv">
          <FaUserMd className="Icons user" />
        </div>
      </div>
    </>
  );
};

export default Topbar;
