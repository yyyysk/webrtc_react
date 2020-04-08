import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { peer } from '../config/sw';

const styles = {
  entry: {
    display: 'flex',
  },
  entry__mv: {

  },
  entry__formBox: {

  }
};


const Entry = () => {
  const newRoomId = uuidv4();
  const [roomId, setRoomId] = useState('');

  /**
   * RoomId変更
   */
  const onRoomIdChange = (e: any) => {
    setRoomId(e.target.value);
  };

  return(
    <div>
      <h1>INN-STUDIO</h1>
      <div>
        <Link to={`/rooms/${newRoomId}`}>ROOMを新規作成</Link>
      </div>
      <div>
        <input id="roomId" type="text" onChange={e => onRoomIdChange(e)}></input>
        <Link to={`/rooms/${roomId}`}>JOIN</Link>
      </div>
    </div>
  );
};

export default Entry;