import logo from './logo.svg';
import './App.css';
import Peer from 'peerjs';
import { useEffect, useRef, useState } from 'react';

function App() {

  //peer
  const [peer, setPeer] = useState(new Peer());
  const [myId, setMyId] = useState('');
  const [conn, setConn] = useState(null);
  const [remoteId, setRemoteId] = useState('');
  //let { current: con } = useRef();
  const [con, setCon] = useState({});
  //localstream set
  let { current: RTCLoaclStream } = useRef(null);
  
  //const peerRef=useRef(peer)

  useEffect(() => {
    console.log("peer object ", peer);

    peer.on('open', (id) => {
      //setMyid
      setMyId(id);
    })

    //data connection
    peer.on('connection', (rmtconn) => {
      console.log("remote connection ", rmtconn);
      rmtconn.on('open', () => {
        rmtconn.on('data', (data) => {
          console.log("data friom another client ", data);
        });
      });
    })

    //when we get call
    peer.on('call', async (call) => {
      //remote peer call
      console.log("*** remote peer calling Onject inside peer.on(Call) ", call);
      // Answer the call, providing our mediaStream
      const media = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      //if media stream present
      console.log("******** answering ");

      //call the answer
      call.answer(media);
      console.log("*** local stream inside peer.on(call) ", media);
      const localVideoElement = document.querySelector("video#localVideo");
      //display localstream in video element
      localVideoElement.srcObject = media;
      //when we receive remote stream
      call.on('stream', (rmtstream) => {
        console.log("**** remoteStream inside peer.on(call) ", rmtstream);
        //display remote stream in video element
        const peerVideoElement = document.querySelector("video#remoteVideo")
        peerVideoElement.srcObject = rmtstream;
      });
    });

  }, [])

  //message exchange
  const dataChannel = (remoteId) => {
    console.log("remote peer ID ", remoteId);
    const datachnnl = peer.connect(remoteId);
    //con = datachnnl;
    setCon(datachnnl);
    console.log("con ", con)

    datachnnl.on('data', (data) => {
      console.log("data friom another client ", data);
    });
  }

  //make a call
  const makeCall = () => {
    //check weather remote id 
    console.log("*** remoted id stored locally ", remoteId);

    const media = navigator.mediaDevices.getUserMedia({ audio: true, video: true });

    media.then((stream) => {
      console.log("******** local stream inside makeCall ", stream);
      //call to perr by passing remoteId ans our localStream
      let call = peer.call(remoteId, stream);
      console.log("****local call Object inside makeCall ", call);
      const localVideoElement = document.querySelector("video#localVideo");
      //display local stream
      localVideoElement.srcObject = stream;
      //when we receive remote stream
      call.on('stream', (peerstream) => {
        //another peer media
        console.log("*** remote stream inside makecall() ", peerstream);
        //display remote stream
        const VideoElement = document.querySelector("video#remoteVideo")
        VideoElement.srcObject = peerstream;
      })
    })
  }

  return (
    <div className="App">
      <h1>peer</h1>
      {myId && <h1>ID : {myId}</h1>}
      {remoteId && <h1>RemoteID : {remoteId}</h1>}

      <input type="text" id="text" />
      <button onClick={() => {
        const d = document.getElementById("text").value;
        //setRemote Id
        setRemoteId(d);
        //call data Channel
        //   dataChannel(d);
      }}>connect</button>

      <button onClick={() => {//send message to another client
        console.log("inside send butto con ", con)
        con.send('Hello!');
      }}>send message </button>

      <button onClick={() => makeCall()}>make call</button>

      <h1>Local</h1>
      <video id="localVideo" autoPlay playsInline controls={true} />
      <video id="remoteVideo" autoPlay playsInline controls={true} />
    </div>
  );
}

export default App;
