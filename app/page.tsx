// "use client";

// import { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";
// import { useTheme } from "next-themes"; // Standard Shadcn theme hook
// import {
//   Video,
//   VideoOff,
//   Mic,
//   MicOff,
//   PhoneOff,
//   ArrowRight,
//   Search,
//   Circle,
//   User,
//   ShieldAlert,
//   Loader2,
//   Sun,
//   Moon,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";

// const socket = io("https://video-chat-server-b3zd.onrender.com");

// export default function Home() {
//   const { theme, setTheme } = useTheme();
//   const localVideo = useRef<HTMLVideoElement>(null);
//   const remoteVideo = useRef<HTMLVideoElement>(null);
//   const peerConnection = useRef<RTCPeerConnection | null>(null);
//   const localStream = useRef<MediaStream | null>(null);

//   const [partnerId, setPartnerId] = useState("");
//   const [status, setStatus] = useState("Idle");
//   const [isSearching, setIsSearching] = useState(false);
//   const [isConnected, setIsConnected] = useState(false);
//   const [onlineCount, setOnlineCount] = useState(0);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isCameraOff, setIsCameraOff] = useState(false);

//   useEffect(() => {
//     startCamera();

//     socket.on("online-count", (count) => {
//       setOnlineCount(count);
//     });

//     socket.on("matched", async ({ partnerId, initiator }) => {
//       setStatus("Matched with a stranger");
//       setIsSearching(false);
//       setIsConnected(true);
//       setPartnerId(partnerId);

//       await createPeerConnection(partnerId);

//       if (initiator) {
//         const offer = await peerConnection.current!.createOffer();
//         await peerConnection.current!.setLocalDescription(offer);
//         socket.emit("offer", { to: partnerId, offer });
//       }
//     });

//     socket.on("offer", async ({ from, offer }) => {
//       await createPeerConnection(from);
//       await peerConnection.current!.setRemoteDescription(
//         new RTCSessionDescription(offer),
//       );
//       const answer = await peerConnection.current!.createAnswer();
//       await peerConnection.current!.setLocalDescription(answer);
//       socket.emit("answer", { to: from, answer });
//     });

//     socket.on("answer", async ({ answer }) => {
//       await peerConnection.current!.setRemoteDescription(
//         new RTCSessionDescription(answer),
//       );
//     });

//     socket.on("ice-candidate", async ({ candidate }) => {
//       try {
//         await peerConnection.current?.addIceCandidate(candidate);
//       } catch (err) {
//         console.error(err);
//       }
//     });

//     socket.on("partner-disconnected", () => {
//       cleanupConnection();
//       setStatus("Stranger left the chat");
//       setIsConnected(false);
//       setIsSearching(false);
//     });

//     socket.on("requeue", () => {
//       findStranger();
//     });

//     return () => {
//       socket.off("online-count");
//       socket.off("matched");
//       socket.off("offer");
//       socket.off("answer");
//       socket.off("ice-candidate");
//       socket.off("partner-disconnected");
//       socket.off("requeue");
//       socket.disconnect();
//     };
//   }, []);

//   async function startCamera() {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });
//       localStream.current = stream;
//       if (localVideo.current) {
//         localVideo.current.srcObject = stream;
//       }
//     } catch (err) {
//       console.error("Error accessing media devices.", err);
//     }
//   }

//   async function createPeerConnection(partner: string) {
//     cleanupConnection();

//     const pc = new RTCPeerConnection({
//       iceServers: [
//         { urls: "stun:stun.relay.metered.ca:80" },
//         {
//           urls: "turn:global.relay.metered.ca:80",
//           username: "a5a42f645ba0512bed56761a",
//           credential: "o1LXCnRP7WhB0p2J",
//         },
//         {
//           urls: "turn:global.relay.metered.ca:80?transport=tcp",
//           username: "a5a42f645ba0512bed56761a",
//           credential: "o1LXCnRP7WhB0p2J",
//         },
//         {
//           urls: "turn:global.relay.metered.ca:443",
//           username: "a5a42f645ba0512bed56761a",
//           credential: "o1LXCnRP7WhB0p2J",
//         },
//         {
//           urls: "turns:global.relay.metered.ca:443?transport=tcp",
//           username: "a5a42f645ba0512bed56761a",
//           credential: "o1LXCnRP7WhB0p2J",
//         },
//       ],
//       iceTransportPolicy: "all",
//     });

