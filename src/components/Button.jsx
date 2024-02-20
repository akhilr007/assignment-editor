import { convertToRaw } from "draft-js";
import "../App.css";

const Button = ({ editorState }) => {
  const onClick = () => {
    const contentState = editorState.getCurrentContent();
    const contentAsText = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem("editorContent", contentAsText);
  };
  return (
    <button className="saveButton" onClick={onClick}>
      save
    </button>
  );
};

export default Button;
