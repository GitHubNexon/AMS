import axios from "axios";
import React, { createContext, useState, useRef } from "react";

export const FileHandlerContext = createContext();

function FileHandlerProvider({ children }){

    // holds the current files on the current entry
    const [files, setFiles] = useState([]);
    // holds new files to upload
    const [filesToUpload, setFilesToUpload] = useState([]);

    const fileInput = useRef();

    async function insertFiles(id){ 
        if(filesToUpload.length > 0){
            const formData = new FormData();
            for(let i = 0; i < filesToUpload.length; i++){
                formData.append('files', filesToUpload[i]);
            }
            try{
                const response = await axios.post(`/files/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                });
                console.log("inserting files", response)
            }catch(error){
                console.error(error);
            }
        }
    }

    async function removeFile(item, file, from){
        if(from === "toupload"){
            // will just remove from array and input (file is not in server yet)
            const up = [...filesToUpload];
            up.splice(file, 1);
            setFilesToUpload(up);
            const files = fileInput.current.files;
            const fileArray = Array.from(files);
            const updatedFiles = fileArray.filter((_, index)=>index !== file);
            const dataTransfer = new DataTransfer();
            updatedFiles.forEach((file)=>dataTransfer.items.add(file))
            fileInput.current.files = dataTransfer.files;
        }
        if(from === 'files'){
            const up = [...files];
            up.splice(file, 1);
            setFiles(up);
            await axios.post('/files', {
                id: item.entryId,
                file: item.fileName

            }, { withCredentials: true });
        }
    }

    async function getFiles(id){
        // setFiles([]);
        setFilesToUpload([]);
        if(!id) return;
        const response = await axios.get(`/files/${id}`, {withCredentials: true});
        setFiles(response.data);
    }

    async function downloadFile(item){
        const response = await axios.post(`/files/download/file`, {
            id: item.entryId,
            file: item.fileName
        }, { responseType: 'blob', withCredentials: true });
        // Create a URL for the blob file
        const fileBlob = new Blob([response.data]);

        // Create a link element for triggering the download
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(fileBlob);
        link.href = url;
        link.setAttribute('download', item.fileName); // Use the file's original name

        // Append the link and simulate a click to start downloading
        document.body.appendChild(link);
        link.click();

        // Clean up the URL object to release memory
        window.URL.revokeObjectURL(url);
    }

    return (
        <FileHandlerContext.Provider value={{
            files, setFiles,
            filesToUpload, setFilesToUpload,
            insertFiles,
            removeFile,
            getFiles,
            downloadFile,
            fileInput
        }}>
            { children }
        </FileHandlerContext.Provider>
    );
}

export default FileHandlerProvider;