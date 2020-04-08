import React from 'react';
import { peer } from '../config/sw';
import { Stream } from 'stream';

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
  private roomId: string;
  private localVideoRef: any;
  private remoteVideoRefs: any;

  constructor(props: Props) {
    super(props);
    // RoomID
    this.roomId = this.props.match.params.roomId;
    // LocalのVideo
    this.localVideoRef = React.createRef();
    // RemoteのVideoRef
    this.remoteVideoRefs = {};
    // state
    this.state = {
      remoteVideos: []
    };

    // Skywayの設定
    this.join();
  };

  async playLocalVideo() {
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
    this.localVideoRef.current.srcObject = localStream;
    await this.localVideoRef.current.play().catch(console.error);
  };

  /**
   * Join
   */
  join() {
    // peerがシナジリングサーバーに接続できていなかったら処理しない
    if (!peer.open) {
      alert('サーバー未接続エラー');
      return;
    }

    // Roomに接続
    const room = peer.joinRoom(this.roomId, {
      mode: 'sfu'
    });
    room.once('open', () => {
      alert(`Room: ${this.roomId} へようこそ`);
    });
    room.on('peerJoin', peerId => {
      alert(`=== ${peerId} joined ===\n`);
    });

    // 新しく入ってきたユーザーのストリーム表示
    room.on('stream', async (stream) => {
      // Refを追加
      this.remoteVideoRefs[stream.peerId] = React.createRef();
      const newVideo = (<video
        id="localStream"
        ref={this.remoteVideoRefs[stream.peerId]} // 今回追加したrefを指定
        muted
        playsInline
        ></video>);
      const remoteVideos = Object.assign({}, this.state.remoteVideos);
      this.setState({
        remoteVideos: remoteVideos[stream.peerId] = newVideo
      });
    });

    // 他のユーザーが退出したとき
    room.on('peerLeave', (peerId) => {
      this.remoteVideoRefs[peerId].current.srcObject.getTracks().forEace((track: any) => track.stop());
      this.remoteVideoRefs[peerId].current.srcObject = null;
      const remoteVideos = Object.assign({}, this.state.remoteVideos);
      this.setState({
        remoteVideos: remoteVideos[peerId] = null
      });
    });

    // 自分が退出したとき
    room.once('close', () => {
      
    });
  };

  componentDidMount() {
    this.playLocalVideo();
  }

  render() {
    console.log('======hogehogehogheohgeorender')
    console.log(this.state.remoteVideos);
    return(
      <div>
        <h2>room: {this.roomId}</h2>
        <video
          id="localStream"
          ref={this.localVideoRef}
          muted
          playsInline
          ></video>
      </div>
    );
  }
};

export default Room;