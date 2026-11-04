import { Trash2 } from "lucide-react";
import "../styles/DeleteListingModal.css";

function DeleteListingModal({
  isOpen,
  onClose,
  onConfirm,
  title,
}) {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay" onClick={onClose}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-icon-wrap">
          <Trash2 size={24} />
        </div>

        <h2>Delete Listing?</h2>

        <p>
          Are you sure you want to delete {title ? `"${title}"` : "this listing"}? This action cannot be undone.
        </p>

        <div className="delete-modal-actions">
          <button
            type="button"
            className="cancel-delete-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="confirm-delete-btn"
            onClick={onConfirm}
          >
            Delete Listing
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteListingModal;
