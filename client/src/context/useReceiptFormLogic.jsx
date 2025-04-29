import { useState } from "react";

export const useReceiptFormLogic = () => {
  const [selectedMode, setSelectedMode] = useState("");
  const [formData, setFormData] = useState({
    crNo: "",
    entryType: "",
    crDate: "",
    accountName: "",
    paymentMode: "",
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

  const handleRadioChange = (event) => {
    setSelectedMode(event.target.value);
    setFormData({ ...formData, paymentMode: event.target.value });
  };

  const handleReceiptFormSubmit = (e) => {
    e.preventDefault();
    const result = handleReceiptSubmission(formData);
    alert(result.message);
  };

  const handleAddLedger = () => {
    setLedgers([
      ...ledgers,
      { id: Date.now(), type: "", ledger: "", subLedger: "", total: "" },
    ]);
  };

  const handleDeleteLedger = (id) => {
    setLedgers(ledgers.filter((ledger) => ledger.id !== id));
  };

  const handleAddTax = () => {
    setTaxes([
      ...taxes,
      {
        id: Date.now(),
        ledger: "",
        subLedger: "",
        taxCode: "",
        taxBase: "",
        tax: "",
      },
    ]);
  };

  const handleDeleteTax = (id) => {
    setTaxes(taxes.filter((tax) => tax.id !== id));
  };

  // Reset form, ledgers, and taxes
  const handleReset = () => {
    setFormData({
      crNo: "",
      entryType: "",
      crDate: "",
      accountName: "",
      paymentMode: "",
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
    setLedgers([
      { id: Date.now(), type: "", ledger: "", subLedger: "", total: "" },
    ]);
    setTaxes([
      {
        id: Date.now(),
        ledger: "",
        subLedger: "",
        taxCode: "",
        taxBase: "",
        tax: "",
      },
    ]);
    setSelectedMode("");
  };

  return {
    selectedMode,
    formData,
    ledgers,
    taxes,
    handleRadioChange,
    handleReceiptFormSubmit,
    handleAddLedger,
    handleDeleteLedger,
    handleAddTax,
    handleDeleteTax,
    handleReset,
  };
};

export default useReceiptFormLogic;
