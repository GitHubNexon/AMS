import React, { useState, useEffect } from 'react';
import axios from 'axios';
const AccountNode = ({ account, depth = 0, selectedAccounts, setSelectedAccounts }) => {
    const isChecked = selectedAccounts.includes(account.code);

    const handleCheckboxChange = (checked) => {
        const updateSelection = (node, add) => {
            const codes = [];
            const traverse = (n) => {
                codes.push(n.code);
                if (n.nodes) {
                    n.nodes.forEach(traverse);
                }
            };
            traverse(node);
            return add
                ? [...new Set([...selectedAccounts, ...codes])]
                : selectedAccounts.filter(code => !codes.includes(code));
        };

        setSelectedAccounts(prev => updateSelection(account, checked));
    };

    return (
        <div style={{ marginLeft: `${depth * 20}px` }}>
            <div style={{ display: 'flex', alignItems: 'center' }} className={`${isChecked && 'bg-green-100'}`}>
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleCheckboxChange(e.target.checked)}
                />
                <button className='font-bold mr-2 underline w-[85px]'>{account.code}</button>
                <span>{account.name}</span>
            </div>

            {account.nodes && account.nodes.length > 0 && (
                <div>
                    {account.nodes.map((childAccount) => (
                        <AccountNode
                            key={childAccount._id}
                            account={childAccount}
                            depth={depth + 1}
                            selectedAccounts={selectedAccounts}
                            setSelectedAccounts={setSelectedAccounts}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


const Tree = ({ accounts, selectedAccounts, setSelectedAccounts }) => {
    return (
        <div>
            {
                accounts.map((rootAccount, index) => (
                    <div key={index}>
                        <AccountNode
                            account={rootAccount}
                            selectedAccounts={selectedAccounts}
                            setSelectedAccounts={setSelectedAccounts}
                            depth={0}
                        />
                        <div className='h-[25px]'></div>
                    </div>
                ))
            }
        </div>
    );
};

function AccountsTreePicker({ selectedAccounts, setSelectedAccounts }) {
    const [treeData, setTreeData] = useState([]);

    useEffect(() => {
        fetchTree();
    }, []);

    async function fetchTree() {
        const response = await axios.get('/reports/tree', { withCredentials: true });
        setTreeData(response.data);
    }

    return (
        <div>
            <div className='h-[70vh] overflow-y-scroll p-5'>
                <Tree
                    accounts={treeData}
                    selectedAccounts={selectedAccounts}
                    setSelectedAccounts={setSelectedAccounts}
                />
            </div>
        </div>
    );
}

export default AccountsTreePicker;
