import { useEffect, useState, useMemo, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useParams } from "react-router-dom";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import axios from "axios";

export default function CampaignRichText({ id, label, value, setValue }) {
  const quillRef = useRef();
  const { link } = useParams();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);

  const imageHandler = (e) => {
    const editor = quillRef.current.getEditor();
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (/^image\//.test(file.type)) {
        console.log(file);
        const formData = new FormData();
        formData.append("image", file);
        setLoading(true);
        try {
          const response = await axios.post(
            `${
              import.meta.env.VITE_SERVER_URL
            }/admin/upload-campaign-image/${link}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          const url = response.data.campaignImageUrl;
          const range = editor.getSelection();
          editor.insertEmbed(range.index, "image", url);
          editor.setSelection(range.index + 1);
          editor.insertText(range.index + 1, "\n");
          NotificationManager.success("Success", "Image Uploaded Successfully");
        } catch (error) {
          console.log(error);
          NotificationManager.error(
            "Error",
            "Failed to update campaign",
            5000,
            () => {
              alert(error.response.data.error);
            }
          );
        } finally {
          setLoading(false);
        }
      }
    };
  };

  const formats = [
    "header",
    "height",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "color",
    "bullet",
    "indent",
    "link",
    "image",
    "align",
    "size",
  ];
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
            { align: [] },
          ],
          [
            {
              color: [
                "#000000",
                "#e60000",
                "#ff9900",
                "#ffff00",
                "#008a00",
                "#0066cc",
                "#9933ff",
                "#ffffff",
                "#facccc",
                "#ffebcc",
                "#ffffcc",
                "#cce8cc",
                "#cce0f5",
                "#ebd6ff",
                "#bbbbbb",
                "#f06666",
                "#ffc266",
                "#ffff66",
                "#66b966",
                "#66a3e0",
                "#c285ff",
                "#888888",
                "#a10000",
                "#b26b00",
                "#b2b200",
                "#006100",
                "#0047b2",
                "#6b24b2",
                "#444444",
                "#5c0000",
                "#663d00",
                "#666600",
                "#003700",
                "#002966",
                "#3d1466",
                "custom-color",
              ],
            },
          ],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    []
  );
  return (
    <>
      <ReactQuill
        theme="snow"
        ref={quillRef}
        value={value}
        modules={modules}
        onChange={(content) => setValue(content)}
        formats={formats}
      />
    </>
  );
}
