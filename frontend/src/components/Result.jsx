import React, { useEffect, useState } from 'react'
import Loader from './Loader';
import { useSpeechSynthesis } from 'react-speech-kit'
import Upload from './Upload';

const Result = (props) => {

  const [preview, setPreview] = useState();
  const [caption, setCaption] = useState();      
  const { speak } = useSpeechSynthesis();
  const [bool1, setBool] = useState(false);

  const handleListen = () => {
    speak({ text: caption })
  }

  const fetchCaption = async () => {
    const formData = new FormData();
    formData.append('file', props.img);

    try {
      const url = `http://localhost:5000/after`;
      const response = await fetch(url, {
        method: "Post",
        body: formData,
      });

      const data = await response.json();
      setCaption(data.caption);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    setPreview(URL.createObjectURL(props.img));
    fetchCaption();
  }, [])

  const handleClick = () => {
    setBool(true);
  }

  return (
    <>
      {!bool1 && <div className="result-page">
        <div className="result-window" style={{ position: 'reative' }}>
          <button style={{ color: 'black', marginLeft: "-31rem" }} className='result-logout' onClick={handleClick} >Go back</button>
          <h1 className="result-heading">Result page</h1>
          {preview && <img className="result-image" src={preview} alt="image" />}
          {caption ? (
            <p className="result-caption">{caption}</p>
          ) : (
            <Loader />
          )}
          <div className='extra-button'>
            <button className="text-to-speech-btn" onClick={handleListen}>
              Convert text to speech
            </button>
          </div>
        </div>
      </div>}
      {bool1 && <Upload />}
    </>
  );
}

export default Result;