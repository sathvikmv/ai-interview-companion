'use client';

import { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Video, VideoOff, AlertCircle } from 'lucide-react';

interface CandidateCameraProps {
    isRecording?: boolean;
}

export default function CandidateCamera({ isRecording = false }: CandidateCameraProps) {
    const webcamRef = useRef<Webcam>(null);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(() => setHasPermission(true))
            .catch(() => setHasPermission(false));
    }, []);

    if (hasPermission === false) {
        return (
            <div className="glass-card p-6 flex flex-col items-center justify-center gap-3 aspect-video text-center">
                <AlertCircle className="w-8 h-8 text-amber-400" />
                <p className="text-sm text-slate-300 font-medium">Camera Access Denied</p>
                <p className="text-xs text-slate-500">Please grant camera permissions to enable proctoring.</p>
            </div>
        );
    }

    return (
        <div className="glass-card overflow-hidden relative">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
                    <span className="text-xs font-medium text-slate-400">
                        {isRecording ? 'Recording' : 'Camera Feed'}
                    </span>
                </div>
                <button
                    onClick={() => setCameraEnabled(v => !v)}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                    {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
            </div>

            <div className="relative aspect-video bg-slate-950">
                {cameraEnabled ? (
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        className="w-full h-full object-cover"
                        mirrored
                        videoConstraints={{ facingMode: 'user', width: 640, height: 360 }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                            <VideoOff className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-xs text-slate-600">Camera Off</p>
                        </div>
                    </div>
                )}

                {/* Recording indicator overlay */}
                {isRecording && cameraEnabled && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-600/90 backdrop-blur px-2 py-1 rounded-full">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        <span className="text-white text-xs font-bold">REC</span>
                    </div>
                )}

                {/* Behavior analysis overlay */}
                {cameraEnabled && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-slate-950/90 to-transparent">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs text-slate-300">Behavior Analysis: Active</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Behavior Metrics */}
            {cameraEnabled && (
                <div className="px-4 py-3 flex justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Eye Contact
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Posture OK
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Monitoring
                    </span>
                </div>
            )}
        </div>
    );
}