import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import CreateListingModal from "./CreateListingModal";
import "../styles/Layout.css";

function Layout({
  children,
  searchTerm,
  setSearchTerm,
  category,
  setCategory,
  onSearch,
  onSellItem,
}) {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const savedState = localStorage.getItem("sidebar_open");
      return savedState ? JSON.parse(savedState) : false;
    } catch {
      return false;
    }
  });

  const [globalListingOpen, setGlobalListingOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prevState) => {
      const nextState = !prevState;
      try {
        localStorage.setItem("sidebar_open", JSON.stringify(nextState));
      } catch {
        // ignore
      }
      return nextState;
    });
  };

  const handleSellItem = () => {
    if (onSellItem) {
      onSellItem();
    } else {
      setGlobalListingOpen(true);
    }
  };

  return (
    <div className={`layout-wrapper ${isOpen ? "sidebar-open" : ""}`}>
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className="layout-main-container">
        <Navbar
          isOpen={isOpen}
          toggleSidebar={toggleSidebar}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          category={category}
          setCategory={setCategory}
          onSearch={onSearch}
          onSellItem={handleSellItem}
        />

        <main className="layout-content">{children}</main>
      </div>

      <CreateListingModal
        isOpen={globalListingOpen}
        onClose={() => setGlobalListingOpen(false)}
        onListingCreated={() => {
          setGlobalListingOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
}

export default Layout;
