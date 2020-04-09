import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { peer } from '../config/sw';
import '../css/Entry.css'


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
    <div className='entry'>
      <div>
        <h1 className='entry__logo'>INN-STUDIO</h1>
        <div className='entry__formBox'>
          <p className='entry__formBody'>INN-STUDIOで遠く離れた人とのビデオ通話を楽しみましょう。</p>
          <div className='entry__row entry__row--1'>
            <Link className='entry__newLink' to={`/rooms/${newRoomId}`}>ROOMを新規作成</Link>
          </div>
          <form className='entry__form'>
            <div className='entry__row entry__row--flex'>
              <input className='entry__form__input' id="roomId" type="text" onChange={e => onRoomIdChange(e)} placeholder='ROOMIDを入力'></input>
              <Link className='entry__joinLink' to={`/rooms/${roomId}`}>JOIN</Link>
            </div>
          </form>
          <p className='entry__formBody'>© 2020 ysk.</p>
        </div>
      </div>
    </div>
  );
};

export default Entry;