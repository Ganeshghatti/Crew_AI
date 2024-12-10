import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import InputText from "../../components/Input/InputText";
import ErrorText from "../../components/Typography/ErrorText";
import axios from "axios";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import { Link, useNavigate } from "react-router-dom";

function SpecialitiesNew() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    icon: null,
    iconPreview: "",
    wallpaperimg: null,
    wallpaperimgPreview: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFormData = ({ updateType, value }) => {
    setFormData({ ...formData, [updateType]: value });
  };

  const handleiconChange = (event) => {
    const file = event.target.files[0];
    setFormData((prevFormData) => ({
      ...prevFormData,
      icon: file,
      iconPreview: URL.createObjectURL(file),
    }));
  };
  const handlewallpaperimgChange = (event) => {
    const file = event.target.files[0];
    setFormData((prevFormData) => ({
      ...prevFormData,
      wallpaperimg: file,
      wallpaperimgPreview: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      !formData.title ||
      !formData.desc ||
      !formData.icon ||
      !formData.wallpaperimg
    ) {
      setErrorMessage("All fields are required.");
      NotificationManager.error("Error", "All fields are required.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("desc", formData.desc);

    if (formData.icon) {
      formDataToSend.append("icon", formData.icon);
    }
    if (formData.wallpaperimg) {
      formDataToSend.append("wallpaperimg", formData.wallpaperimg);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/admin/speciality-new`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      NotificationManager.success(
        "Success",
        "Created new Specialty Successfully"
      );
      navigate(`/app/specialities`);
    } catch (error) {
      setErrorMessage(error.response.data.error);
      NotificationManager.error(
        "Error",
        "Failed to create new Specialty",
        5000,
        () => {
          alert(error.response.data.error);
        }
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log(formData);
  }, [formData]);
  return (
    <>
      <NotificationContainer />
      <div className="w-full flex flex-col gap-8">
        <InputText
          type="text"
          defaultValue={formData.title}
          updateType="title"
          containerStyle="mt-4"
          labelTitle="Enter Specialty Title"
          updateFormValue={handleFormData}
        />

        <InputText
          type="text"
          defaultValue={formData.desc}
          updateType="desc"
          labelTitle="Enter Description"
          updateFormValue={handleFormData}
        />
        <div className="form-control flex flex-col gap-2">
          <label className="label">
            <span className="label-text">Upload icon</span>
          </label>{" "}
          <input
            type="file"
            accept="image/*,image/svg+xml"
            onChange={handleiconChange}
            className="input input-bordered w-full"
          />
          {formData.iconPreview && (
            <div>
              <img
                src={formData.iconPreview}
                alt="Icon Preview"
                className="w-1/5 h-auto mt-4"
              />
            </div>
          )}
        </div>
        <div className="form-control flex flex-col gap-2">
          <label className="label">
            <span className="label-text">Upload Wallpaper Image</span>
          </label>{" "}
          <input
            type="file"
            accept="image/*,image/svg+xml"
            onChange={handlewallpaperimgChange}
            className="input input-bordered w-full"
          />
          {formData.wallpaperimgPreview && (
            <div>
              <img
                src={formData.wallpaperimgPreview}
                alt="WallPaper Image Preview"
                className="w-1/5 h-auto mt-4"
              />
            </div>
          )}
        </div>
        <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>
        <button
          type="submit"
          onClick={handleSubmit}
          className={
            "btn mt-2 w-full btn-primary" + (loading ? " loading" : "")
          }
        >
          Create New!
        </button>
      </div>
    </>
  );
}

export default SpecialitiesNew;
