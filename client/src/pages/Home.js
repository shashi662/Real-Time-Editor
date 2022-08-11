import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [userName, setuserName] = useState("");
  const createNewRoom = (e) => {
    e.preventDefault();
    setRoomId(uuidv4());
    toast.success("Created a new room");
  };
  const joinRoom = () => {
    if (!roomId || !userName) {
      toast.error(`Room Id & User Name is required`);
      return;
    }

    // redirect to editor page
    navigate(`/editor/${roomId}`, {
      state: {
        userName,
      },
    });
  };
  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <img
          src="https://github.com/codersgyan/realtime-code-editor/blob/main/public/code-sync.png?raw=true"
          alt="#editorLogo"
          className="homepageLogo"
        />
        <h4 className="mainLabel">Paste Invitation ROOM ID</h4>
        <div className="inputGroup">
          <input
            type="text"
            className="inputBox"
            placeholder="ROOM ID"
            onChange={(e) => {
              setRoomId(e.target.value);
            }}
            value={roomId}
            onKeyUp={handleInputEnter}
          />
          <input
            type="text"
            className="inputBox"
            placeholder="USER NAME"
            onChange={(e) => setuserName(e.target.value)}
            value={userName}
            onKeyUp={handleInputEnter}
          />
          <button
            className="btn joinBtn"
            onClick={() => {
              joinRoom();
            }}
          >
            Join
          </button>
          <span className="createInfo">
            if you don't have an invite, then create &nbsp;
            <a href="/" className="createNewBtn" onClick={createNewRoom}>
              New Room
            </a>
          </span>
        </div>
      </div>
      <footer>
        <h4>Build with lots of love</h4>
      </footer>
    </div>
  );
};

export default Home;
