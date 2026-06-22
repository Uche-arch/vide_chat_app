// // "use client";

// // import { useEffect, useRef, useState } from "react";
// // import { io } from "socket.io-client";
// // import { 
// //   Video, 
// //   VideoOff, 
// //   Mic, 
// //   MicOff, 
// //   PhoneOff, 
// //   ArrowRight, 
// //   Search, 
// //   Circle, 
// //   User, 
// //   ShieldAlert,
// //   Sparkles,
// //   Loader2
// // } from "lucide-react";

// // const socket = io("https://video-chat-server-b3zd.onrender.com");

// // export default function Home() {
// //   const localVideo = useRef<HTMLVideoElement>(null);
// //   const remoteVideo = useRef<HTMLVideoElement>(null);
// //   const peerConnection = useRef<RTCPeerConnection | null>(null);
// //   const localStream = useRef<MediaStream | null>(null);

// //   const [partnerId, setPartnerId] = useState("");
// //   const [status, setStatus] = useState("Idle");
// //   const [isSearching, setIsSearching] = useState(false);
// //   const [isConnected, setIsConnected] = useState(false);
// //   const [onlineCount, setOnlineCount] = useState(0);
// //   const [isMuted, setIsMuted] = useState(false);
// //   const [isCameraOff, setIsCameraOff] = useState(false);

// //   useEffect(() => {
// //     startCamera();

// //     socket.on("online-count", (count) => {
// //       setOnlineCount(count);
// //     });

// //     socket.on("matched", async ({ partnerId, initiator }) => {
// //       setStatus("Matched with a stranger");
// //       setIsSearching(false);
// //       setIsConnected(true);
// //       setPartnerId(partnerId);

// //       await createPeerConnection(partnerId);

// //       if (initiator) {
// //         const offer = await peerConnection.current!.createOffer();
// //         await peerConnection.current!.setLocalDescription(offer);
// //         socket.emit("offer", { to: partnerId, offer });
// //       }
// //     });

// //     socket.on("offer", async ({ from, offer }) => {
// //       await createPeerConnection(from);
// //       await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(offer));
// //       const answer = await peerConnection.current!.createAnswer();
// //       await peerConnection.current!.setLocalDescription(answer);
// //       socket.emit("answer", { to: from, answer });
// //     });

// //     socket.on("answer", async ({ answer }) => {
// //       await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(answer));
// //     });

// //     socket.on("ice-candidate", async ({ candidate }) => {
// //       try {
// //         await peerConnection.current?.addIceCandidate(candidate);
// //       } catch (err) {
// //         console.error(err);
// //       }
// //     });

// //     socket.on("partner-disconnected", () => {
// //       cleanupConnection();
// //       setStatus("Stranger left the chat");
// //       setIsConnected(false);
// //       setIsSearching(false);
// //     });

// //     socket.on("requeue", () => {
// //       findStranger();
// //     });

// //     return () => {
// //       socket.off("online-count");
// //       socket.off("matched");
// //       socket.off("offer");
// //       socket.off("answer");
// //       socket.off("ice-candidate");
// //       socket.off("partner-disconnected");
// //       socket.off("requeue");
// //       socket.disconnect();
// //     };
// //   }, []);

// //   async function startCamera() {
// //     try {
// //       const stream = await navigator.mediaDevices.getUserMedia({
// //         video: true,
// //         audio: true,
// //       });
// //       localStream.current = stream;
// //       if (localVideo.current) {
// //         localVideo.current.srcObject = stream;
// //       }
// //     } catch (err) {
// //       console.error("Error accessing media devices.", err);
// //     }
// //   }

// //   async function createPeerConnection(partner: string) {
// //     cleanupConnection();

// //     const pc = new RTCPeerConnection({
// //       iceServers: [
// //         { urls: "stun:stun.relay.metered.ca:80" },
// //         { urls: "turn:global.relay.metered.ca:80", username: "a5a42f645ba0512bed56761a", credential: "o1LXCnRP7WhB0p2J" },
// //         { urls: "turn:global.relay.metered.ca:80?transport=tcp", username: "a5a42f645ba0512bed56761a", credential: "o1LXCnRP7WhB0p2J" },
// //         { urls: "turn:global.relay.metered.ca:443", username: "a5a42f645ba0512bed56761a", credential: "o1LXCnRP7WhB0p2J" },
// //         { urls: "turns:global.relay.metered.ca:443?transport=tcp", username: "a5a42f645ba0512bed56761a", credential: "o1LXCnRP7WhB0p2J" },
// //       ],
// //       iceTransportPolicy: "all",
// //     });

