import { useNavigate } from "react-router-dom";
import logoBlack from "../assets/smallthingsICON-green-black0.png";
import logoWhite from "../assets/smallthingsICON-green-white.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faSun,
  faMoon,
  faPlus,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../context/useTheme";
import "../styles/Navbar.css";

function Navbar({
  isOpen,
  toggleSidebar,
  searchTerm = "",
  setSearchTerm,
  category = "",
  setCategory,
  onSearch,
  onSellItem,
}) {
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearch) {
      onSearch();
    }
  };

  const handleSellClick = () => {
    if (onSellItem) {
      onSellItem();
    } else {
      navigate("/marketplace?action=sell");
    }
  };

  return (
    <header className={`header ${isOpen ? "sidebar-open" : ""}`}>
      {toggleSidebar && (
        <button
          type="button"
          className="nav-hamburger-btn"
          onClick={toggleSidebar}
          aria-label="Toggle navigation drawer"
          title="Open menu"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      )}

      <div className="logo" onClick={() => navigate("/marketplace")}>
        <img
          src={darkMode ? logoWhite : logoBlack}
          alt="SmallThings Logo"
          className="logo-img"
        />
        <h2>
          Small<span>Things</span>
        </h2>
      </div>

      <div className="searchBar">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />

        <input
          type="text"
          placeholder="Search marketplace products..."
          className="inputSearch"
          value={searchTerm}
          onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {setCategory && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            id="categoryFilter"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Books & Media">Books & Media</option>
            <option value="Home & Living">Home & Living</option>
            <option value="Toys & Games">Toys & Games</option>
            <option value="Sports & Outdoor">Sports & Outdoor</option>
          </select>
        )}

        <button
          className="searchitem"
          onClick={onSearch}
          title="Search"
          type="button"
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>

      <div className="buttons">
        <button
          className="sellitem-btn"
          onClick={handleSellClick}
          type="button"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Sell Item</span>
        </button>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
          type="button"
        >
          <FontAwesomeIcon
            icon={darkMode ? faSun : faMoon}
            className={darkMode ? "sun-icon" : "moon-icon"}
          />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
