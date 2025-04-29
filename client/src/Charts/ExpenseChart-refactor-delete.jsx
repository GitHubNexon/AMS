import React, { useState, useEffect } from "react";
import { Chart as ChartJS, Title, Legend, ArcElement } from "chart.js";
import { Pie } from "react-chartjs-2";
import { useLoader } from "../context/useLoader";
import { FaSync } from "react-icons/fa";
import { numberToCurrencyString } from "../helper/helper";
import billsApi from "../api/billsApi"; 
import { showToast } from "../utils/toastNotifications";
import NotesComponent from "../Components/NotesComponent";


ChartJS.register(Title, Legend, ArcElement);

const ExpenseChart = () => {
  const [expenseData, setExpenseData] = useState([]);
  const [liabilityData, setLiabilityData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    expenseEntries: [],
    liabilityEntries: [],
  });
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [selectedLiabilities, setSelectedLiabilities] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const { loading, setLoading } = useLoader();

  const [currentExpensePage, setCurrentExpensePage] = useState(1);
  const [currentLiabilityPage, setCurrentLiabilityPage] = useState(1);
  const itemsPerPage = 10;

  const fetchExpenseData = async () => {
    loading(true); 
    try {
      const response = await billsApi.getAllBills(); 
      const expenses = processExpenses(response.bills || []); 
      const liabilities = processLiabilities(response.bills || []); 
      setExpenseData(expenses); 
      setLiabilityData(liabilities);
      setModalContent(createModalContent(expenses, liabilities));
    } catch (error) {
      console.error("Error fetching expense data:", error);
      showToast("Failed to fetch expense data.", "error");
    } finally {
      loading(false); 
    }
  };

  const processExpenses = (bills) => {
    const expenses = {};
    bills.forEach((bill) => {
      bill.payment.forEach((payment) => {
        const amount = payment.amount || 0; 
        const category = payment.account?.name;

        if (!expenses[category]) {
          expenses[category] = {
            total: 0,
          };
        }
        expenses[category].total += amount; 
      });
    });
    return expenses;
  };

  const processLiabilities = (bills) => {
    const liabilities = {};
    bills.forEach((bill) => {
      bill.categoryDetails.forEach((categoryDetail) => {
        const amount = categoryDetail.amount || 0; 
        const description = categoryDetail.category.name; 

        if (!liabilities[description]) {
          liabilities[description] = {
            total: 0,
          };
        }

        liabilities[description].total += amount; 
      });
    });
    return liabilities;
  };

  useEffect(() => {
    fetchExpenseData();
  }, []);

  const handleRefresh = () => {
    setIsAnimating(true);
    setTimeout(async () => {
      try {
        await fetchExpenseData();
        showToast("Data synced successfully.", "success");
      } catch (error) {
        showToast("Failed to sync latest data. Please try again.", "error");
      } finally {
        setIsAnimating(false);
      }
    }, 3000);
  };

  const prepareChartData = (data, selected) => {
    const filteredData = Object.entries(data).filter(([key]) =>
      selected.includes(key)
    );
    const labels = filteredData.map(([key]) => key);
    const chartData = filteredData.map(([, value]) => value.total);
    return {
      labels,
      datasets: [
        {
          label: "Monthly Expenses",
          data: chartData,
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
          borderColor: "rgba(255, 255, 255, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const options = {
    plugins: {
      legend: {
        display: false, 
      },
      tooltip: {
        enabled: true, 
      },
    },
  };

  const totalLiabilities = Object.values(liabilityData).reduce(
    (acc, curr) => acc + curr.total,
    0
  );
  const totalExpenses = Object.values(expenseData).reduce(
    (acc, curr) => acc + curr.total,
    0
  );

  const createModalContent = (expenses, liabilities) => {
    const expenseEntries = Object.entries(expenses).map(([key, value]) => ({
      category: key,
      amount: value.total,
    }));
    const liabilityEntries = Object.entries(liabilities).map(
      ([key, value]) => ({
        category: key,
        amount: value.total,
      })
    );

    setSelectedExpenses(
      expenseEntries.slice(0, 5).map((item) => item.category)
    );
    setSelectedLiabilities(
      liabilityEntries.slice(0, 5).map((item) => item.category)
    );

    return {
      expenseEntries: expenseEntries,
      liabilityEntries: liabilityEntries,
    }; 
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCheckboxChange = (category, type) => {
    if (type === "expense") {
      setSelectedExpenses((prevSelected) =>
        prevSelected.includes(category)
          ? prevSelected.filter((item) => item !== category)
          : [...prevSelected, category]
      );
    } else {
      setSelectedLiabilities((prevSelected) =>
        prevSelected.includes(category)
          ? prevSelected.filter((item) => item !== category)
          : [...prevSelected, category]
      );
    }
  };

  const handleConfirmSelection = () => {
    setShowModal(false);
  };

  const handleExpensePageChange = (newPage) => {
    setCurrentExpensePage(newPage);
  };

  const handleLiabilityPageChange = (newPage) => {
    setCurrentLiabilityPage(newPage);
  };

  const indexOfLastExpense = currentExpensePage * itemsPerPage;
  const indexOfFirstExpense = indexOfLastExpense - itemsPerPage;
  const currentExpenses = modalContent.expenseEntries.slice(
    indexOfFirstExpense,
    indexOfLastExpense
  );

  const indexOfLastLiability = currentLiabilityPage * itemsPerPage;
  const indexOfFirstLiability = indexOfLastLiability - itemsPerPage;
  const currentLiabilities = modalContent.liabilityEntries.slice(
    indexOfFirstLiability,
    indexOfLastLiability
  );

  const expenseNotes = [
    "• Total Expense: Represents the overall amount spent across different categories.",
    "• Total Liabilities: Reflects the total amount billed across various categories, including any unpaid bills.",
    "• Pie Chart Visualization: The pie chart displays the distribution of expenses by category, offering insights into spending patterns."
  ];
  

  return (
    <div className="p-20 bg-white shadow-md rounded-lg w-full h-auto flex items-center justify-center flex-col">
      <h2 className="text-2xl font-semibold mb-4">Expense Breakdown</h2>

      {/* Financial Summary */}
      <div className="p-4 w-full bg-gray-50 rounded-md shadow-md mt-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          Financial Summary
        </h3>
        <div className="flex justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-gray-600">Total Expense:</span>
            <span className="text-xl font-bold text-green-600">
              PHP {numberToCurrencyString(totalExpenses)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600">
              Total Liabilities Amount:
            </span>
            <span className="text-xl font-bold text-green-600">
              PHP {numberToCurrencyString(totalLiabilities)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-5 mt-10">
        <button
          onClick={handleRefresh}
          className="flex items-center p-2 border rounded hover:bg-gray-200"
        >
          <FaSync className={`mr-2 ${isAnimating ? "spin" : ""}`} />
          Sync Latest Data
        </button>
        <button
          onClick={handleShowModal}
          className="flex items-center bg-blue-500 text-white p-2 rounded"
        >
          Show Details
        </button>
      </div>

      <div className="flex w-full space-x-8 mt-4">
        <div className="flex flex-col items-center w-full">
          <h3 className="text-xl font-semibold mb-2">Expenses</h3>
          <div className="w-full flex items-center justify-center">
            <Pie
              data={prepareChartData(expenseData, selectedExpenses)}
              options={options}
            />
          </div>
        </div>
        <div className="flex flex-col items-center w-full">
          <h3 className="text-xl font-semibold mb-2">Liabilities</h3>
          <div className="w-full flex items-center justify-center">
            <Pie
              data={prepareChartData(liabilityData, selectedLiabilities)}
              options={options}
            />
          </div>
        </div>
      </div>

      <div className="flex item-start justify-start w-full mt-4">
          <NotesComponent
            notes={expenseNotes}
            title="Expense and Liability Overview"
          />
        </div>

      {/* Modal for Details */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg w-full m-10 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Select Categories</h3>

            <div className="flex space-x-8">
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Expenses:</h4>
                <div className="overflow-auto max-h-56">
                  {" "}
                  <table className="min-w-full border-collapse border border-gray-200 mb-4">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 p-2 text-left text-[0.7em]">
                          Category
                        </th>
                        <th className="border border-gray-300 p-2 text-left text-[0.7em]">
                          Amount
                        </th>
                        <th className="border border-gray-300 p-2 text-left text-[0.7em]">
                          Select
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentExpenses.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-2 text-[0.6em]">
                            {item.category}
                          </td>
                          <td className="border border-gray-300 p-2 text-[0.6em]">
                            PHP {numberToCurrencyString(item.amount)}
                          </td>
                          <td className="border border-gray-300 p-2 text-[0.6em]">
                            <input
                              type="checkbox"
                              id={`expense-${item.category}`}
                              checked={selectedExpenses.includes(item.category)}
                              onChange={() =>
                                handleCheckboxChange(item.category, "expense")
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between mt-2">
                  <button
                    onClick={() =>
                      handleExpensePageChange(currentExpensePage - 1)
                    }
                    disabled={currentExpensePage === 1}
                    className="text-blue-500"
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentExpensePage} of{" "}
                    {Math.ceil(
                      modalContent.expenseEntries.length / itemsPerPage
                    )}
                  </span>
                  <button
                    onClick={() =>
                      handleExpensePageChange(currentExpensePage + 1)
                    }
                    disabled={
                      indexOfLastExpense >= modalContent.expenseEntries.length
                    }
                    className="text-blue-500"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <h4 className="font-semibold mb-2">Liabilities:</h4>
                <div className="overflow-auto max-h-56">
                  {" "}
                  <table className="min-w-full border-collapse border border-gray-200 mb-4">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 p-2 text-left text-[0.7em]">
                          Category
                        </th>
                        <th className="border border-gray-300 p-2 text-left text-[0.7em]">
                          Amount
                        </th>
                        <th className="border border-gray-300 p-2 text-left text-[0.7em]">
                          Select
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentLiabilities.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-2 text-[0.6em]">
                            {item.category}
                          </td>
                          <td className="border border-gray-300 p-2 text-[0.6em]">
                            PHP {numberToCurrencyString(item.amount)}
                          </td>
                          <td className="border border-gray-300 p-2 text-[0.6em]">
                            <input
                              type="checkbox"
                              id={`liability-${item.category}`}
                              checked={selectedLiabilities.includes(
                                item.category
                              )}
                              onChange={() =>
                                handleCheckboxChange(item.category, "liability")
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between mt-2">
                  <button
                    onClick={() =>
                      handleLiabilityPageChange(currentLiabilityPage - 1)
                    }
                    disabled={currentLiabilityPage === 1}
                    className="text-blue-500"
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentLiabilityPage} of{" "}
                    {Math.ceil(
                      modalContent.liabilityEntries.length / itemsPerPage
                    )}
                  </span>
                  <button
                    onClick={() =>
                      handleLiabilityPageChange(currentLiabilityPage + 1)
                    }
                    disabled={
                      indexOfLastLiability >=
                      modalContent.liabilityEntries.length
                    }
                    className="text-blue-500"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4 items-center">
              <button
                onClick={handleConfirmSelection}
                className="bg-blue-500 text-white p-2 rounded"
              >
                Confirm Selection
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-black p-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;