// //     peerConnection.current = pc;

// //     localStream.current?.getTracks().forEach((track) => {
// //       pc.addTrack(track, localStream.current!);
// //     });

// //     pc.ontrack = (event) => {
// //       if (remoteVideo.current) {
// //         remoteVideo.current.srcObject = event.streams[0];
// //       }
// //     };

// //     pc.onicecandidate = (event) => {
// //       if (event.candidate) {
// //         socket.emit("ice-candidate", {
// //           to: partner,
// //           candidate: event.candidate,
// //         });
// //       }
// //     };
// //   }

// //   function cleanupConnection() {
// //     if (peerConnection.current) {
// //       peerConnection.current.close();
// //       peerConnection.current = null;
// //     }
// //     if (remoteVideo.current) {
// //       remoteVideo.current.srcObject = null;
// //     }
// //   }

// //   function findStranger() {
// //     setStatus("Searching for a partner...");
// //     setIsSearching(true);
// //     socket.emit("find-stranger");
// //   }

// //   function nextStranger() {
// //     cleanupConnection();
// //     setStatus("Finding next stranger...");
// //     setIsConnected(false);
// //     setIsSearching(true);
// //     socket.emit("next-stranger");
// //   }

// //   function toggleMute() {
// //     if (!localStream.current) return;
// //     localStream.current.getAudioTracks().forEach((track) => {
// //       track.enabled = !track.enabled;
// //     });
// //     setIsMuted((prev) => !prev);
// //   }

// //   function toggleCamera() {
// //     if (!localStream.current) return;
// //     localStream.current.getVideoTracks().forEach((track) => {
// //       track.enabled = !track.enabled;
// //     });
// //     setIsCameraOff((prev) => !prev);
// //   }

// //   return (
// //     <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100 font-sans overflow-hidden antialiased">
      
// //       {/* Top Navigation / Header */}
// //       <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md z-10">
// //         <div className="flex items-center gap-3">
// //           <div className="h-3 w-3 rounded-full bg-indigo-500 animate-pulse" />
// //           <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-neutral-100 to-neutral-400 bg-clip-text text-transparent">
// //             CAMPUS<span className="text-indigo-500">LOOP</span>
// //           </h1>
// //         </div>

// //         {/* Status Badges */}
// //         <div className="flex items-center gap-4 sm:gap-6">
// //           <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800">
// //             <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
// //             <span>{onlineCount.toLocaleString()} peers online</span>
// //           </div>
          
// //           <div>
// //             {!isConnected && !isSearching && (
// //               <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800">Idle</span>
// //             )}
// //             {isSearching && (
// //               <span className="text-xs font-medium uppercase tracking-wider text-amber-400 bg-amber-950/30 border border-amber-900/50 px-2.5 py-1 rounded animate-pulse">Searching...</span>
// //             )}
// //             {isConnected && (
// //               <span className="text-xs font-medium uppercase tracking-wider text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 px-2.5 py-1 rounded">Live Session</span>
// //             )}
// //           </div>
// //         </div>
// //       </header>

// //       {/* Main Viewport Grid */}
// //       <main className="flex-1 relative p-4 max-w-7xl w-full mx-auto flex flex-col md:block">
        
// //         {/* 1. Immersive Stranger View */}
// //         <div className="w-full h-full rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center relative shadow-2xl transition-all duration-300">
// //           <video
// //             ref={remoteVideo}
// //             autoPlay
// //             playsInline
// //             className={`absolute inset-0 h-full w-full object-cover bg-neutral-900 ${
// //               isConnected ? "opacity-100" : "opacity-0"
// //             }`}
// //           />