//     pc.oniceconnectionstatechange = () => {
//       console.log("ICE STATE:", pc.iceConnectionState);
//     };

//     pc.onconnectionstatechange = () => {
//       console.log("CONNECTION STATE:", pc.connectionState);
//     };

//     peerConnection.current = pc;

//     localStream.current?.getTracks().forEach((track) => {
//       pc.addTrack(track, localStream.current!);
//     });

//     pc.ontrack = (event) => {
//       if (remoteVideo.current) {
//         remoteVideo.current.srcObject = event.streams[0];
//       }
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("ice-candidate", {
//           to: partner,
//           candidate: event.candidate,
//         });
//       }
//     };
//   }

//   function cleanupConnection() {
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }
//     if (remoteVideo.current) {
//       remoteVideo.current.srcObject = null;
//     }
//   }

//   function findStranger() {
//     setStatus("Searching for a partner...");
//     setIsSearching(true);
//     socket.emit("find-stranger");
//   }

//   function nextStranger() {
//     cleanupConnection();
//     setStatus("Finding next stranger...");
//     setIsConnected(false);
//     setIsSearching(true);
//     socket.emit("next-stranger");
//   }

//   function toggleMute() {
//     if (!localStream.current) return;
//     localStream.current.getAudioTracks().forEach((track) => {
//       track.enabled = !track.enabled;
//     });
//     setIsMuted((prev) => !prev);
//   }

//   function toggleCamera() {
//     if (!localStream.current) return;
//     localStream.current.getVideoTracks().forEach((track) => {
//       track.enabled = !track.enabled;
//     });
//     setIsCameraOff((prev) => !prev);
//   }

//   return (
//     <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/10">
//       {/* Header Bar */}
//       <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
//         <div className="flex items-center gap-3">
//           <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
//           <h1 className="text-lg font-bold tracking-tight">
//             CAMPUS
//             <span className="text-muted-foreground font-normal">CONNECT</span>
//           </h1>
//         </div>

//         {/* Dynamic Context Status Badges */}
//         <div className="flex items-center gap-3">
//           <Badge
//             variant="outline"
//             className="gap-1.5 font-normal py-1 px-2.5 rounded-full"
//           >
//             <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" />
//             <span>{onlineCount.toLocaleString()} online</span>
//           </Badge>

//           <div className="hidden xs:block">
//             {isSearching && (
//               <Badge variant="secondary" className="animate-pulse">
//                 Searching
//               </Badge>
//             )}
//             {isConnected && <Badge variant="default">Live Session</Badge>}
//           </div>
//         </div>
//       </header>

//       {/* Main Viewport Container */}
//       <main className="flex-1 w-full max-w-5xl mx-auto p-4 flex flex-col gap-4">
//         {/* Immersive Responsive Video Workspace */}
//         <div className="relative flex-1 w-full min-h-[480px] md:min-h-[620px] rounded-2xl bg-muted/40 overflow-hidden shadow-sm flex items-center justify-center transition-all">
//           {/* 1. Main Wide Stranger Feed */}
//           <video
//             ref={remoteVideo}
//             autoPlay
//             playsInline
//             className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
//               isConnected ? "opacity-100" : "opacity-0"
//             }`}
//           />

//           {/* Idle / Searching States Screen Cover */}
//           {!isConnected && (
//             <div className="flex flex-col items-center gap-4 text-center px-6 py-12 z-20 max-w-sm">
//               <div className="p-4 rounded-full bg-background border border-border text-muted-foreground shadow-sm">
//                 {isSearching ? (
//                   <Loader2 className="w-7 h-7 animate-spin text-primary" />
//                 ) : (
//                   <User className="w-7 h-7" />
//                 )}
//               </div>
//               <div className="space-y-1.5">
//                 <h3 className="font-semibold text-base">
//                   {isSearching ? "Matching Feed..." : "Meet Random Peers"}
//                 </h3>
//                 <p className="text-xs text-muted-foreground leading-relaxed">
//                   {isSearching
//                     ? "Scanning campus listings. Pairing you with another active student feed."
//                     : "Connect instantly to random verified users hanging out on campus right now."}
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Custom Overlay Anchors */}
//           <div className="absolute top-3 left-3 z-30">
//             <Badge
//               variant="secondary"
//               className="backdrop-blur-sm bg-background/80 text-[11px] font-medium tracking-wide border-border shadow-sm"
//             >
//               Stranger
//             </Badge>
//           </div>

