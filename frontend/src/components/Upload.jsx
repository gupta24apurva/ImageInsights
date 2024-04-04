import React, { useState } from "react";
import "../index.css"
import Result from "./Result";

const ImageCaptionGenerator = () => {

    const [selectedFile, setSelectedFile] = useState("");
    const [preview, setPreview] = useState("");
    const [bool, setBool] = useState(false);

    const handleImageChange = (event) => {
        const img = event.target.files[0];
        setSelectedFile(img);
    };

    const handleGenerateCaption = (event) => {
        if (selectedFile)
            setBool(true);
        else {
            window.alert("Select image first");
        }
    };

    return (
        <div className="upload-container">
            {!bool && 
                <div className="upload-box">
                    <h1 className="heading">
                        Welcome to ImageInsight
                    </h1>
                    <h5 style={{ color: 'black', fontSize: "16px" }}>Let Images Speak <br />Upload an Image to Generate Captivating Captions!</h5>
                    <input type="file" style={{ color: "black" }} onChange={handleImageChange} />
                    <div className="imgdiv">
                        {preview && <img className="imgcss" src={preview} alt="image" />}
                    </div>
                    <button className="btnGenerate" onClick={handleGenerateCaption}>Generate Caption</button>
                </div>
            }
            {bool && <Result img={selectedFile} />}
        </div>
    );
};

export default ImageCaptionGenerator;