// //           {/* Fallback States (Idle / Searching) */}
// //           {!isConnected && (
// //             <div className="flex flex-col items-center gap-3 text-center px-4 z-20">
// //               <div className="p-4 rounded-full bg-neutral-950/50 border border-neutral-800 text-neutral-500">
// //                 {isSearching ? (
// //                   <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
// //                 ) : (
// //                   <User className="w-8 h-8" />
// //                 )}
// //               </div>
// //               <h3 className="text-neutral-200 font-semibold text-lg">
// //                 {isSearching ? "Searching the Grid..." : "Ready to Connect?"}
// //               </h3>
// //               <p className="text-neutral-400 text-sm max-w-xs leading-relaxed">
// //                 {isSearching 
// //                   ? "Hang tight, matching you with another active user on campus right now." 
// //                   : "Click find stranger below to establish an instant connection."}
// //               </p>
// //             </div>
// //           )}
          
// //           <div className="absolute top-4 left-4 z-20 bg-neutral-950/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-neutral-800 text-xs font-medium tracking-wide">
// //             Stranger
// //           </div>
          
// //           {/* Subtle Session Monitor Badge Inside Video */}
// //           <div className="absolute top-4 right-4 z-20 hidden md:block max-w-xs bg-neutral-950/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-neutral-800/60 text-[11px] font-mono text-neutral-400">
// //             {status}
// //           </div>
// //         </div>

// //         {/* 2. Floating Local Preview Corner (You) */}
// //         <div className="
// //           mt-4 md:mt-0 
// //           w-full md:w-64 md:h-44 
// //           aspect-video md:aspect-auto 
// //           md:absolute md:bottom-8 md:right-8 
// //           rounded-xl overflow-hidden 
// //           bg-neutral-950 border-2 border-neutral-800 
// //           shadow-2xl transition-all duration-300 z-30 flex items-center justify-center
// //         ">
// //           <video
// //             ref={localVideo}
// //             autoPlay
// //             muted
// //             playsInline
// //             className="h-full w-full object-cover scale-x-[-1]"
// //           />
          
// //           {isCameraOff && (
// //             <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center gap-1.5 text-neutral-500 z-40">
// //               <VideoOff className="w-5 h-5" />
// //               <p className="text-[10px] font-medium uppercase tracking-wider">Camera Off</p>
// //             </div>
// //           )}
          
// //           <div className="absolute bottom-3 left-3 z-40 bg-neutral-950/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium tracking-wide border border-neutral-800">
// //             You {isMuted && <span className="text-rose-400 ml-1">• Muted</span>}
// //           </div>
// //         </div>

// //       </main>

// //       {/* Control Navigation Footer */}
// //       <footer className="border-t border-neutral-900 bg-neutral-950 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
        
// //         {/* Media Controls */}
// //         <div className="flex items-center gap-3">
// //           <button 
// //             onClick={toggleMute}
// //             className={`p-3 rounded-xl border transition-all duration-200 ${
// //               isMuted 
// //                 ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' 
// //                 : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
// //             }`}
// //             title={isMuted ? "Unmute Mic" : "Mute Mic"}
// //           >
// //             {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
// //           </button>

// //           <button 
// //             onClick={toggleCamera}
// //             className={`p-3 rounded-xl border transition-all duration-200 ${
// //               isCameraOff 
// //                 ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' 
// //                 : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
// //             }`}
// //             title={isCameraOff ? "Turn Cam On" : "Turn Cam Off"}
// //           >
// //             {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
// //           </button>
// //         </div>

// //         {/* Primary Call To Actions */}
// //         <div className="flex items-center gap-3 w-full sm:w-auto">
// //           {isConnected ? (
// //             <>
// //               <button 
// //                 onClick={nextStranger}
// //                 className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 font-medium text-sm transition-all duration-200 w-full sm:w-auto"
// //               >
// //                 <PhoneOff className="w-4 h-4" />
// //                 Skip
// //               </button>
// //               <button 
// //                 onClick={nextStranger}
// //                 className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/20 transition-all duration-200 w-full sm:w-auto"
// //               >
// //                 Next Stranger
// //                 <ArrowRight className="w-4 h-4" />
// //               </button>
// //             </>
// //           ) : (
// //             <button 
// //               onClick={findStranger}
// //               disabled={isSearching}
// //               className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-900 disabled:text-neutral-600 disabled:border-neutral-800 text-white font-medium text-sm shadow-lg shadow-indigo-600/20 transition-all duration-200 w-full sm:w-auto"
// //             >
// //               {isSearching ? (
// //                 <>
// //                   <Search className="w-4 h-4 animate-spin" />
// //                   Finding Someone...
// //                 </>
// //               ) : (
// //                 <>
// //                   <Search className="w-4 h-4" />
// //                   Find Stranger
// //                 </>
// //               )}
// //             </button>
// //           )}
// //         </div>

