import { LogOut } from "lucide-react";
import "../styles/LogoutModal.css";

function LogoutModal({
  isOpen,
  onClose,
  onLogout,
}) {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay" onClick={onClose}>
      <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="logout-icon-wrap">
          <LogOut size={26} />
        </div>

        <h2>Log Out?</h2>

        <p>
          Are you sure you want to log out of your SmallThings account? You will need to sign back in to access saved items, listings, and messages.
        </p>

        <div className="logout-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="logout-btn"
            onClick={onLogout}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;
