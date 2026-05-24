"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// const socket = io();
// const socket = io("https://video-chat-server-b3zd.onrender.com/");

const socket = io("https://video-chat-server-b3zd.onrender.com", {
  transports: ["websocket"],
});

// const socket = io("https://video-chat-server-rs7f.onrender.com", {
//   transports: ["websocket"],
// });

export default function Home() {
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const localStream = useRef<MediaStream | null>(null);

  const [partnerId, setPartnerId] = useState("");
  const [status, setStatus] = useState("Idle");
  const [isSearching, setIsSearching] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  useEffect(() => {
    startCamera();

    socket.on("online-count", (count) => {
      setOnlineCount(count);
    });

    socket.on("matched", async ({ partnerId, initiator }) => {
      setStatus("Matched");

      setIsSearching(false);
      setIsConnected(true);

      setPartnerId(partnerId);

      await createPeerConnection(partnerId);

      if (initiator) {
        const offer = await peerConnection.current!.createOffer();

        await peerConnection.current!.setLocalDescription(offer);

        socket.emit("offer", {
          to: partnerId,
          offer,
        });
      }
    });

    socket.on("offer", async ({ from, offer }) => {
      await createPeerConnection(from);

      await peerConnection.current!.setRemoteDescription(
        new RTCSessionDescription(offer),
      );

      const answer = await peerConnection.current!.createAnswer();

      await peerConnection.current!.setLocalDescription(answer);

      socket.emit("answer", {
        to: from,
        answer,
      });
    });

    socket.on("answer", async ({ answer }) => {
      await peerConnection.current!.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConnection.current?.addIceCandidate(candidate);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("partner-disconnected", () => {
      cleanupConnection();
      setStatus("Partner disconnected");

      setIsConnected(false);
      setIsSearching(false);
    });

    socket.on("requeue", () => {
      findStranger();
    });

    return () => {
      socket.off("online-count");
      socket.off("matched");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("partner-disconnected");
      socket.off("requeue");

      socket.disconnect();
    };
  }, []);

  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStream.current = stream;

    if (localVideo.current) {
      localVideo.current.srcObject = stream;
    }
  }

  async function createPeerConnection(partner: string) {
    cleanupConnection();

    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    peerConnection.current = pc;

    localStream.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStream.current!);
    });

    pc.ontrack = (event) => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: partner,
          candidate: event.candidate,
        });
      }
    };
  }

  function cleanupConnection() {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (remoteVideo.current) {
      remoteVideo.current.srcObject = null;
    }
  }

  function findStranger() {
    setStatus("Searching...");
    setIsSearching(true);
    socket.emit("find-stranger");
  }

  function nextStranger() {
    cleanupConnection();
    setStatus("Finding next stranger...");
    setIsConnected(false);
    setIsSearching(true);
    socket.emit("next-stranger");
  }

  function toggleMute() {
    if (!localStream.current) return;

    localStream.current.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsMuted((prev) => !prev);
  }

  function toggleCamera() {
    if (!localStream.current) return;

    localStream.current.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsCameraOff((prev) => !prev);
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Campus Video Chat
          </h1>

          <p className="mt-3 text-zinc-400 text-sm md:text-base">
            Meet random people around campus instantly
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />

          <p className="text-sm text-zinc-400">{onlineCount} online</p>
        </div>

        {/* Video Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Local Video */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <video
              ref={localVideo}
              autoPlay
              muted
              playsInline
              className="h-[260px] md:h-[500px] w-full object-cover"
            />

            <div className="absolute left-4 top-4 rounded-full bg-black/60 px-4 py-2 backdrop-blur-md">
              <p className="text-sm font-medium">You</p>
            </div>
          </div>

          {/* Remote Video */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <video
              ref={remoteVideo}
              autoPlay
              playsInline
              className="h-[260px] md:h-[500px] w-full object-cover"
            />

            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-16 w-16 animate-pulse rounded-full bg-zinc-800" />

                  <p className="text-zinc-400">
                    {isSearching
                      ? "Searching for stranger..."
                      : "No stranger connected"}
                  </p>
                </div>
              </div>
            )}

            <div className="absolute right-4 top-4 rounded-full bg-black/60 px-4 py-2 backdrop-blur-md">
              <p className="text-sm font-medium">
                {isConnected ? "Connected" : "Waiting"}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="mt-8 flex flex-col items-center justify-center gap-5">
          {/* Status */}
          <div className="rounded-full border border-zinc-800 bg-zinc-900/70 px-5 py-2 backdrop-blur-md">
            <p className="text-sm text-zinc-300">{status}</p>
          </div>

          {/* Buttons */}
          {/* <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={findStranger}
              disabled={isSearching || isConnected}
              className={`rounded-2xl px-8 py-4 text-sm font-semibold transition-all duration-200 ${
                isSearching || isConnected
                  ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                  : "bg-white text-black hover:scale-105 hover:bg-zinc-200 active:scale-95"
              }`}
            >
              Find Stranger
            </button>

            <button
              onClick={nextStranger}
              disabled={!isConnected}
              className={`rounded-2xl px-8 py-4 text-sm font-semibold transition-all duration-200 ${
                !isConnected
                  ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                  : "bg-red-500 text-white hover:scale-105 hover:bg-red-400 active:scale-95"
              }`}
            >
              Next Stranger
            </button>
          </div> */}

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={findStranger}
              disabled={isSearching || isConnected}
              className={`rounded-2xl px-8 py-4 text-sm font-semibold transition-all duration-200 ${
                isSearching || isConnected
                  ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                  : "bg-white text-black hover:scale-105 hover:bg-zinc-200 active:scale-95"
              }`}
            >
              Find Stranger
            </button>

            <button
              onClick={nextStranger}
              disabled={!isConnected}
              className={`rounded-2xl px-8 py-4 text-sm font-semibold transition-all duration-200 ${
                !isConnected
                  ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                  : "bg-red-500 text-white hover:scale-105 hover:bg-red-400 active:scale-95"
              }`}
            >
              Next Stranger
            </button>

            <button
              onClick={toggleMute}
              className={`rounded-2xl px-6 py-4 text-sm font-semibold transition-all duration-200 ${
                isMuted
                  ? "bg-yellow-500 text-black"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            >
              {isMuted ? "Unmute Mic" : "Mute Mic"}
            </button>

            <button
              onClick={toggleCamera}
              className={`rounded-2xl px-6 py-4 text-sm font-semibold transition-all duration-200 ${
                isCameraOff
                  ? "bg-yellow-500 text-black"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            >
              {isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
