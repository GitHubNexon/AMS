import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';

const AccountNode = ({ account, isLast = false, depth = 0, callback }) => {
    // Recursively render child accounts (nodes)
    return (
        <div style={{ marginLeft: `${depth * 20}px` }} data-id={`${account.code} - ${account.name}`}>
            <div className={`text-[0.8em] ${account.nodes == 0 && isLast && 'mb-4'}`} style={{ display: 'flex', alignItems: 'center' }}>
                <button className='font-bold mr-2 underline w-[85px]' onClick={()=>callback(account)}>{ account.code }</button>
                <span className=''> - {account.name}</span>
            </div>
            {/* Render child nodes if available */}
            {account.nodes && account.nodes.length > 0 && (
            <div style={{ marginLeft: '10px' }}>
                {account.nodes.map((childAccount, index) => (
                    <AccountNode
                        key={childAccount._id}
                        account={childAccount}
                        isLast={index === account.nodes.length - 1} // Mark the last child node
                        depth={depth + 1} // Increase depth for nested children
                        callback={callback}
                    />
                ))}
            </div>
            )}
        </div>
    );
};
  
const Tree = ({ accounts, callback }) => {

    return (
        <div>
            {
                accounts.map((rootAccount, index) => 
                <div key={index}>
                    <AccountNode callback={callback} key={rootAccount._id} account={rootAccount} depth={0} />
                    <div className='h-[25px]'></div>
                </div>
            )}
        </div>
    );
};

function AccountsTree({ editAccount=()=>{} }) {

    const [treeData, setTreeData] = useState([]);
    
    useEffect(()=>{
        fetchTree();
    }, []);
    async function fetchTree(){
        const response = await axios.get('/reports/tree', { withCredentials: true });
        setTreeData(response.data);
    }
    return <Tree accounts={treeData} callback={editAccount} />;
}

export default AccountsTree;