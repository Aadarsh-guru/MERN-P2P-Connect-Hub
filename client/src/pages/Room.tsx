import {
    useEffect,
    useRef,
    useState
} from "react";
import {
    ArrowRightToLine,
    Camera,
    CameraOff,
    Loader2,
    LogOut,
    Mic,
    MicOff,
    Volume2,
    VolumeX
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/providers/SocketProvider";
import { toast } from "@/components/ui/use-toast";
import ACTIONS from "@/lib/actions";

// free ice servers
const iceServers = [
    {
        urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
        ],
    }
];

const Room: React.FC = () => {

    // navigate and socket instance created
    const socket = useSocket();
    const navigate = useNavigate();

    // created an peer connection instance
    const peerConnection = new RTCPeerConnection({ iceServers });

    // video refs for handling remote and local video
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);

    // state to store local video stream
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    // states for local functionality
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isMuted, setIsMuted] = useState(false);

    // state for storing remote socket connectionId 
    const [remoteConnectionId, setRemoteConnectionId] = useState<string>("");

    // state for showing finding spinner
    const [isFinding, setIsFinding] = useState(true);

    // useEffect for capturing user's device media on first render.
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                setLocalStream(stream);
                socket?.emit(ACTIONS.JOIN);
            })
            .catch(error => {
                console.error('Error accessing media devices:', error);
                toast({
                    title: "Error accessing media devices.",
                    variant: "destructive",
                });
            });
        return () => {
            socket?.emit(ACTIONS.LEAVE, remoteConnectionId);
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    track.stop();
                });
            }
            if (peerConnection) {
                peerConnection.close();
            }
        }
    }, [socket]);

    // useEffect for handing all webRTC events
    useEffect(() => {

        socket?.on(ACTIONS.JOIN, async (userId: string) => {

            peerConnection.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket?.emit(ACTIONS.CANDIDATE, { userId, candidate: event.candidate })
                }
            };

            localStream?.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream!);
            });

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            socket?.emit(ACTIONS.OFFER, { userId, offer });

        });

        socket?.on(ACTIONS.OFFER, async ({ offer, userId }) => {

            peerConnection.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket?.emit(ACTIONS.CANDIDATE, { userId, candidate: event.candidate })
                }
            };

            localStream?.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream!);
            });

            if (offer) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            }

            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            socket?.emit(ACTIONS.ANSWER, { userId, answer });

        });

        socket?.on(ACTIONS.ANSWER, async ({ answer, userId }) => {

            if (peerConnection && answer) {

                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

                setIsFinding(false);
                setRemoteConnectionId(userId);
            }

        });

        socket?.on(ACTIONS.CANDIDATE, async ({ candidate, userId }) => {

            if (peerConnection && candidate) {

                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));

                setIsFinding(false);
                setRemoteConnectionId(userId);
            }

        });

        socket?.on(ACTIONS.LEAVE, (userId) => {

            if (userId === remoteConnectionId) {

                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = null;
                }

                toast({ title: "Participant has left the room." });

            }

        });

        return () => {

            socket?.off(ACTIONS.JOIN);
            socket?.off(ACTIONS.CANDIDATE);
            socket?.off(ACTIONS.OFFER);
            socket?.off(ACTIONS.ANSWER);
            socket?.off(ACTIONS.LEAVE);

        };

    }, [socket, localStream, peerConnection]);


    // function for toggle user's camera off and on 
    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoEnabled(prevState => !prevState);
        }
    };

    // function for toggle user's audio off and on 
    const toggleAudio = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsAudioEnabled(prevState => !prevState);
        }
    };

    // function for toggle video frames
    const swapVideoFrames = () => {
        if (localVideoRef.current && remoteVideoRef.current) {
            const tempSrcObject = localVideoRef.current.srcObject;
            const tempMuted = localVideoRef.current.muted;

            localVideoRef.current.srcObject = remoteVideoRef.current.srcObject;
            localVideoRef.current.muted = false;

            remoteVideoRef.current.srcObject = tempSrcObject;
            remoteVideoRef.current.muted = tempMuted;
        }
    };

    // function for cut the peer connection leave
    const goBack = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => {
                track.stop();
            });
            setLocalStream(null);
        }
        if (peerConnection) {
            peerConnection.close();
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
        socket?.emit(ACTIONS.LEAVE, remoteConnectionId);
        setRemoteConnectionId("");
        navigate('/');
    };

    // function for find the new user
    const handleNext = () => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
        socket?.emit(ACTIONS.LEAVE, remoteConnectionId);
        if (peerConnection) {
            peerConnection.close();
        }
        socket?.emit(ACTIONS.JOIN);
        setIsFinding(true);
        setRemoteConnectionId("");
    };

    return (
        <div className="h-[calc(100vh-80px)] w-full flex justify-center items-center">
            <div className="w-full h-full relative">
                {isFinding && (
                    <div className="absolute md:top-0 left-0 bottom-20 md:bottom-full right-0 flex justify-center gap-2 md:gap-4 items-center h-16 bg-transparent text-white">
                        <Loader2 className="animate-spin" />
                        <p>Finding match...</p>
                    </div>
                )}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    muted={isMuted}
                    className="w-full h-full object-cover aspect-video md:rounded-tr-xl md:rounded-tl-xl bg-black"
                />
                <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    className="absolute top-4 right-4 bg-black w-1/2 md:w-1/4 object-cover aspect-video rounded-xl cursor-pointer"
                    onClick={swapVideoFrames}
                />
                <div className="absolute gap-2 md:gap-4 bottom-10 w-full flex justify-center">
                    <Button size={'icon'} onClick={toggleVideo}>
                        {isVideoEnabled ? <Camera className="text-blue-500" /> : <CameraOff className="text-red-500" />}
                    </Button>
                    <Button size={'icon'} onClick={toggleAudio}>
                        {isAudioEnabled ? <Mic className="text-blue-500" /> : <MicOff className="text-red-500" />}
                    </Button>
                    <Button size={'icon'} onClick={() => setIsMuted(!isMuted)} >
                        {isMuted ? <VolumeX className="text-red-500" /> : <Volume2 className="text-blue-500" />}
                    </Button>
                    <Button onClick={handleNext} size={'icon'} className="bg-green-500 hover:bg-green-600">
                        <ArrowRightToLine className="text-white" />
                    </Button>
                    <Button onClick={goBack} size={'icon'} className="bg-rose-500 hover:bg-rose-600">
                        <LogOut className="text-white" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Room;
