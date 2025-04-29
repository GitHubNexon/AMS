import React from "react";
import { FaX } from "react-icons/fa6";

function Modal({ children, title = "", show, closeCallback }) {

  return (
    <div
      className={`
                transition duration-500
                fixed inset-0 z-50 modal
                flex items-center justify-center
                ${show ? "opacity-100 visible" : "opacity-0 invisible"}
            `}
    >
      <div className="bg-white rounded min-h-[200px] min-w-[200px] flex flex-col m-5">
        <div className="flex p-2">
          <span>{title}</span>
          <button type='button' onClick={() => closeCallback()} className="ml-auto">
            <FaX />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
