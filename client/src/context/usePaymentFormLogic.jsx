import { useState } from "react";

export const usePaymentFormLogic = () => {
  const [selectedMode, setSelectedMode] = useState("");
  const [formData, setFormData] = useState({
    dvNo: "",
    checkNo: "",
    dvDate: "",
    paymentEntity: "",
    ledgerType: "",
    ledger: "",
    subLedger: "",
    taxCode: "",
    taxBase: "",
    tax: "",
    total: "",
    particular: "",
    file: "",
    taxLedger: "",
    taxSubLedger: "",
    preparedBy: "",
    reviewedBy: "",
    approvedBy: "",
    tag: "",
  });

  // for default
  const [ledgers, setLedgers] = useState([
    { id: Date.now(), type: "", ledger: "", subLedger: "", total: "" },
  ]);

  const [taxes, setTaxes] = useState([
    {
      id: Date.now(),
      ledger: "",
      subLedger: "",
      taxCode: "",
      taxBase: "",
      tax: "",
    },
  ]);

// submit logic

  const handlePaymentFormSubmit = (event) => {
    event.preventDefault();
    const result = handlePaymentFormSubmit(formData);
    alert(result.message);
  };

  const handleAddLedger = () => {
    const newLedger = {
      id: ledgers.length ? ledgers[ledgers.length - 1].id + 1 : 1,
    };
    setLedgers([...ledgers, newLedger]);
  };

  const handleDeleteLedger = (id) => {
    setLedgers(ledgers.filter((ledger) => ledger.id !== id));
  };

  const handleAddTax = () => {
    const newTax = {
      id: taxes.length ? taxes[taxes.length - 1].id + 1 : 1,
    };
    setTaxes([...taxes, newTax]);
  };

  const handleDeleteTax = (id) => {
    setTaxes(taxes.filter((tax) => tax.id !== id));
  };

  const handleReset = () => {
    setSelectedMode("");
    setLedgers([]);
    setTaxes([]);
  };

  return {
    selectedMode,
    ledgers,
    taxes,
    handlePaymentFormSubmit,
    handleAddLedger,
    handleDeleteLedger,
    handleAddTax,
    handleDeleteTax,
    handleReset,
  };
};