// //         {/* Policy / Notice */}
// //         <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-600">
// //           <ShieldAlert className="w-3.5 h-3.5" />
// //           <span>Keep campus interactions safe and respectful.</span>
// //         </div>
// //       </footer>
// //     </div>
// //   );
// // }


// "use client";

// import { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";
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
//   Loader2
// } from "lucide-react";

// // Note: If your alias differs, update paths to match your shadcn installation components folder
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";

// const socket = io("https://video-chat-server-b3zd.onrender.com");

// export default function Home() {
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
//       await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await peerConnection.current!.createAnswer();
//       await peerConnection.current!.setLocalDescription(answer);
//       socket.emit("answer", { to: from, answer });
//     });

//     socket.on("answer", async ({ answer }) => {
//       await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(answer));
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
//         { urls: "turn:global.relay.metered.ca:80", username: "a5a42f645ba0512bed56761a", credential: "o1LXCnRP7WhB0p2J" },
//         { urls: "turn:global.relay.metered.ca:80?transport=tcp", username: "a5a42f645ba0512bed56761a", credential: "o1LXCnRP7WhB0p2J" },
//         { urls: "turn:global.relay.metered.ca:443", username: "a5a42f645ba0512bed56761a", credential: "o1LXCnRP7WhB0p2J" },
//         { urls: "turns:global.relay.metered.ca:443?transport=tcp", username: "a5a42f645ba0512bed56761a", credential: "o1LXCnRP7WhB0p2J" },
//       ],
//       iceTransportPolicy: "all",
//     });

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
//             CAMPUS<span className="text-muted-foreground font-normal">LOOP</span>
//           </h1>
//         </div>

//         {/* Dynamic Context Status Badges */}
//         <div className="flex items-center gap-3">
//           <Badge variant="outline" className="gap-1.5 font-normal py-1 px-2.5 rounded-full">
//             <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" />
//             <span>{onlineCount.toLocaleString()} online</span>
//           </Badge>
          
//           <div className="hidden xs:block">
//             {isSearching && (
//               <Badge variant="secondary" className="animate-pulse">Searching</Badge>
//             )}
//             {isConnected && (
//               <Badge variant="default">Live Session</Badge>
//             )}
//           </div>
//         </div>
//       </header>

//       {/* Main Viewport Container */}
//       <main className="flex-1 w-full max-w-5xl mx-auto p-4 flex flex-col gap-4">
        
//         {/* Immersive Responsive Video Workspace (WhatsApp/Facetime Style) */}
//         <div className="relative flex-1 w-full min-h-[480px] md:min-h-[620px] rounded-2xl bg-muted/40 border border-border overflow-hidden shadow-sm flex items-center justify-center transition-all">
          
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
//             <Badge variant="secondary" className="backdrop-blur-sm bg-background/80 text-[11px] font-medium tracking-wide border-border shadow-sm">
//               Stranger
//             </Badge>
//           </div>
          
//           <div className="absolute top-3 right-3 z-30 max-w-[200px] hidden sm:block">
//             <div className="bg-background/80 backdrop-blur-sm border border-border px-2.5 py-1 rounded-md text-[10px] font-mono text-muted-foreground truncate shadow-sm">
//               {status}
//             </div>
//           </div>

//           {/* 2. Compact Floating Local Feed (Floating PIP Window) */}
//           <div className="
//             absolute bottom-4 right-4 
//             w-28 h-40 xs:w-36 xs:h-52 md:w-44 md:h-60 
//             rounded-xl overflow-hidden 
//             bg-background border border-border 
//             shadow-xl transition-all duration-300 z-40 flex items-center justify-center
//           ">
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
//                 <p className="text-[9px] font-medium tracking-wider uppercase">Cam Off</p>
//               </div>
//             )}
            
