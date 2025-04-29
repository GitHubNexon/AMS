import React, { useContext, useEffect, useRef, useState } from 'react';
import { FileHandlerContext } from '../context/FileHandlerContext';
import Modal from './Modal';
import { showToast } from '../utils/toastNotifications';
import { FaX } from 'react-icons/fa6';
import { PiFilesLight } from "react-icons/pi";

function FileHandler() {

    const {files, setFiles, insertFiles, downloadFile, filesToUpload, setFilesToUpload, removeFile, fileInput} = useContext(FileHandlerContext);

    const [modal, setModal] = useState(false);

    function inputClick(){
        setModal(true);
    }

    function handleFileChange(e){
        const files = Array.from(e.target.files);
        const validTypes = [
            'application/pdf', 
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  
            'image/jpeg', 
            'image/png', 
            'image/gif',
            'text/plain',
        ];
        const maxSize = 15 * 1024 * 1024;
        const validFiles = files.filter((file) => {
            if (file.size > maxSize) {
                showToast(`${file.name} exceeds the 15MB limit.`, 'warning');
                fileInput.current.value = '';
                return false;
            }
            if (!validTypes.includes(file.type)) {
                showToast(`${file.name} is not a supported file type.`, 'warning');
                fileInput.current.value = '';
                return false;
            }
            return true;
        });
        if (validFiles.length) {
            console.log('Valid files:', validFiles);
            setFilesToUpload(validFiles);
            // to be uploaded on save
        }
    }

    return (
        <>
        <div className='flex items-center border p-1 rounded cursor-pointer'   onClick={inputClick} >
            <input 
                type="text" 
                className='flex-1 mr-1' 
                value={files.length + filesToUpload.length === 0 ? '' : `${+files.length + +filesToUpload.length} files attached`} 
                placeholder='Attach files' 
                readOnly />
            <PiFilesLight className='text-[1.5em]' />
        </div>
        <Modal show={modal} closeCallback={()=>setModal(false)} title='File attachments' >
            <div className='border-t border-b flex-1'>
                <div className='px-4 py-2'>
                    <input 
                        type="file" 
                        className='border-b mr-2' 
                        onChange={handleFileChange} 
                        ref={fileInput} 
                        accept=".pdf,.xls,.xlsx,.doc,.docx,.jpeg,.jpg,.png,.gif,.txt"
                        multiple />
                    {/* should only appear on update mode */}
                </div>
                <div className='p-4 h-[50vh] overflow-y-scroll'>
                    <ul>
                        {
                            files.map((item, index)=>
                                <li key={index}>
                                    <button type='button' className='mb-1 underline text-blue-500 mr-2' onClick={()=>downloadFile(item)} >{item.fileName}</button>
                                    <button type='button' className='text-red-500' onClick={()=>removeFile(item, index, 'files')} ><FaX /></button>
                                </li>
                            )
                        }
                        {
                            filesToUpload.map((item, index)=>
                                <li key={index}>
                                    <button type='button' className='mb-1 underline text-blue-500 mr-2'>{item.name}</button>
                                    <button type='button' className='text-red-500' onClick={()=>removeFile('', index, 'toupload')} ><FaX /></button>
                                </li>
                            )
                        }
                    </ul>
                </div>
            </div>
            <div className='p-2'></div>
        </Modal>
        </>
    );
}

export default FileHandler;0