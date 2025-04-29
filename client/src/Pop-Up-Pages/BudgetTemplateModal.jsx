import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaTimes, FaCheck, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { MdOutlineZoomOutMap, MdOutlineZoomInMap } from "react-icons/md";
import BudgetTrackApi from "../api/BudgetTrackApi";
import { numberToCurrencyString, formatMMMDDYYYY } from "../helper/helper";
import showDialog from "../utils/showDialog";
import { showToast } from "../utils/toastNotifications";

const BudgetTemplateModal = ({ onSelectTemplate, selectedFunds, mode }) => {
  // const [invalidTemplates, setInvalidTemplates] = useState([]);
  const [invalidFields, setInvalidFields] = useState({});
  const [selected, setSelected] = useState(selectedFunds || []);
  const [budgetTemplates, setBudgetTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategories, setShowCategories] = useState({});
  const [isMaximized, setIsMaximized] = useState(false);
  const scrollContainerRef = useRef(null);

  const fetchBudgetTemplates = async () => {
    setLoading(true);
    try {
      const response = await BudgetTrackApi.getTree();
      const transformedData = convertTreeDataToTemplateFormat(response);
      setBudgetTemplates(transformedData);
    } catch (err) {
      setError("Failed to fetch templates. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetTemplates();
  }, []);

  const convertTreeDataToTemplateFormat = (data) => {
    const flattenCategories = (nodes) => {
      return nodes.reduce((acc, node) => {
        const category = {
          _id: node._id,
          CategoryCode: node.code || "N/A",
          CategoryName: node.name || "N/A",
          CategoryBudget: 0,
          CategoryActual: 0,
          CurrentBalance: 0,
          CategoryPercentage: 0,
        };

        acc.push(category);

        if (Array.isArray(node.nodes)) {
          acc.push(...flattenCategories(node.nodes, node.code));
        }

        return acc;
      }, []);
    };

    return data.map((item) => {
      const template = {
        _id: item._id,
        FundsName: item.name || "N/A",
        FundsCode: item.code || "N/A",
        FundsBudget: 0,
        FundsAllocated: 0,
        UnutilizedAmount: 0,
        FundsPercentage: 0,
        Category: flattenCategories(item.nodes || []),
      };
      return template;
    });
  };

  // const handleSelectAllTemplates = () => {
  //   const allTemplates = mode === "edit" ? selectedFunds : budgetTemplates;

  //   for (const template of allTemplates) {
  //     const totalCategoryBudget = template.Category.reduce(
  //       (sum, category) => sum + category.CategoryBudget,
  //       0
  //     );

  //     if (totalCategoryBudget > template.FundsBudget) {
  //       showToast(
  //         `You selected ${
  //           template.FundsName
  //         } with a budget of ${numberToCurrencyString(
  //           template.FundsBudget
  //         )}, but the total category budget is ${numberToCurrencyString(
  //           totalCategoryBudget
  //         )}. This is not allowed.`,
  //         "warning"
  //       );
  //       return;
  //     }
  //   }

  //   onSelectTemplate(allTemplates);
  //   setSelected(allTemplates);
  // };

  const handleSelectAllTemplates = () => {
    const allTemplates = mode === "edit" ? selectedFunds : budgetTemplates;
    const invalidFields = {}; // Store invalid fields here

    for (const template of allTemplates) {
      // Check FundsBudget first
      const totalCategoryBudget = template.Category.reduce(
        (sum, category) => sum + category.CategoryBudget,
        0
      );

      // Check if FundsBudget exceeds totalCategoryBudget
      if (totalCategoryBudget > template.FundsBudget) {
        showToast(
          `You selected ${
            template.FundsName
          } with a budget of ${numberToCurrencyString(
            template.FundsBudget
          )}, but the total category budget is ${numberToCurrencyString(
            totalCategoryBudget
          )}. This is not allowed.`,
          "warning"
        );
        invalidFields[template._id] = { fundsBudget: true };
      }

      // Check individual CategoryBudgets
      template.Category.forEach((category) => {
        if (category.CategoryBudget > template.FundsBudget) {
          if (!invalidFields[template._id]) {
            invalidFields[template._id] = {};
          }
          invalidFields[template._id][category._id] = true;
        }
      });
    }

    setInvalidFields(invalidFields);

    if (Object.keys(invalidFields).length === 0) {
      onSelectTemplate(allTemplates);
      setSelected(allTemplates);
    }
  };

  const handleInputChange = (e, templateId, field, categoryId = null) => {
    const value = parseFloat(e.target.value) || 0;

    // Function to update a specific template field (either Funds or Category)
    const updateTemplate = (templates) => {
      return templates.map((template) => {
        if (template._id === templateId) {
          const updatedTemplate = { ...template };

          if (categoryId !== null) {
            updatedTemplate.Category = updatedTemplate.Category.map(
              (category) => {
                if (category._id === categoryId) {
                  return {
                    ...category,
                    [field]: value,
                    ...(field === "CategoryBudget" && {
                      CurrentBalance: value,
                    }),
                  };
                }
                return category;
              }
            );
          } else {
            updatedTemplate[field] = value;

            if (field === "FundsBudget") {
              updatedTemplate.UnutilizedAmount = value;
            }
          }

          return updatedTemplate;
        }
        return template;
      });
    };

    // Check if we're in edit mode and update accordingly
    if (mode === "edit") {
      const updatedSelectedFunds = updateTemplate(selectedFunds);
      setSelected(updatedSelectedFunds);
      onSelectTemplate(updatedSelectedFunds);
    } else {
      const updatedBudgetTemplates = updateTemplate(budgetTemplates);
      setBudgetTemplates(updatedBudgetTemplates);
    }
  };

  const toggleCategories = useCallback((templateId) => {
    setShowCategories((prevState) => ({
      ...prevState,
      [templateId]: !prevState[templateId],
    }));
  }, []);

  const toggleMaximize = (e) => {
    e.preventDefault();
    setIsMaximized(!isMaximized);
  };

  useEffect(() => {
    if (mode === "edit" && selectedFunds) {
      setSelected(selectedFunds);
      console.log("selected Funds", selectedFunds);
    }
  }, [selectedFunds, mode]);

  return (
    <>
      {isMaximized && (
        <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
      )}
      <div
        className={`${
          isMaximized
            ? "fixed inset-0 z-50 flex items-center justify-center m-10 p-10"
            : "flex items-center justify-center"
        }`}
      >
        <div
          className={`${
            isMaximized
              ? "absolute inset-0 z-50 p-5 bg-white shadow-lg"
              : "relative"
          } bg-white shadow-lg rounded-md w-full transition-all duration-300`}
        >
          <div className="flex justify-between items-center p-2">
            <p className="text-white text-[0.7em] font-bold bg-gray-500 rounded-md p-2 cursor-pointer">
              Budget Templates
            </p>
            <div className="flex-1 m-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectAllTemplates(e);
                }}
                className="text-white text-[0.7em] font-bold bg-green-500 rounded-md p-2 cursor-pointer"
              >
                Save
              </button>
            </div>

            <button
              onClick={toggleMaximize}
              className="text-gray-600 hover:text-gray-800 focus:outline-none z-50 relative group"
            >
              {isMaximized ? (
                <MdOutlineZoomOutMap size={24} />
              ) : (
                <MdOutlineZoomInMap size={24} />
              )}
            </button>
          </div>
          <div
            ref={scrollContainerRef}
            className={`${
              isMaximized
                ? "max-h-[75vh] overflow-y-auto"
                : "h-56 overflow-y-auto"
            }`}
          >
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="overflow-x-auto text-[0.7em] max-h-[65vh]">
                <table className="table-auto w-full border-collapse border border-gray-300 mb-4">
                  <thead className="sticky top-0 z-20 bg-gray-100"> 
                    <tr className="bg-gray-100 ">
                      <th className="border border-gray-300 px-4 py-2">
                        Funds Name
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Funds Code
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Funds Budget
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Funds Allocated
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Funds Expense
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Unutilized Amount
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Funds Percentage
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(mode === "edit" ? selectedFunds : budgetTemplates).map(
                      (template) => (
                        <tr key={template._id} className="hover:bg-gray-100">
                          <td className="border border-gray-300 px-4 py-2">
                            {template.FundsName || "N/A"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {template.FundsCode || "N/A"}
                          </td>
                          {/* <td className="border border-gray-300 px-4 py-2">
                            <input
                              type="number"
                              value={template.FundsBudget}
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  template._id,
                                  "FundsBudget"
                                )
                              }
                              className="border px-2 py-1 w-full"
                            />
                          </td> */}

                          <td className="border border-gray-300 px-4 py-2">
                            <input
                              type="number"
                              value={template.FundsBudget}
                              onChange={(e) =>
                                handleInputChange(
                                  e,
                                  template._id,
                                  "FundsBudget"
                                )
                              }
                              className={`border px-2 py-1 w-full ${
                                invalidFields[template._id]?.fundsBudget
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                          </td>

                          <td className="border border-gray-300 px-4 py-2">
                            {numberToCurrencyString(
                              template.FundsAllocated || 0
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {numberToCurrencyString(
                              template.FundsExpense || 0
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {numberToCurrencyString(
                              template.UnutilizedAmount || 0
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {numberToCurrencyString(
                              template.FundsPercentage || 0
                            )}
                            %
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <div className="flex flex-row items-center justify-between">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleCategories(template._id);
                                }}
                                className="px-4 py-2 text-blue-500 rounded text-center relative group"
                              >
                                {showCategories[template._id] ? (
                                  <FaRegEye size={20} />
                                ) : (
                                  <FaRegEyeSlash size={20} />
                                )}
                                <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                                  {showCategories[template._id]
                                    ? "Hide Categories"
                                    : "Show Categories"}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
                {(mode === "edit" ? selectedFunds : budgetTemplates).map(
                  (template) =>
                    showCategories[template._id] ? (
                      <div key={template._id} className="mt-4 ">
                        <h3 className="text-xl font-semibold sticky top-0 z-20 bg-gray-100 mb-10">
                          Categories for {template.FundsName}
                        </h3>
                        <table className="table-auto w-full border-collapse border border-gray-300 mt-4">
                          <thead className="sticky top-0 z-20 bg-gray-100">
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 px-4 py-2">
                                Category Code
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Category Name
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Category Budget
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Category Actual
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Current Balance
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Category Percentage
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {template.Category.map((category) => (
                              <tr key={category._id} className="cursor-pointer">
                                <td className="border border-gray-300 px-4 py-2">
                                  {category.CategoryCode}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {category.CategoryName}
                                </td>
                                {/* <td className="border border-gray-300 px-4 py-2">
                                  <input
                                    type="number"
                                    value={category.CategoryBudget}
                                    onChange={(e) => {
                                      handleInputChange(
                                        e,
                                        template._id,
                                        "CategoryBudget",
                                        category._id
                                      );
                                    }}
                                    className="border px-2 py-1 w-full"
                                  />
                                </td> */}
                                <td className="border border-gray-300 px-4 py-2">
                                  <input
                                    type="number"
                                    value={category.CategoryBudget}
                                    onChange={(e) => {
                                      handleInputChange(
                                        e,
                                        template._id,
                                        "CategoryBudget",
                                        category._id
                                      );
                                    }}
                                    className={`border px-2 py-1 w-full ${
                                      invalidFields[template._id]?.[
                                        category._id
                                      ]
                                        ? "border-red-500"
                                        : ""
                                    }`}
                                  />
                                </td>

                                <td className="border border-gray-300 px-4 py-2">
                                  {numberToCurrencyString(
                                    category.CategoryActual || 0
                                  )}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {numberToCurrencyString(
                                    category.CurrentBalance || 0
                                  )}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {numberToCurrencyString(
                                    category.CategoryPercentage || 0
                                  )}
                                  %
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BudgetTemplateModal;
