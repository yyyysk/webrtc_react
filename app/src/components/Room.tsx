import React from 'react';
import { peer } from '../config/sw';
import '../css/Room.css';

interface Props {
  match: {
    params: {
      roomId: string
    }
  }
};

interface State {
  remoteVideos: any;
}

class Room extends React.Component<Props, State> {
  private isInit: boolean;
  private room: any;
  private roomId: string;
  private localVideoRef: any;
  private remoteVideoRefs: any;
  private remoteStreams: any;

  constructor(props: Props) {
    super(props);
    this.isInit = false;
    // RoomID
    this.roomId = this.props.match.params.roomId;
    // LocalのVideo
    this.localVideoRef = React.createRef();
    // RemoteのVideoRef
    this.remoteVideoRefs = {};
    // RemoteのStreams
    this.remoteStreams = {};
    // state
    this.state = {
      remoteVideos: []
    };
  };

  /**
   * Join
   */
  async init() {
    // peerがシナジリングサーバーに接続できていなかったら処理しない
    if (!peer.open) {
      alert('サーバー未接続エラー');
      return;
    } else {
      this.isInit = true;
    }

    // Local Stream
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
    this.localVideoRef.current.srcObject = localStream;
    await this.localVideoRef.current.play().catch(console.error);

    // Roomに接続
    const room = peer.joinRoom(this.roomId, {
      mode: 'sfu',
      stream: localStream
    });

    // 接続時
    room.once('open', () => {
      alert(`Room: ${this.roomId} へようこそ`);
    });

    // ユーザージョイン
    room.on('peerJoin', peerId => {
      alert(`=== ${peerId} joined ===\n`);
    });

    // 新しく入ってきたユーザーのストリーム表示
    room.on('stream', async (stream) => {
      // Refを追加
      this.remoteVideoRefs[stream.peerId] = React.createRef();

      const newVideo = (
        <video
          id={stream.peerId}
          key={stream.peerId}
          ref={this.remoteVideoRefs[stream.peerId]} // 今回追加したrefを指定
          playsInline
          autoPlay
          ></video>);

      // StreamをpeerIdに紐づけて保管
      this.remoteStreams[stream.peerId] = stream;
      // VideoタグをpeerIdに紐づけてStateに保管
      const remoteVideos = Object.assign({}, this.state.remoteVideos);
      remoteVideos[stream.peerId] = newVideo;
      this.setState({
        remoteVideos: remoteVideos,
      });
    });

    // 他のユーザーが退出したとき
    room.on('peerLeave', (peerId) => {
      // this.remoteVideoRefs[peerId].current.srcObject.getTracks().forEace((track: any) => track.stop());
      // this.remoteVideoRefs[peerId].current.srcObject = null;
      const remoteVideos = Object.assign({}, this.state.remoteVideos);
      remoteVideos[peerId] = null;
      this.setState({
        remoteVideos: remoteVideos,
      });
    });

    // 自分が退出したとき
    room.once('close', () => {
      this.setState({
        remoteVideos: null
      });
    });

    this.room = room;

    peer.on('error', console.error);
  };

  componentDidMount() {
    if (!this.isInit) {
      this.init();
    }
  }

  componentDidUpdate() {
    // すべてのリモートビデオのsrcObjectをチェック
    Object.keys(this.remoteVideoRefs).forEach((key: string) => {
      const targetNode = this.remoteVideoRefs[key].current;
      if (targetNode && !targetNode.srcObject) {
        targetNode.srcObject = this.remoteStreams[key];
      }
    });
  }

  componentWillUnmount() {
    this.room.close();
  }

  render() {
    const remoteVideos = this.state.remoteVideos? Object.values(this.state.remoteVideos) : null;

    return(
      <div>
        <h2 style={{color: '#333'}}>ROOMID: {this.roomId}</h2>
        <div className='room__remoteVideos'>
          <video
            id="localStream"
            ref={this.localVideoRef}
            muted
            playsInline
            ></video>
          {remoteVideos}
        </div>
      </div>
    );
  }
};

export default Room;