//             <div className="absolute bottom-2 left-2 z-40 bg-background/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-medium tracking-wide border border-border shadow-sm">
//               You {isMuted && <span className="text-destructive ml-0.5">• Muted</span>}
//             </div>
//           </div>

//         </div>
//       </main>

//       {/* Control Actions Tray */}
//       <footer className="border-t border-border bg-background sticky bottom-0 z-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
//         {/* Minimal Mechanical Toggles */}
//         <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
//           <Button 
//             variant={isMuted ? "destructive" : "outline"}
//             size="icon"
//             onClick={toggleMute}
//             className="h-10 w-10 rounded-xl"
//             title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
//           >
//             {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
//           </Button>

//           <Button 
//             variant={isCameraOff ? "destructive" : "outline"}
//             size="icon"
//             onClick={toggleCamera}
//             className="h-10 w-10 rounded-xl"
//             title={isCameraOff ? "Enable Video Camera" : "Disable Video Camera"}
//           >
//             {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
//           </Button>
//         </div>

//         {/* Engine Match Actions using standard variants */}
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
import { useTheme } from "next-themes"; // Standard Shadcn theme hook
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  ArrowRight, 
  Search, 
  Circle, 
  User, 
  ShieldAlert,
  Loader2,
  Sun,
  Moon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const socket = io("https://video-chat-server-b3zd.onrender.com");