//           <div className="absolute top-3 right-3 z-30 max-w-[200px] hidden sm:block">
//             <div className="bg-background/80 backdrop-blur-sm border border-border px-2.5 py-1 rounded-md text-[10px] font-mono text-muted-foreground truncate shadow-sm">
//               {status}
//             </div>
//           </div>

//           {/* 2. Compact Floating Local Feed */}
//           <div
//             className="
//             absolute bottom-4 right-4
//             w-28 h-40 xs:w-36 xs:h-52 md:w-44 md:h-60
//             rounded-xl overflow-hidden
//             bg-background
//             shadow-xl transition-all duration-300 z-40 flex items-center justify-center
//           "
//           >
//             <video
//               ref={localVideo}
//               autoPlay
//               muted
//               playsInline
//               className="h-full w-full object-cover scale-x-[-1]"
//             />

//             {isCameraOff && (
//               <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center gap-1.5 text-muted-foreground z-40">
//                 <VideoOff className="w-4 h-4" />
//                 <p className="text-[9px] font-medium tracking-wider uppercase">
//                   Cam Off
//                 </p>
//               </div>
//             )}

//             <div className="absolute bottom-2 left-2 z-40 bg-background/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-medium tracking-wide border border-border shadow-sm">
//               You{" "}
//               {isMuted && (
//                 <span className="text-destructive ml-0.5">• Muted</span>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Control Actions Tray */}
//       <footer className="border-t border-border bg-background sticky bottom-0 z-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
//         {/* Hardware Toggles & Light/Dark Mode Switcher */}
//         <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
//           <Button
//             variant={isMuted ? "destructive" : "outline"}
//             size="icon"
//             onClick={toggleMute}
//             className="h-10 w-10 rounded-xl"
//             title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
//           >
//             {isMuted ? (
//               <MicOff className="w-4 h-4" />
//             ) : (
//               <Mic className="w-4 h-4" />
//             )}
//           </Button>

//           <Button
//             variant={isCameraOff ? "destructive" : "outline"}
//             size="icon"
//             onClick={toggleCamera}
//             className="h-10 w-10 rounded-xl"
//             title={isCameraOff ? "Enable Video Camera" : "Disable Video Camera"}
//           >
//             {isCameraOff ? (
//               <VideoOff className="w-4 h-4" />
//             ) : (
//               <Video className="w-4 h-4" />
//             )}
//           </Button>

//           {/* Theme Switcher Button */}
//           <Button
//             variant="outline"
//             size="icon"
//             onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//             className="h-10 w-10 rounded-xl border-dashed"
//             title="Toggle Light/Dark Mode"
//           >
//             <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
//             <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
//             <span className="sr-only">Toggle theme</span>
//           </Button>
//         </div>

//         {/* Engine Match Actions */}
//         <div className="flex items-center gap-2.5 w-full sm:w-auto">
//           {isConnected ? (
//             <>
//               <Button
//                 variant="outline"
//                 onClick={nextStranger}
//                 className="flex-1 sm:flex-none h-10 rounded-xl px-5 text-xs font-medium gap-1.5"
//               >
//                 <PhoneOff className="w-3.5 h-3.5" />
//                 Skip
//               </Button>
//               <Button
//                 variant="default"
//                 onClick={nextStranger}
//                 className="flex-1 sm:flex-none h-10 rounded-xl px-5 text-xs font-medium gap-1.5 shadow-sm"
//               >
//                 Next Stranger
//                 <ArrowRight className="w-3.5 h-3.5" />
//               </Button>
//             </>
//           ) : (
//             <Button
//               variant="default"
//               onClick={findStranger}
//               disabled={isSearching}
//               className="w-full sm:w-auto h-10 rounded-xl px-8 text-xs font-medium gap-1.5 shadow-sm"
//             >
//               {isSearching ? (
//                 <>
//                   <Search className="w-3.5 h-3.5 animate-spin" />
//                   Finding Someone...
//                 </>
//               ) : (
//                 <>
//                   <Search className="w-3.5 h-3.5" />
//                   Find Stranger
//                 </>
//               )}
//             </Button>
//           )}
//         </div>

//         {/* Guidelines Anchor */}
//         <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-muted-foreground select-none">
//           <ShieldAlert className="w-3.5 h-3.5" />
//           <span>Please abide by local community terms.</span>
//         </div>
//       </footer>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useTheme } from "next-themes";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  ArrowRight,
  Search,
  Circle,
  User,
  Loader2,
  Flashlight,
  FlashlightOff,
  Menu,
  PhoneOff,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const socket = io("https://video-chat-server-b3zd.onrender.com");

