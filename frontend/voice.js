let localStream;
let peerConnections = {};

// Socket referansı globalden alınıyor
const socket = window.socket;

socket.on("connect", () => {
    window.mySocketId = socket.id;
});

const config = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

function startVoice() {
    if (window.player) window.player.setVolume(3);
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        localStream = stream;
        if (!socket) return console.warn("Socket yok, ses gönderilemez.");

        socket.emit('ready');

        for (let socketId in peerConnections) {
            const peer = peerConnections[socketId];
            const alreadySent = peer.getSenders().some(s => s.track && s.track.kind === 'audio');
            if (!alreadySent) {
                stream.getTracks().forEach(track => {
                    peer.addTrack(track, stream);
                });
            }
        }
    }).catch(err => {
        console.error('Mikrofon erişimi reddedildi:', err);
        alert('Mikrofon erişimi gerekiyor!');
    });
}

function stopVoice() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
        socket.emit('user-disconnected', window.mySocketId);
    }
    if (window.player) window.player.setVolume(80);
}

socket.on('ready', (socketId) => {
    const peer = createPeer(socketId);
    peerConnections[socketId] = peer;
});

socket.on('offer', ({ socketId, offer }) => {
    const peer = createPeer(socketId);
    peerConnections[socketId] = peer;

    peer.setRemoteDescription(new RTCSessionDescription(offer)).then(() => {
        return peer.createAnswer();
    }).then(answer => {
        return peer.setLocalDescription(answer);
    }).then(() => {
        socket.emit('answer', {
            target: socketId,
            answer: peer.localDescription
        });
    });
});

socket.on('answer', ({ socketId, answer }) => {
    peerConnections[socketId].setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('ice-candidate', ({ socketId, candidate }) => {
    peerConnections[socketId].addIceCandidate(new RTCIceCandidate(candidate));
});

function createPeer(socketId) {
    const peer = new RTCPeerConnection(config);

    peer.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', {
                target: socketId,
                candidate: event.candidate
            });
        }
    };

    peer.ontrack = (event) => {
        const audio = document.createElement('audio');
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
        document.body.appendChild(audio);
    };

    peer.createOffer().then(offer => {
        return peer.setLocalDescription(offer);
    }).then(() => {
        socket.emit('offer', {
            target: socketId,
            offer: peer.localDescription
        });
    });

    return peer;
}

socket.on('user-disconnected', (socketId) => {
    if (peerConnections[socketId]) {
        peerConnections[socketId].close();
        delete peerConnections[socketId];
    }
});

window.startVoice = startVoice;
window.stopVoice = stopVoice;