import Swal from "sweetalert2";

const showDialog = {
  confirm: async (message) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      html: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, proceed!",
      cancelButtonText: "No, cancel!",
    });
    return result.isConfirmed;
  },

  showMessage: (message, type) => {
    Swal.fire({
      icon: type,
      title: type === "success" ? "Success!" : "Oops!",
      text: message,
    });
  },
};

export default showDialog;
