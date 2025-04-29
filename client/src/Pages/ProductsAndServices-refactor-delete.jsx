import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaFileExcel,
  FaEye,
} from "react-icons/fa";
import ProductModal from "../Pop-Up-Pages/ProductsModal";
import ServicesModal from "../Pop-Up-Pages/ServicesModal";
import FileNameModal from "../Pop-Up-Pages/FileNameModal";
import ImageModal from "../Pop-Up-Pages/ImageModal"; // Import the ImageModal
import * as XLSX from "xlsx";
import { showToast } from "../utils/toastNotifications";
import showDialog from "../utils/showDialog";
import useProductsAndServicesLogic from "../context/useProductsAndServicesLogic;"; // Adjust the import
import ProductsAndServicesApi from "../api/ProductsAndServicesApi";
import SalesShortcuts from "../Components/SalesShortcuts";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";


const ProductsAndServices = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [isFileNameModalOpen, setIsFileNameModalOpen] = useState(false);
  const [fileName, setFileName] = useState("products");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(""); // To hold the image source for the ImageModal
  const { products, setProducts, loading, totalItems, setSearchQuery } =
    useProductsAndServicesLogic(page, limit);
  const { services, setServices } = useProductsAndServicesLogic(page, limit); // Separate state for services

  const [activeTab, setActiveTab] = useState("products"); // State for managing tabs

  useEffect(() => {
    setSearchQuery(query);
  }, [query, setSearchQuery]);

  // Modal Close Handlers
  const handleProductModalClose = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  const handleServiceModalClose = () => {
    setIsServiceModalOpen(false);
    setSelectedService(null);
  };

  // Modal Open Handlers
  const handleModalOpenForAdd = () => {
    setModalMode("add");
    if (activeTab === "products") {
      setIsProductModalOpen(true);
    } else {
      setIsServiceModalOpen(true);
    }
  };

  const handleModalOpenForEdit = (item) => {
    setModalMode("edit");
    if (activeTab === "products") {
      setSelectedProduct(item);
      setIsProductModalOpen(true);
    } else {
      setSelectedService(item);
      setIsServiceModalOpen(true);
    }
  };

  // Delete Handler
  const handleDelete = async (itemId) => {
    const confirmed = await showDialog.confirm(
      `Are you sure you want to delete this ${activeTab.slice(0, -1)}?`
    );
    if (!confirmed) return;

    if (activeTab === "products") {
      await ProductsAndServicesApi.deleteProduct(itemId);
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== itemId)
      );
      showToast("Product deleted successfully!", "success");
    } else {
      await ProductsAndServicesApi.deleteService(itemId);
      setServices((prevServices) =>
        prevServices.filter((service) => service._id !== itemId)
      );
      showToast("Service deleted successfully!", "success");
    }
  };

  // Save Handlers
  const handleSaveProduct = (product) => {
    if (modalMode === "add") {
      setProducts((prevProducts) => [...prevProducts, product]);
      showToast("Product added successfully!", "success");
    } else {
      setProducts((prevProducts) =>
        prevProducts.map((prod) =>
          prod._id === product._id ? { ...prod, ...product } : prod
        )
      );
      showToast("Product updated successfully!", "success");
    }
    handleProductModalClose();
  };

  const handleSaveService = (service) => {
    if (modalMode === "add") {
      setServices((prevServices) => [...prevServices, service]);
      showToast("Service added successfully!", "success");
    } else {
      setServices((prevServices) =>
        prevServices.map((serv) =>
          serv._id === service._id ? { ...serv, ...service } : serv
        )
      );
      showToast("Service updated successfully!", "success");
    }
    handleServiceModalClose();
  };

  // Export Handlers
  const exportToExcel = (name) => {
    const dataToExport =
      activeTab === "products"
        ? products.map((product) => ({
            Name: product.name,
            SKU: product.sku,
            Description: product.description,
            Price: product.price,
            DateCreated: product.dateTimestamp
              ? new Date(product.dateTimestamp).toLocaleString()
              : "N/A",
            DateUpdated: product.dateUpdated
              ? new Date(product.dateUpdated).toLocaleString()
              : "N/A",
          }))
        : services.map((service) => ({
            Name: service.name,
            Description: service.description,
            Price: service.price,
            DateCreated: service.dateTimestamp
              ? new Date(service.dateTimestamp).toLocaleString()
              : "N/A",
            DateUpdated: service.dateUpdated
              ? new Date(service.dateUpdated).toLocaleString()
              : "N/A",
          }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      activeTab === "products" ? "Products" : "Services"
    );
    XLSX.writeFile(wb, `${name}.xlsx`);
  };

  const handleExportClick = () => {
    setIsFileNameModalOpen(true);
  };

  const handleFileNameSave = (name) => {
    setFileName(name);
    exportToExcel(name);
    setIsFileNameModalOpen(false);
  };

  const handleImageClick = (image) => {
    setImageSrc(
      image.startsWith("data:image/") ? image : `data:image/png;base64,${image}`
    );
    setIsImageModalOpen(true);
  };

  const columns = [
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Description", selector: (row) => row.description, sortable: true },
    { name: "Price", selector: (row) => <span>PHP {numberToCurrencyString(row.price)}</span>, sortable: true },
    {
      name: "Date Created",
      selector: (row) => formatReadableDate(row.dateTimestamp),
      sortable: true,
    },
    {
      name: "Date Updated",
      selector: (row) => formatReadableDate(row.dateUpdated),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleModalOpenForEdit(row)}
            className="text-white bg-blue-600 p-2 rounded-md"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-white bg-red-600 p-2 rounded-md"
          >
            <FaTrash size={16} />
          </button>
          {row.productImage || row.serviceImage ? (
            <button
              onClick={() =>
                handleImageClick(row.productImage || row.serviceImage)
              }
              className="text-white bg-green-600 p-2 rounded-md"
            >
              <FaEye size={16} />
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  // Expandable row component
  const expandedRowComponent = ({ data }) => (
    <div className="p-4">
      {/* <p>
        <strong>ID:</strong> {data._id}
      </p> */}
      <p>
        <strong>Name:</strong> {data.name}
      </p>
      <p>
        <strong>Description:</strong> {data.description}
      </p>
      <p>
       <strong>Price:</strong> PHP {numberToCurrencyString(data.price)}
      </p>
      <p>
        <strong>Date Created:</strong>{" "}
        {formatReadableDate(data.dateTimestamp)}
      </p>
      <p>
        <strong>Date Updated:</strong>{" "}
        {formatReadableDate(data.dateUpdated)}
      </p>
    </div>
  );
  return (
    <>
    <SalesShortcuts />
    <div className="mx-auto p-8">
      <div className="flex flex-col sm:flex-row items-center mb-4 mx-4 sm:justify-between space-y-4 sm:space-y-0">
        <h1 className="font-bold">Products & Services</h1>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder={`Search ${activeTab}`}
            className="border p-2 rounded-md"
            onChange={(e) => setQuery(e.target.value)}
          />

          <button
            onClick={handleModalOpenForAdd}
            className="bg-blue-600 text-white rounded-md px-6 py-2 text-sm hover:scale-105 transition transform duration-300 flex items-center"
          >
            <FaPlus size={16} className="mr-2" />
            Add {activeTab === "products" ? "Product" : "Service"}
          </button>

          <button
            onClick={handleExportClick}
            className="bg-green-600 text-white p-2 rounded-md flex items-center"
          >
            <FaFileExcel size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "products"
              ? "bg-blue-600 text-white"
              : "bg-gray-300 text-gray-700"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "services"
              ? "bg-blue-600 text-white"
              : "bg-gray-300 text-gray-700"
          }`}
        >
          Services
        </button>
      </div>

      <DataTable
        columns={columns}
        data={activeTab === "products" ? products : services}
        pagination
        paginationServer
        paginationTotalRows={totalItems}
        onChangePage={setPage}
        onChangeRowsPerPage={setLimit}
        progressPending={loading}
        expandableRows
        expandableRowsComponent={expandedRowComponent}
      />

      {isProductModalOpen && (
        <ProductModal
          mode={modalMode}
          isOpen={isProductModalOpen}
          onClose={handleProductModalClose}
          onSaveProduct={handleSaveProduct}
          product={selectedProduct}
        />
      )}

      {isServiceModalOpen && (
        <ServicesModal
          mode={modalMode}
          isOpen={isServiceModalOpen}
          onClose={handleServiceModalClose}
          onSaveService={handleSaveService}
          service={selectedService}
        />
      )}

      {isFileNameModalOpen && (
        <FileNameModal
          isOpen={isFileNameModalOpen}
          onClose={() => setIsFileNameModalOpen(false)}
          onSave={handleFileNameSave}
        />
      )}

      {isImageModalOpen && (
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          imageSrc={imageSrc}
        />
      )}
    </div>
    </>
  );
};

export default ProductsAndServices;
