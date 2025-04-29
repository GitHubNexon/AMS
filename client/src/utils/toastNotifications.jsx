// toastNotifications.js
import { toast } from 'react-toastify';

export const showToast = (message, type = 'error') => {
  toast(message, {
    type,
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });
};
