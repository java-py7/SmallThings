import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { UploadCloud, X } from "lucide-react";
import api from "../services/api";
import "../styles/CreateListingModal.css";

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Furniture",
  "Books",
  "Vehicles",
  "Sports",
  "Collectibles",
  "Other",
];

const CONDITIONS = [
  "New",
  "Like New",
  "Good",
  "Fair",
  "Poor",
];

function CreateListingModal({
  isOpen,
  onClose,
  onListingCreated,
  editingProduct,
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editingProduct) {
      setTitle("");
      setCategory("");
      setPrice("");
      setCondition("");
      setDescription("");
      setImages([]);
      return;
    }

    setTitle(editingProduct.title || "");
    setCategory(editingProduct.category || "");
    setPrice(editingProduct.price ? String(editingProduct.price) : "");
    setCondition(editingProduct.condition || "");
    setDescription(editingProduct.description || "");
    setImages(editingProduct.images || []);
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const processFiles = (files) => {
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed per listing");
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => (prev.length < 5 ? [...prev, reader.result] : prev));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !category || !price || !condition) {
      toast.error("Please fill in all required fields");
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error("Please enter a valid price greater than 0");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        price: numPrice,
        category,
        condition,
        description: description.trim(),
        images,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        toast.success("Listing updated successfully");
      } else {
        await api.post("/products", payload);
        toast.success("Listing created successfully!");
      }

      onClose();
      if (onListingCreated) {
        onListingCreated();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{editingProduct ? "Edit Listing" : "Create New Listing"}</h3>
            <p className="modal-subtitle">
              {editingProduct
                ? "Update your product details and photos"
                : "List an item for sale in the SmallThings marketplace"}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="listing-title">
              Product Title <span className="req">*</span>
            </label>
            <input
              id="listing-title"
              type="text"
              placeholder="e.g. Sony WH-1000XM4 Wireless Headphones"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Category & Condition */}
          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="listing-category">
                Category <span className="req">*</span>
              </label>
              <select
                id="listing-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="listing-condition">
                Condition <span className="req">*</span>
              </label>
              <select
                id="listing-condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                required
              >
                <option value="">Select Condition</option>
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price */}
          <div className="form-group">
            <label htmlFor="listing-price">
              Price (₹) <span className="req">*</span>
            </label>
            <input
              id="listing-price"
              type="number"
              placeholder="e.g. 4500"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="listing-description">Description</label>
            <textarea
              id="listing-description"
              rows={4}
              placeholder="Describe condition, reason for selling, accessories included, and pick-up details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Image Upload Area */}
          <div className="form-group">
            <label>Product Images ({images.length}/5)</label>
            {images.length < 5 && (
              <label className="custom-file-upload">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                <UploadCloud size={28} />
                <span>Upload Photos (Max 5, up to 5MB each)</span>
              </label>
            )}

            {images.length > 0 && (
              <div className="image-preview">
                {images.map((img, i) => (
                  <div key={i} className="preview-card">
                    <img src={img} alt={`Preview ${i + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      title="Remove image"
                      aria-label="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-listing-btn"
              disabled={submitting}
            >
              {submitting
                ? "Saving Listing..."
                : editingProduct
                ? "Update Listing"
                : "Publish Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateListingModal;
