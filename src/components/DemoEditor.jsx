import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  convertFromRaw,
  getDefaultKeyBinding,
} from "draft-js";
import { useState, useEffect } from "react";
import "../App.css";
import Button from "./Button";
import { styleMap } from "../../utils";

const DemoEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      const rawContentState = JSON.parse(savedContent);
      return EditorState.createWithContent(convertFromRaw(rawContentState));
    }
    return EditorState.createEmpty();
  });

  useEffect(() => {
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      const rawContentState = JSON.parse(savedContent);
      setEditorState(
        EditorState.createWithContent(convertFromRaw(rawContentState))
      );
    }
  }, []);

  const handleInlineStyleChange = (
    style,
    length,
    blockText,
    content,
    selection
  ) => {
    const text = blockText.trim();
    const newBlockText = text.substring(length);
    const newContentState = Modifier.replaceText(
      content,
      selection.merge({ anchorOffset: 0 }),
      newBlockText
    );
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "remove-range"
    );
    setEditorState(RichUtils.toggleInlineStyle(newEditorState, style));
  };

  const handleBeforeInput = (char) => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const block = content.getBlockForKey(selection.getStartKey());
    const blockText = block.getText();

    if (char === " ") {
      const text = blockText.trim();

      switch (text) {
        case "#":
          {
            const newBlockText = text.substring(1);
            const newContentState = Modifier.replaceText(
              content,
              selection.merge({ anchorOffset: 0 }),
              newBlockText
            );
            const newEditorState = EditorState.push(
              editorState,
              newContentState,
              "remove-range"
            );
            setEditorState(
              RichUtils.toggleBlockType(newEditorState, "header-one")
            );
            handleInlineStyleChange(
              "header-one",
              1,
              blockText,
              content,
              selection
            );
          }
          break;

        case "*":
          handleInlineStyleChange("BOLD", 1, blockText, content, selection);
          break;
        case "**":
          handleInlineStyleChange("red", 2, blockText, content, selection);
          break;
        case "***":
          handleInlineStyleChange(
            "UNDERLINE",
            3,
            blockText,
            content,
            selection
          );
          break;
        default:
          return "notHandled";
      }

      return "handled";
    }

    return "not-handled";
  };

  const handleKeyCommand = (command, editorState) => {
    if (command === "handle-newline") {
      const contentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();
      const currentBlock = contentState.getBlockForKey(
        selectionState.getStartKey()
      );

      // Insert a soft newline character without any style
      const newContentState = Modifier.insertText(
        contentState,
        selectionState,
        "\n"
      );

      // Update the editor state based on whether the current block is empty or not
      let newState;
      if (!currentBlock?.getText()?.trim()) {
        newState = EditorState.push(
          editorState,
          newContentState,
          "insert-char"
        );
      } else {
        const splitBlockState = Modifier.splitBlock(
          newContentState,
          selectionState
        );
        newState = EditorState.push(
          editorState,
          splitBlockState,
          "split-block"
        );
      }

      // Update the editor state with the new state
      setEditorState(
        EditorState.forceSelection(newState, newState.getSelection())
      );

      return "handled";
    }
    return "notHandled";
  };

  const keyBindingFunction = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      return "handle-newline";
    }
    return getDefaultKeyBinding(e);
  };

  return (
    <div>
      <Button editorState={editorState} />
      <div className="demoEditor">
        <Editor
          editorState={editorState}
          onChange={(newEditorState) => setEditorState(newEditorState)}
          handleBeforeInput={handleBeforeInput}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={keyBindingFunction}
          customStyleMap={styleMap}
        />
      </div>
    </div>
  );
};

export default DemoEditor;
