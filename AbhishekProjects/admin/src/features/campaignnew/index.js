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

function CampaignNew() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    status: "private",
    amount: "",
    beneficiaryName: "",
    thumbnail: null,
    thumbnailPreview: "",
    carouselImages: [],
    carouselPreviews: [],
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFormData = ({ updateType, value }) => {
    setFormData({ ...formData, [updateType]: value });
  };

  const updateToggleValue = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      status: prevFormData.status === "private" ? "public" : "private",
    }));
  };

  const handleAmountChange = (value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      amount: value,
    }));
  };

  const handleThumbnailChange = (event) => {
    const file = event.target.files[0];
    setFormData((prevFormData) => ({
      ...prevFormData,
      thumbnail: file,
      thumbnailPreview: URL.createObjectURL(file),
    }));
  };

  const handleCarouselImagesChange = (event) => {
    const files = Array.from(event.target.files);
    const carouselPreviews = files.map((file) => URL.createObjectURL(file));
    setFormData((prevFormData) => ({
      ...prevFormData,
      carouselImages: [...prevFormData.carouselImages, ...files],
      carouselPreviews: [...prevFormData.carouselPreviews, ...carouselPreviews],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      !formData.title ||
      !formData.status ||
      !formData.amount ||
      !formData.beneficiaryName ||
      !formData.thumbnail ||
      formData.carouselImages.length === 0
    ) {
      setErrorMessage("All fields are required.");
      NotificationManager.error("Error", "All fields are required.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("status", formData.status);
    formDataToSend.append("amount", formData.amount);
    formDataToSend.append("beneficiaryName", formData.beneficiaryName);

    if (formData.thumbnail) {
      formDataToSend.append("thumbnail", formData.thumbnail);
    }
    for (let i = 0; i < formData.carouselImages.length; i++) {
      formDataToSend.append("carouselImages", formData.carouselImages[i]);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/admin/campaign-new`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      NotificationManager.success(
        "Success",
        "Created new Campaign Successfully"
      );
      navigate(`/app/campaigns`);
    } catch (error) {
      setErrorMessage(error.response.data.error);
      NotificationManager.error(
        "Error",
        "Failed to create new campaign",
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
          labelTitle="Enter Campaign Title"
          updateFormValue={handleFormData}
        />

        <InputText
          type="text"
          defaultValue={formData.beneficiaryName}
          updateType="beneficiaryName"
          labelTitle="Enter Beneficiary Name"
          updateFormValue={handleFormData}
        />
        <label className="label cursor-pointer flex justify-start gap-4 w-fit">
          <span className="label-text text-base-content">
            Status: {formData.status}
          </span>
          <input
            type="checkbox"
            className="toggle"
            checked={formData.status === "public"}
            onChange={updateToggleValue}
          />
        </label>
        <input
          type="number"
          value={formData.amount}
          placeholder="Enter Campaign Amount"
          onChange={(e) => handleAmountChange(e.target.value)}
          className="input input-bordered w-full"
          style={{
            // Chrome, Safari, Edge, Opera
            appearance: "textfield",
            // Firefox
            MozAppearance: "textfield",
            // Internet Explorer 10+
            MsAppearance: "textfield",
          }}
        />
        <div className="form-control flex flex-col gap-2">
          <label className="label">
            <span className="label-text">Upload Thumbnail Image</span>
          </label>{" "}
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="input input-bordered w-full"
          />{" "}
          {formData.thumbnailPreview && (
            <div>
              <img
                src={formData.thumbnailPreview}
                alt="Thumbnail Preview"
                className="w-1/5 h-auto mt-4"
              />
            </div>
          )}
        </div>

        <div className="form-control flex flex-col gap-2">
          <label className="label">
            <span className="label-text">Upload Carousel Images (1-5)</span>
          </label>{" "}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleCarouselImagesChange}
            className="input input-bordered w-1/5"
          />
          {formData.carouselPreviews &&
            formData.carouselPreviews.length > 0 && (
              <div className="w-full mt-4 flex flex-wrap gap-2">
                {formData.carouselPreviews.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Carousel Preview ${index + 1}`}
                    className="w-1/5 h-auto"
                  />
                ))}
              </div>
            )}
        </div>

        {/* <ReactQuill
          theme="snow"
          modules={modules}
          formats={formats}
          onChange={handleProcedureContentChange}
        ></ReactQuill> */}
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

export default CampaignNew;
