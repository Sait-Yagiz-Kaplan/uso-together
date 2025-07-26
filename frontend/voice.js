let localStream;
let peerConnections = {};
const config = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

function startVoice() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        localStream = stream;
        socket.emit('ready', roomId);
    }).catch(e => {
        alert('Mikrofon erişimi reddedildi!');
        console.error(e);
    });
}

socket.on('ready', (socketId) => {
    const peer = createPeer(socketId);
    peerConnections[socketId] = peer;
    localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
});

socket.on('offer', (data) => {
    const peer = createPeer(data.socketId);
    peerConnections[data.socketId] = peer;
    peer.setRemoteDescription(new RTCSessionDescription(data.offer)).then(() => {
        return peer.createAnswer();
    }).then(answer => {
        return peer.setLocalDescription(answer);
    }).then(() => {
        socket.emit('answer', {
            target: data.socketId,
            answer: peer.localDescription
        });
    });
});

socket.on('answer', (data) => {
    peerConnections[data.socketId].setRemoteDescription(new RTCSessionDescription(data.answer));
});

socket.on('ice-candidate', (data) => {
    peerConnections[data.socketId].addIceCandidate(new RTCIceCandidate(data.candidate));
});

function createPeer(socketId) {
    const peer = new RTCPeerConnection(config);

    peer.onicecandidate = e => {
        if (e.candidate) {
            socket.emit('ice-candidate', {
                target: socketId,
                candidate: e.candidate
            });
        }
    };

    peer.ontrack = e => {
        const audio = document.createElement('audio');
        audio.srcObject = e.streams[0];
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