export default function Home() {
  const { theme, setTheme } = useTheme();
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
      setStatus("Matched with a stranger");
      setIsSearching(false);
      setIsConnected(true);
      setPartnerId(partnerId);

      await createPeerConnection(partnerId);

      if (initiator) {
        const offer = await peerConnection.current!.createOffer();
        await peerConnection.current!.setLocalDescription(offer);
        socket.emit("offer", { to: partnerId, offer });
      }
    });

    socket.on("offer", async ({ from, offer }) => {
      await createPeerConnection(from);
      await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current!.createAnswer();
      await peerConnection.current!.setLocalDescription(answer);
      socket.emit("answer", { to: from, answer });
    });

    socket.on("answer", async ({ answer }) => {
      await peerConnection.current!.setRemoteDescription(new RTCSessionDescription(answer));
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
      setStatus("Stranger left the chat");
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
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

  async function createPeerConnection(partner: string) {
    cleanupConnection();

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.relay.metered.ca:80" },
        { urls: "turn:global.relay.metered.ca:80", username: "a5a42f645ba0512bed56761a", credential: "o1LXCnRP7WhB0p2J" },
        { urls: "turn:global.relay.metered.ca:80?transport=tcp", username: "a5a42f645ba0512bed56761a", credential: "o1LXCnRP7WhB0p2J" },
        { urls: "turn:global.relay.metered.ca:443", username: "a5a42f645ba0512bed56761a", credential: "o1LXCnRP7WhB0p2J" },
        { urls: "turns:global.relay.metered.ca:443?transport=tcp", username: "a5a42f645ba0512bed56761a", credential: "o1LXCnRP7WhB0p2J" },
      ],
      iceTransportPolicy: "all",
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
    setStatus("Searching for a partner...");
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
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/10">
      
      {/* Header Bar */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          <h1 className="text-lg font-bold tracking-tight">
            CAMPUS<span className="text-muted-foreground font-normal">CONNECT</span>
          </h1>
        </div>

        {/* Dynamic Context Status Badges */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5 font-normal py-1 px-2.5 rounded-full">
            <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" />
            <span>{onlineCount.toLocaleString()} online</span>
          </Badge>
          
          <div className="hidden xs:block">
            {isSearching && (
              <Badge variant="secondary" className="animate-pulse">Searching</Badge>
            )}
            {isConnected && (
              <Badge variant="default">Live Session</Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 flex flex-col gap-4">
        
        {/* Immersive Responsive Video Workspace */}
        <div className="relative flex-1 w-full min-h-[480px] md:min-h-[620px] rounded-2xl bg-muted/40 overflow-hidden shadow-sm flex items-center justify-center transition-all">
          
          {/* 1. Main Wide Stranger Feed */}
          <video
            ref={remoteVideo}
            autoPlay
            playsInline
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              isConnected ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Idle / Searching States Screen Cover */}
          {!isConnected && (
            <div className="flex flex-col items-center gap-4 text-center px-6 py-12 z-20 max-w-sm">
              <div className="p-4 rounded-full bg-background border border-border text-muted-foreground shadow-sm">
                {isSearching ? (
                  <Loader2 className="w-7 h-7 animate-spin text-primary" />
                ) : (
                  <User className="w-7 h-7" />
                )}
              </div>
              <div className="space-y-1.5">
                <h3 className="font-semibold text-base">
                  {isSearching ? "Matching Feed..." : "Meet Random Peers"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isSearching 
                    ? "Scanning campus listings. Pairing you with another active student feed." 
                    : "Connect instantly to random verified users hanging out on campus right now."}
                </p>
              </div>
            </div>
          )}
          
          {/* Custom Overlay Anchors */}
          <div className="absolute top-3 left-3 z-30">
            <Badge variant="secondary" className="backdrop-blur-sm bg-background/80 text-[11px] font-medium tracking-wide border-border shadow-sm">
              Stranger
            </Badge>
          </div>
          
          <div className="absolute top-3 right-3 z-30 max-w-[200px] hidden sm:block">
            <div className="bg-background/80 backdrop-blur-sm border border-border px-2.5 py-1 rounded-md text-[10px] font-mono text-muted-foreground truncate shadow-sm">
              {status}
            </div>
          </div>

          {/* 2. Compact Floating Local Feed */}
          <div className="
            absolute bottom-4 right-4 
            w-28 h-40 xs:w-36 xs:h-52 md:w-44 md:h-60 
            rounded-xl overflow-hidden 
            bg-background 
            shadow-xl transition-all duration-300 z-40 flex items-center justify-center
          ">
            <video
              ref={localVideo}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover scale-x-[-1]"
            />
            
            {isCameraOff && (
              <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center gap-1.5 text-muted-foreground z-40">
                <VideoOff className="w-4 h-4" />
                <p className="text-[9px] font-medium tracking-wider uppercase">Cam Off</p>
              </div>
            )}
            
            <div className="absolute bottom-2 left-2 z-40 bg-background/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-medium tracking-wide border border-border shadow-sm">
              You {isMuted && <span className="text-destructive ml-0.5">• Muted</span>}
            </div>
          </div>

        </div>
      </main>

      {/* Control Actions Tray */}
      <footer className="border-t border-border bg-background sticky bottom-0 z-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Hardware Toggles & Light/Dark Mode Switcher */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
          <Button 
            variant={isMuted ? "destructive" : "outline"}
            size="icon"
            onClick={toggleMute}
            className="h-10 w-10 rounded-xl"
            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          <Button 
            variant={isCameraOff ? "destructive" : "outline"}
            size="icon"
            onClick={toggleCamera}
            className="h-10 w-10 rounded-xl"
            title={isCameraOff ? "Enable Video Camera" : "Disable Video Camera"}
          >
            {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </Button>

          {/* Theme Switcher Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-10 w-10 rounded-xl border-dashed"
            title="Toggle Light/Dark Mode"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Engine Match Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {isConnected ? (
            <>
              <Button 
                variant="outline"
                onClick={nextStranger}
                className="flex-1 sm:flex-none h-10 rounded-xl px-5 text-xs font-medium gap-1.5"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                Skip
              </Button>
              <Button 
                variant="default"
                onClick={nextStranger}
                className="flex-1 sm:flex-none h-10 rounded-xl px-5 text-xs font-medium gap-1.5 shadow-sm"
              >
                Next Stranger
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <Button 
              variant="default"
              onClick={findStranger}
              disabled={isSearching}
              className="w-full sm:w-auto h-10 rounded-xl px-8 text-xs font-medium gap-1.5 shadow-sm"
            >
              {isSearching ? (
                <>
                  <Search className="w-3.5 h-3.5 animate-spin" />
                  Finding Someone...
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  Find Stranger
                </>
              )}
            </Button>
          )}
        </div>

        {/* Guidelines Anchor */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-muted-foreground select-none">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Please abide by local community terms.</span>
        </div>
      </footer>
    </div>
  );
}