import React, { useState } from 'react';

interface Props {
  sendMessage: (message: string) => void;
}

const Message = (props: Props) => {
  const [message, setMessage] = useState('');

  const onSend = () => {
    props.sendMessage(message);
    setMessage('');
  };

  return(
    <div className='room__form'>
      <input 
        id="message"
        className='room__form__input' 
        type="text" 
        value={message}
        onChange={e => setMessage(e.target.value)} 
        placeholder='メッセージを入力'></input>
      <a className='room__form__send' onClick={() => onSend()}>送信</a>
    </div>
  );
};

export default Message;