const glass =
  "bg-white/25 dark:bg-black/35 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-2xl";

type DockButtonProps = {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
};

function DockButton({ onClick, title, active, children }: DockButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`h-11 w-11 rounded-full transition-colors ${
        active
          ? "bg-destructive text-white hover:bg-destructive/90 hover:text-white"
          : "hover:bg-white/30 dark:hover:bg-white/15"
      }`}
    >
      {children}
    </Button>
  );
}

const DEFAULT_PARTNER_MEDIA = { muted: false, cameraOff: false };

export default function Home() {
  const { resolvedTheme, setTheme } = useTheme();
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);

  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [isSearching, setIsSearching] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [dockOpen, setDockOpen] = useState(false); // mobile only
  const [partnerMedia, setPartnerMedia] = useState(DEFAULT_PARTNER_MEDIA);

  const isDark = mounted && resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
    startCamera();

    socket.on("online-count", (count) => setOnlineCount(count));

    socket.on("matched", async ({ partnerId, initiator }) => {
      setStatus("Connected");
      setIsSearching(false);
      setIsConnected(true);

      await createPeerConnection(partnerId);

      if (initiator) {
        // The initiator opens the channel used to share mic/camera state
        setupDataChannel(peerConnection.current!.createDataChannel("state"));

        const offer = await peerConnection.current!.createOffer();
        await peerConnection.current!.setLocalDescription(offer);
        socket.emit("offer", { to: partnerId, offer });
      }
    });

    socket.on("offer", async ({ from, offer }) => {
      await createPeerConnection(from);
      await peerConnection.current!.setRemoteDescription(
        new RTCSessionDescription(offer),
      );
      const answer = await peerConnection.current!.createAnswer();
      await peerConnection.current!.setLocalDescription(answer);
      socket.emit("answer", { to: from, answer });
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
      setStatus("Stranger left");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 24, max: 30 },
        },
        audio: true,
      });
      localStream.current = stream;
      if (localVideo.current) {
        localVideo.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  }

  // Sends our current mic/camera state to the other person
  function sendMediaState() {
    const channel = dataChannel.current;
    if (!channel || channel.readyState !== "open") return;

    const stream = localStream.current;
    const audioTrack = stream?.getAudioTracks()[0];
    const videoTrack = stream?.getVideoTracks()[0];

    channel.send(
      JSON.stringify({
        muted: audioTrack ? !audioTrack.enabled : false,
        cameraOff: videoTrack ? !videoTrack.enabled : false,
      }),
    );
  }

  function setupDataChannel(channel: RTCDataChannel) {
    dataChannel.current = channel;

    // Share our state as soon as the channel is ready (covers users who
    // were already muted / camera-off before the match)
    channel.onopen = () => sendMediaState();

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setPartnerMedia({
          muted: !!data.muted,
          cameraOff: !!data.cameraOff,
        });
      } catch (err) {
        console.error(err);
      }
    };
  }

  async function createPeerConnection(partner: string) {
    cleanupConnection();

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.relay.metered.ca:80" },
        {
          urls: "turn:global.relay.metered.ca:80",
          username: "a5a42f645ba0512bed56761a",
          credential: "o1LXCnRP7WhB0p2J",
        },
        {
          urls: "turn:global.relay.metered.ca:80?transport=tcp",
          username: "a5a42f645ba0512bed56761a",
          credential: "o1LXCnRP7WhB0p2J",
        },
        {
          urls: "turn:global.relay.metered.ca:443",
          username: "a5a42f645ba0512bed56761a",
          credential: "o1LXCnRP7WhB0p2J",
        },
        {
          urls: "turns:global.relay.metered.ca:443?transport=tcp",
          username: "a5a42f645ba0512bed56761a",
          credential: "o1LXCnRP7WhB0p2J",
        },
      ],
      iceTransportPolicy: "all",
    });

    pc.oniceconnectionstatechange = () => {
      console.log("ICE STATE:", pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
      console.log("CONNECTION STATE:", pc.connectionState);
    };

    peerConnection.current = pc;

    // The non-initiator receives the channel here
    pc.ondatachannel = (event) => setupDataChannel(event.channel);

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
    if (dataChannel.current) {
      dataChannel.current.close();
      dataChannel.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (remoteVideo.current) {
      remoteVideo.current.srcObject = null;
    }
    setPartnerMedia(DEFAULT_PARTNER_MEDIA);
  }

  function findStranger() {
    setStatus("Searching");
    setIsSearching(true);
    socket.emit("find-stranger");
  }

  function nextStranger() {
    cleanupConnection();
    setStatus("Searching");
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
    sendMediaState();
  }

  function toggleCamera() {
    if (!localStream.current) return;
    localStream.current.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsCameraOff((prev) => !prev);
    sendMediaState();
  }

  function handlePrimary() {
    if (isConnected) nextStranger();
    else if (!isSearching) findStranger();
  }

  function endCall() {
    window.location.reload();
  }

  const dock = (
    <div
      className={`${glass} items-center gap-1.5 rounded-full p-2 animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-200 ${
        dockOpen ? "flex" : "hidden md:flex"
      }`}
    >
      <DockButton
        onClick={toggleMute}
        active={isMuted}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </DockButton>

      <DockButton
        onClick={toggleCamera}
        active={isCameraOff}
        title={isCameraOff ? "Camera on" : "Camera off"}
      >
        {isCameraOff ? (
          <VideoOff className="h-5 w-5" />
        ) : (
          <Video className="h-5 w-5" />
        )}
      </DockButton>
      {isConnected && (
        <DockButton onClick={endCall} active title="End call">
          <PhoneOff className="h-5 w-5" />
        </DockButton>
      )}

      <div className="mx-1 h-6 w-px bg-white/30 dark:bg-white/15" />

      <Button
        onClick={handlePrimary}
        disabled={isSearching}
        className="h-11 gap-2 rounded-full px-5 text-sm font-medium shadow-md"
      >
        {isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isConnected ? (
          <>
            Next
            <ArrowRight className="h-4 w-4" />
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            Start
          </>
        )}
      </Button>

      {/* Close – mobile only */}
      <div className="md:hidden">
        <DockButton onClick={() => setDockOpen(false)} title="Close controls">
          <X className="h-5 w-5" />
        </DockButton>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 h-dvh w-screen overflow-hidden bg-background text-foreground antialiased">
      {/* Stranger feed (fills the screen) */}
      <video
        ref={remoteVideo}
        autoPlay
        playsInline
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          isConnected ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Stranger turned their camera off */}
      {isConnected && partnerMedia.cameraOff && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-muted animate-in fade-in duration-300">
          <div className="rounded-full border border-border bg-background/70 p-5 shadow-sm">
            <VideoOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Camera off</p>
        </div>
      )}

      {/* Idle / searching state */}
      {!isConnected && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-muted/40 via-background to-muted/60">
          <div className="rounded-full border border-border bg-background/70 p-5 shadow-sm backdrop-blur">
            {isSearching ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isSearching
              ? "Finding someone…"
              : status === "Stranger left"
                ? "They left"
                : "Ready when you are"}
          </p>
        </div>
      )}

      {/* Top-left: online count + stranger muted indicator */}
      <div className="absolute left-4 top-4 z-30 flex flex-col items-start gap-2">
        <div
          className={`${glass} flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium`}
        >
          <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
          {onlineCount.toLocaleString()} online
        </div>

        {isConnected && partnerMedia.muted && (
          <div
            className={`${glass} flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium animate-in fade-in zoom-in-95 duration-200`}
          >
            <MicOff className="h-3.5 w-3.5 text-destructive" />
            Muted
          </div>
        )}
      </div>

      {/* Top-right: your camera */}
      <div className="absolute right-4 top-4 z-30 h-36 w-24 overflow-hidden rounded-2xl bg-muted shadow-xl ring-1 ring-white/30 transition-all md:h-56 md:w-40">
        <video
          ref={localVideo}
          autoPlay
          muted
          playsInline
          className="h-full w-full scale-x-[-1] object-cover"
        />
        {isCameraOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
            <VideoOff className="h-5 w-5" />
          </div>
        )}
        {isMuted && (
          <div className="absolute bottom-2 left-2 rounded-full bg-destructive p-1 text-white">
            <MicOff className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-6 z-40 flex justify-center">
        {dock}

        {/* Mobile launcher */}
        {!dockOpen && (
          <button
            onClick={() => setDockOpen(true)}
            aria-label="Open controls"
            className={`${glass} flex h-14 w-14 items-center justify-center rounded-full transition-transform active:scale-95 animate-in fade-in zoom-in-90 md:hidden`}
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
}
