import React, { useState, useEffect, useRef } from "react";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import Actions from "../Actions.js";
import {
  useLocation,
  useParams,
  useNavigate,
  Navigate,
} from "react-router-dom";
import toast from "react-hot-toast";
// import { io } from "socket.io-client";

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));
      function handleErrors(e) {
        console.log("connect_error", e);
        toast.error("something is wrong with the socket connection");
        reactNavigator("/");
      }
      // listening for new connection;
      socketRef.current.emit(Actions.JOIN, {
        roomId,
        userName: location.state?.userName,
      });
      // listening for joined event;
      socketRef.current.on(
        Actions.JOINED,
        ({ clients, userName, socketId }) => {
          if (userName !== location.state?.userName) {
            toast.success(`${userName} joined the room`);
          }
          setClients(clients);
          socketRef.current.emit(Actions.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      // listening for disconnecting
      socketRef.current.on(Actions.DISCONNECTED, ({ socketId, userName }) => {
        toast.success(`${userName} left the room`);
        setClients((prev) => {
          return prev.filter((client) => {
            return client.socketId !== socketId;
          });
        });
      });
    };
    init();

    // used to unsuscribe the socket event and avoid memory leakage
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(Actions.JOINED);
      socketRef.current.off(Actions.DISCONNECTED);
    };
  }, []);

  const [clients, setClients] = useState([]);

  if (!location.state) {
    return <Navigate to="/" />;
  }
  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`Room Id copied to clipboard`);
    } catch (error) {
      toast.error(`${error.message}`);
    }
  }
  function leaveRoom() {
    reactNavigator("/");
  }
  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img
              src="https://github.com/codersgyan/realtime-code-editor/blob/main/public/code-sync.png?raw=true"
              alt="#editorLogo"
              className="logoImage"
            />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => {
              return (
                <Client userName={client.userName} key={client.socketId} />
              );
            })}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave ROOM
        </button>
      </div>
      <div className="editorWrap">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </div>
    </div>
  );
};

export default EditorPage;

// c9c3d44e-5ad4-4aab-b183-6972181896f6
