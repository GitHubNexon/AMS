import { useState } from "react";
import { showToast } from "../utils/toastNotifications";
export const useJournalFormLogic = () => {
  const [selectedMode, setSelectedMode] = useState("");
  const [formData, setFormData] = useState({
    jvNo: "",
    jvDate: "",
  });

  const [ledgers, setLedgers] = useState([
    {
      id: Date.now(),
      jvNo: "",
      date: "",
      type: "dr",
      ledger: "",
      subLedger: "",
      amount: "",
      tax: "",
      ref: "",
      narration: "", // Add narration field
    },
    {
      id: Date.now() + 1,
      jvNo: "",
      date: "",
      type: "cr",
      ledger: "",
      subLedger: "",
      amount: "",
      tax: "",
      ref: "",
      narration: "", // Add narration field
    },
  ]);

  const handleRadioChange = (event) => {
    const mode = event.target.value;
    setSelectedMode(mode);
    setFormData((prev) => ({ ...prev, paymentMode: mode }));
  };

  const handleJournalFormSubmit = () => {
    showToast("You successfully submitted a journal.", "success");
  };

  const handleAddLedger = () => {
    const newLedgers = [
      {
        id: Date.now(),
        jvNo: "",
        date: "",
        type: "dr", // Set the type to Debit
        ledger: "",
        subLedger: "",
        amount: "",
        tax: "",
        ref: "",
        narration: "", // Add narration field
      },
      {
        id: Date.now() + 1, // Ensure a unique ID for the second entry
        jvNo: "",
        date: "",
        type: "cr", // Set the type to Credit
        ledger: "",
        subLedger: "",
        amount: "",
        tax: "",
        ref: "",
        narration: "", // Add narration field
      },
    ];

    setLedgers((prev) => [...prev, ...newLedgers]);
  };

  const handleDeleteLedger = (index) => {
    setLedgers((prevLedgers) => {
      const updatedLedgers = [...prevLedgers];
      updatedLedgers.splice(index, 2); // Remove two entries (dr and cr)
      return updatedLedgers;
    });
  };

  const handleReset = () => {
    setFormData({ jvNo: "", jvDate: "" });
    setLedgers([
      {
        id: Date.now(),
        jvNo: "",
        date: "",
        type: "dr",
        ledger: "",
        subLedger: "",
        amount: "",
        tax: "",
        ref: "",
        narration: "",
      },
      {
        id: Date.now() + 1,
        jvNo: "",
        date: "",
        type: "cr",
        ledger: "",
        subLedger: "",
        amount: "",
        tax: "",
        ref: "",
        narration: "",
      },
    ]);
    setSelectedMode("");
  };

  return {
    selectedMode,
    formData,
    ledgers,
    handleRadioChange,
    handleJournalFormSubmit,
    handleAddLedger,
    handleDeleteLedger,
    handleReset,
    setLedgers,
  };
};

export default useJournalFormLogic;
