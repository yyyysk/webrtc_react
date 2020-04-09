import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { peer } from '../config/sw';
import '../css/Entry.css'


const Entry = () => {
  const newRoomId = uuidv4();
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');

  /**
   * RoomId変更
   */
  const onRoomIdChange = (e: any) => {
    setRoomId(e.target.value);
  };

  const onNameChange = (e: any) => {
    setName(e.target.value);
  };

  return(
    <div className='entry'>
      <div>
        <h1 className='entry__logo'>INN-STUDIO</h1>
        <div className='entry__formBox'>
          <p className='entry__formBody'>INN-STUDIOで遠く離れた人とのビデオ通話を楽しみましょう。</p>
          <div className='entry__row entry__row--1'>
          </div>
          <form className='entry__form'>
            <div className='entry__row entry__row--flex'>
              <input className='entry__form__input' id="name" type="text" onChange={e => onNameChange(e)} placeholder='ニックネームを入力'></input>
              <input style={{marginTop: '8px'}} className='entry__form__input' id="roomId" type="text" onChange={e => onRoomIdChange(e)} placeholder='ROOMIDを入力（JOINのみ）'></input>
              <p className='entry__note'>※Roomを新規作成する場合、ROOMIDは自動で作成されます。</p>
              <div className='entry__row'>
                <Link className='entry__newLink' to={`/rooms/${newRoomId}?name=${name}`}>新規作成</Link>
                <Link className='entry__joinLink' to={`/rooms/${roomId}?name=${name}`}>JOIN</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
      <p className='copyright'>© 2020 ysk.</p>
    </div>
  );
};

export default Entry;