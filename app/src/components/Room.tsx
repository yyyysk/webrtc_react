import React from 'react';
import { peer } from '../config/sw';
import Message from './Message';
import '../css/Room.css';
import { Link } from 'react-router-dom';

interface Props {
  match: {
    params: {
      roomId: string
    }
  };
  userName: string;
};

interface State {
  remoteVideos: any;
  messages: {
    user: string
    message: string
  }[]
}

class Room extends React.Component<Props, State> {
  private isInit: boolean;
  private room: any;
  private roomId: string;
  private localVideoRef: any;
  private remoteVideoRefs: any;
  private remoteStreams: any;
  private userName: any;

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
      remoteVideos: [],
      messages: []
    };
    // ユーザー
    if (props.userName === '' || !props.userName) {
      this.userName = 'ユーザー';
    } else {
      this.userName = props.userName;
    }
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
      const messages = Object.assign([], this.state.messages);
      messages.push({
        user: 'SYSTEM',
        message: `新規ユーザーが参加しました。`
      });
      this.setState({messages: messages});
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
          playsInline={true}
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

    // メッセージ送信
    room.on('data', ({ data, src }) => {
      const parsed = JSON.parse(data);
      const messages = Object.assign([], this.state.messages);
      messages.push({
        user: parsed.user,
        message: parsed.message
      });
      this.setState({messages: messages});
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

  // Roomから離れたとき
  componentWillUnmount() {
    // this.room.close();
  }

  // 音声ミュート
  toggleMuteAudio(e: any) {
    this.localVideoRef.current.srcObject.getAudioTracks().forEach((track: any) => {
      track.enabled = !track.enabled;
      if (track.enabled) {
        e.target.src = '/img/mic.png';
      } else {
        e.target.src = '/img/mic--muted.png';
      }
    });
  }

  // 映像ミュート
  toggleMuteVideo(e: any) {
    this.localVideoRef.current.srcObject.getVideoTracks().forEach((track: any) => {
      track.enabled = !track.enabled;
      if (track.enabled) {
        e.target.src = '/img/movie.png';
      } else {
        e.target.src = '/img/movie--muted.png';
      }
    });
  }


  /**
   * Message送信
   */
  sendMessage(message: string) {
    const data = {
      user: this.userName,
      message: message
    };
    this.room.send(JSON.stringify(data));

    const messages = Object.assign([], this.state.messages);
      messages.push({
        user: 'me',
        message: message
      });
    this.setState({messages: messages});
  }

  render() {
    const remoteVideos = this.state.remoteVideos? Object.values(this.state.remoteVideos) : null;
    const messages = this.state.messages.map((message) => <p style={{wordWrap: 'break-word', padding: '0 12px'}}>{message.user}: {message.message}</p>)

    return(
      <div className='room'>
        <div className='room__remoteVideos'>
          <video
            id="localStream"
            ref={this.localVideoRef}
            muted
            playsInline={true}
            ></video>
          {remoteVideos}
        </div>
        <div className='room__footer'>
          <h2 style={{color: '#333', padding: '12px'}}>ROOMID:<br></br> {this.roomId}</h2>
          <div className='room_messages'>{messages}</div>
          <Message sendMessage={(message) => this.sendMessage(message)} />
          <div className='room__manuBox'>
            <img width='30' height='30' src='/img/mic.png' onClick={(e) => this.toggleMuteAudio(e)}></img>
            <img width='30' height='30' src='/img/movie.png' onClick={(e) => this.toggleMuteVideo(e)}></img>
            <Link onClick={() => this.room.close()} className='room__close' to='/'>接続終了</Link>
          </div>
        </div>
      </div>
    );
  }
};

export default Room;