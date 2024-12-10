import { useEffect, useState, useMemo, useRef } from "react";
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
import { useParams } from "react-router-dom";
import FormikRichText from "../../components/RichText/CampaignRichText";
import ToogleInput from "../../components/Input/ToogleInput";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function CampaignDetail() {
  const navigate = useNavigate();
  const { link } = useParams();
  const token = localStorage.getItem("token");

  const [initialImages, setInitialImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    status: "",
    amount: 0,
    amountDonated: 0,
    beneficiaryName: "",
    beneficiaryUPI: "",
    bankAccount: "",
    IFSC: "",
    content: "",
    thumbnail: "",
    thumbnailPreview: "",
    qrCode: "",
    qrCodePreview: "",
    carouselImages: [],
    carouselPreviews: [],
    documentImages: [],
    documentPreviews: [],
    updates: [],
    taxBenefit: {
      isTaxBenefit: false,
      types: []
    },
  });
  const [carouselImagesToDelete, setCarouselImagesToDelete] = useState([]);
  const [documentImagesToDelete, setDocumentImagesToDelete] = useState([]);
  const [newUpdateText, setNewUpdateText] = useState("");
  const [newUpdateDate, setNewUpdateDate] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [weeklyTransactions, setWeeklyTransactions] = useState([]);
  const [allTimeTransactions, setAllTimeTransactions] = useState([]);
  const [showAllTime, setShowAllTime] = useState(false);

  const extractImageUrls = (content) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const images = tempDiv.getElementsByTagName("img");
    const imageUrls = [];
    for (let img of images) {
      imageUrls.push(img.src);
    }
    return imageUrls;
  };

  const fetchData = async () => {
    try {
      if (token && link) {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/admin/get-campaign-details/${link}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const campaign = response.data.campaign;
        setFormData((prevFormData) => ({
          ...prevFormData,
          title: campaign.title,
          status: campaign.status,
          amount: campaign.amount,
          amountDonated: campaign.amountDonated,
          beneficiaryName: campaign.beneficiaryName,
          beneficiaryUPI: campaign.beneficiaryUPI,
          bankAccount: campaign.bankAccount,
          IFSC: campaign.IFSC,
          content: campaign.content,
          thumbnailPreview: campaign.thumbnail,
          qrCode: campaign.qrCode,
          qrCodePreview: campaign.qrCode,
          carouselPreviews: campaign.carousel,
          documentPreviews: campaign.document,
          updates: campaign.updates,
          taxBenefit: campaign.taxBenefit || { isTaxBenefit: false, types: [] },
        }));
        const initialImages = extractImageUrls(campaign.content);
        setInitialImages(initialImages);
        setWeeklyTransactions(response.data.weeklyTransactions);
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 401) {
        return navigate(`/`);
      }
      NotificationManager.error(
        "Failed to fetch campaigns",
        "Error",
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
    fetchData();
  }, [token]);

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
  const handleAmountDonatedChange = (value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      amountDonated: value,
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
  const handleqrCodeChange = (event) => {
    const file = event.target.files[0];
    setFormData((prevFormData) => ({
      ...prevFormData,
      qrCode: file,
      qrCodePreview: URL.createObjectURL(file),
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

  const handleDocumentImageChange = (event) => {
    const files = Array.from(event.target.files);
    const documentPreviews = files.map((file) => URL.createObjectURL(file));
    setFormData((prevFormData) => ({
      ...prevFormData,
      documentImages: [...prevFormData.documentImages, ...files],
      documentPreviews: [...prevFormData.documentPreviews, ...documentPreviews],
    }));
  };
  const removeCarouselImage = (index) => {
    setFormData((prevFormData) => {
      const imageToDelete = prevFormData.carouselPreviews[index];
      setCarouselImagesToDelete((prev) => [...prev, imageToDelete]);

      const newCarouselImages = prevFormData.carouselImages.filter(
        (image, i) => i !== index
      );
      const newCarouselPreviews = prevFormData.carouselPreviews.filter(
        (preview, i) => i !== index
      );
      return {
        ...prevFormData,
        carouselImages: newCarouselImages,
        carouselPreviews: newCarouselPreviews,
      };
    });
  };

  const removeDocumentImage = (index) => {
    setFormData((prevFormData) => {
      const imageToDelete = prevFormData.documentPreviews[index];
      setDocumentImagesToDelete((prev) => [...prev, imageToDelete]);

      const newDocumentImages = prevFormData.documentImages.filter(
        (image, i) => i !== index
      );
      const newDocumentPreviews = prevFormData.documentPreviews.filter(
        (preview, i) => i !== index
      );
      return {
        ...prevFormData,
        documentImages: newDocumentImages,
        documentPreviews: newDocumentPreviews,
      };
    });
  };
  const handleAddUpdate = () => {
    if (newUpdateText.trim() !== "" && newUpdateDate !== "") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        updates: [
          ...prevFormData.updates,
          { text: newUpdateText, date: newUpdateDate },
        ],
      }));
      setNewUpdateText("");
      setNewUpdateDate("");
    }
  };

  const handleEditUpdate = (index, updatedText, updatedDate) => {
    const updatedUpdates = [...formData.updates];
    updatedUpdates[index] = { text: updatedText, date: updatedDate };
    setFormData((prevFormData) => ({
      ...prevFormData,
      updates: updatedUpdates,
    }));
  };

  const handleRemoveUpdate = (index) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      updates: prevFormData.updates.filter((_, i) => i !== index),
    }));
  };

  const handleTaxBenefitToggle = (value) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      taxBenefit: {
        ...prevFormData.taxBenefit,
        isTaxBenefit: value,
        types: value ? prevFormData.taxBenefit.types : []
      }
    }));
  };

  const handleTypeChange = (index, field, value) => {
    setFormData(prevFormData => {
      const newTypes = [...prevFormData.taxBenefit.types];
      newTypes[index] = { ...newTypes[index], [field]: value };
      return {
        ...prevFormData,
        taxBenefit: { ...prevFormData.taxBenefit, types: newTypes }
      };
    });
  };

  const addType = () => {
    setFormData(prevFormData => ({
      ...prevFormData,
      taxBenefit: {
        ...prevFormData.taxBenefit,
        types: [...prevFormData.taxBenefit.types, { name: '', desc: '' }]
      }
    }));
  };

  const removeType = (index) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      taxBenefit: {
        ...prevFormData.taxBenefit,
        types: prevFormData.taxBenefit.types.filter((_, i) => i !== index)
      }
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
      !formData.thumbnailPreview ||
      formData.carouselPreviews.length === 0
    ) {
      setErrorMessage("All fields are required.");
      NotificationManager.error("Error", "All fields are required.");
      return;
    }
    const currentImages = extractImageUrls(formData.content);
    const imagesToDelete = initialImages.filter(
      (url) => !currentImages.includes(url)
    );

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("status", formData.status);
    formDataToSend.append("amount", formData.amount);
    formDataToSend.append("amountDonated", formData.amountDonated);
    formDataToSend.append("bankAccount", formData.bankAccount);
    formDataToSend.append("IFSC", formData.IFSC);

    formDataToSend.append("beneficiaryName", formData.beneficiaryName);
    formDataToSend.append("beneficiaryUPI", formData.beneficiaryUPI);
    formDataToSend.append("updates", JSON.stringify(formData.updates));
    formDataToSend.append("taxBenefit", JSON.stringify(formData.taxBenefit));
    formDataToSend.append("content", formData.content);

    if (formData.thumbnail) {
      formDataToSend.append("thumbnail", formData.thumbnail);
    }
    if (formData.qrCode) {
      formDataToSend.append("qrCode", formData.qrCode);
    }
    for (let i = 0; i < formData.carouselImages.length; i++) {
      formDataToSend.append("carouselImages", formData.carouselImages[i]);
    }
    for (let i = 0; i < formData.documentImages.length; i++) {
      formDataToSend.append("documentImages", formData.documentImages[i]);
    }
    if (imagesToDelete.length > 0) {
      formDataToSend.append("imagesToDelete", JSON.stringify(imagesToDelete));
    }
    if (carouselImagesToDelete.length > 0) {
      formDataToSend.append(
        "carouselImagesToDelete",
        JSON.stringify(carouselImagesToDelete)
      );
    }
    if (documentImagesToDelete.length > 0) {
      formDataToSend.append(
        "documentImagesToDelete",
        JSON.stringify(documentImagesToDelete)
      );
    }

    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_SERVER_URL
        }/admin/update-campaign-details/${link}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      NotificationManager.success("Success", "Campaign Updated Successfully");
      fetchData();
    } catch (error) {
      setErrorMessage(error.response.data.error);
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
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!link) {
      NotificationManager.error("Error", "Item couldn't be selected");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this campaign?")) {
      return;
    }
    const password = window.prompt("Please enter your password to confirm:");
    if (!password) {
      NotificationManager.error("Error", "Password is required to delete");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/admin/campaign-delete/${link}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            password: password,
          },
        }
      );
      NotificationManager.success("Success", "Deleted Successfully");
      navigate(`/app/campaigns`);
    } catch (error) {
      setErrorMessage(error.response.data.error);

      NotificationManager.error(
        "Error",
        "Failed to delete the Specialty",
        5000,
        () => {
          alert(error.response.data.error);
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTimeData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/admin/campaign-all-time-transactions/${link}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response.data.allTimeTransactions)
      setAllTimeTransactions(response.data.allTimeTransactions);
    } catch (error) {
      console.error("Error fetching all-time transactions:", error);
    }
  };

  const getChartData = () => {
    const data = showAllTime ? allTimeTransactions : weeklyTransactions;
    
    return {
      labels: data.map(item => {
        if (showAllTime) {
          const [year, month] = item._id.split('-');
          return `${new Date(year, month - 1).toLocaleString('default', { month: 'short' })} ${year}`;
        }
        return new Date(item._id).toLocaleDateString('default', { weekday: 'short' });
      }),
      datasets: [
        {
          label: showAllTime ? 'Monthly Donations' : 'Daily Donations This Week',
          data: data.map(item => item.totalAmount),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: showAllTime ? 'Monthly Transaction Count' : 'Daily Transaction Count',
          data: data.map(item => item.count),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
          yAxisID: 'count'
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (₹)'
        }
      },
      count: {
        beginAtZero: true,
        position: 'right',
        title: {
          display: true,
          text: 'Number of Transactions'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: showAllTime ? 'All Time Campaign Donations' : 'This Week\'s Campaign Donations'
      }
    }
  };

  const handleToggleView = async () => {
    if (!showAllTime && allTimeTransactions.length === 0) {
      await fetchAllTimeData();
    }
    setShowAllTime(!showAllTime);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <NotificationContainer />
      {formData && formData.title && (
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
          <div className="form-control flex flex-col gap-2">
            <label className="label">
              <span className="label-text">Total donation amount</span>
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
          </div>

          <div className="form-control flex flex-col gap-2">
            <label className="label">
              <span className="label-text">Amount donated till now</span>
            </label>
            <input
              type="disabled"
              value={formData.amountDonated}
              placeholder="Enter amount donated till now"
              onChange={(e) => handleAmountDonatedChange(e.target.value)}
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
          </div>

          <div className="collapse collapse-arrow">
            <input type="checkbox" />
            <div className="collapse-title text-lg text-white font-semibold bg-[#00367d]">
              Payment Details
            </div>
            <div className="collapse-content p-4">
              <InputText
                type="text"
                defaultValue={formData.beneficiaryUPI}
                updateType="beneficiaryUPI"
                labelTitle="1 . Enter Beneficiary UPI ID"
                updateFormValue={handleFormData}
              />
              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text">
                    2 .Upload UPI QR Code Image
                  </span>
                </label>{" "}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleqrCodeChange}
                  className="input input-bordered w-full"
                />{" "}
                {formData.qrCodePreview && (
                  <div>
                    <img
                      src={formData.qrCodePreview}
                      alt="QR Code Preview"
                      className="w-1/5 h-auto mt-4"
                    />
                  </div>
                )}
              </div>
              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text">
                    3 . Bank Account and IFSC details
                  </span>
                </label>
                <InputText
                  type="text"
                  defaultValue={formData.bankAccount}
                  updateType="bankAccount"
                  labelTitle="Enter Beneficiary Bank Account Number"
                  updateFormValue={handleFormData}
                />{" "}
                <InputText
                  type="text"
                  defaultValue={formData.IFSC}
                  updateType="IFSC"
                  labelTitle="Enter Beneficiary IFSC code"
                  updateFormValue={handleFormData}
                />
              </div>{" "}
            </div>
          </div>

          <div className="collapse collapse-arrow">
            <input type="checkbox" />
            <div className="collapse-title text-lg text-white font-semibold bg-[#00367d]">
              Image Uploads
            </div>
            <div className="collapse-content p-4">
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
                  <span className="label-text">
                    Upload Carousel Images (1-5)
                  </span>
                </label>{" "}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleCarouselImagesChange}
                  className="input input-bordered w-full"
                />
                {formData.carouselPreviews &&
                  formData.carouselPreviews.length > 0 && (
                    <div className="w-full mt-4 flex flex-wrap gap-2">
                      {formData.carouselPreviews.map((preview, index) => (
                        <div key={index} className="relative flex w-1/3">
                          <img
                            src={preview}
                            alt={`Carousel Preview ${index + 1}`}
                            className="border w-full h-auto"
                          />
                          <button
                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1"
                            onClick={() => removeCarouselImage(index)}
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text">
                    Upload Document Images (1-5)
                  </span>
                </label>{" "}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleDocumentImageChange}
                  className="input input-bordered w-full"
                />
                {formData.documentPreviews &&
                  formData.documentPreviews.length > 0 && (
                    <div className="w-full mt-4 flex flex-wrap gap-2">
                      {formData.documentPreviews.map((preview, index) => (
                        <div key={index} className="relative flex w-1/3">
                          <img
                            src={preview}
                            alt={`Document Preview ${index + 1}`}
                            className="border w-full h-auto"
                          />
                          <button
                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1"
                            onClick={() => removeDocumentImage(index)}
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </div>

          <div className="collapse collapse-arrow">
            <input type="checkbox" />
            <div className="collapse-title text-lg text-white font-semibold bg-[#00367d]">
              Content
            </div>
            <div className="collapse-content p-4">
              <FormikRichText
                id="description"
                name="description"
                label="Description"
                value={formData.content}
                setValue={(content) =>
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    content: content,
                  }))
                }
              />{" "}
            </div>
          </div>
          <div className="collapse collapse-arrow">
            <input type="checkbox" />
            <div className="collapse-title text-lg text-white font-semibold bg-[#00367d]">
              Updates
            </div>
            <div className="collapse-content p-4">
              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text">Updates</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUpdateText}
                    onChange={(e) => setNewUpdateText(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Add a new update"
                  />
                  <input
                    type="date"
                    value={newUpdateDate}
                    onChange={(e) => setNewUpdateDate(e.target.value)}
                    className="input input-bordered w-full"
                  />
                  <button
                    type="button"
                    onClick={handleAddUpdate}
                    className="btn btn-primary"
                  >
                    Add Update
                  </button>
                </div>
              </div>

              {formData.updates && formData.updates.length > 0 && (
                <div className="w-full mt-4 flex flex-col gap-2">
                  {formData.updates.map((update, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={update.text}
                        onChange={(e) =>
                          handleEditUpdate(index, e.target.value, update.date)
                        }
                        className="input input-bordered w-full"
                      />
                      <input
                        type="date"
                        value={update.date}
                        onChange={(e) =>
                          handleEditUpdate(index, update.text, e.target.value)
                        }
                        className="input input-bordered w-full"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveUpdate(index)}
                        className="btn btn-danger"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="collapse collapse-arrow">
            <input type="checkbox" />
            <div className="collapse-title text-lg text-white font-semibold bg-[#00367d]">
              Tax Benefit
            </div>
            <div className="collapse-content p-4">
              <ToogleInput
                labelTitle="Tax Benefit"
                defaultValue={formData.taxBenefit.isTaxBenefit}
                updateFormValue={({ value }) => handleTaxBenefitToggle(value)}
              />

              {formData.taxBenefit.isTaxBenefit && (
                <div>
                  <h3 className="mt-4 mb-2 font-semibold">Tax Benefit Types</h3>
                  {formData.taxBenefit.types.map((type, index) => (
                    <div key={index} className="mb-4 flex items-center space-x-2">
                      <input
                        type="text"
                        value={type.name}
                        onChange={(e) => handleTypeChange(index, 'name', e.target.value)}
                        placeholder="Name"
                        className="input input-bordered w-1/3"
                      />
                      <input
                        type="text"
                        value={type.desc}
                        onChange={(e) => handleTypeChange(index, 'desc', e.target.value)}
                        placeholder="Description"
                        className="input input-bordered w-1/2"
                      />
                      <button onClick={() => removeType(index)} className="btn btn-error btn-sm">Remove</button>
                    </div>
                  ))}
                  <button onClick={addType} className="btn btn-primary btn-sm">Add Type</button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Donation Statistics</h2>
          <button
            onClick={handleToggleView}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {showAllTime ? 'Show This Week' : 'Show All Time'}
          </button>
        </div>
        
        <div className="h-[400px]">
          {(showAllTime ? allTimeTransactions : weeklyTransactions).length > 0 ? (
            <Bar data={getChartData()} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No transaction data available</p>
            </div>
          )}
        </div>
      </div>
          <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>
          <button
            type="submit"
            onClick={handleSubmit}
            className={
              "btn mt-2 w-full btn-primary" + (loading ? " loading" : "")
            }
          >
            Update
          </button>
          <button
            onClick={handleDelete}
            className={
              "btn mt-6 w-full text-white bg-red-700" +
              (loading ? " loading" : "")
            }
          >
            Delete
          </button>
        </div>
      )}
    </>
  );
}

export default CampaignDetail;