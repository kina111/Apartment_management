const statusMessages = {
  400: "Yêu cầu không hợp lệ",
  401: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại",
  403: "Bạn không có quyền thực hiện thao tác này",
  404: "Không tìm thấy dữ liệu",
  409: "Dữ liệu đang bị xung đột hoặc đã tồn tại",
  413: "Dữ liệu tải lên quá lớn",
  415: "Định dạng dữ liệu không được hỗ trợ",
  422: "Dữ liệu không hợp lệ",
  429: "Bạn thao tác quá nhanh. Vui lòng thử lại sau",
  500: "Máy chủ đang gặp lỗi. Vui lòng thử lại sau",
  502: "Không thể kết nối máy chủ",
  503: "Dịch vụ tạm thời không khả dụng",
  504: "Máy chủ phản hồi quá lâu",
};

function firstStringValue(value) {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return value.map(firstStringValue).find(Boolean) || "";
  }

  if (typeof value === "object") {
    return Object.values(value).map(firstStringValue).find(Boolean) || "";
  }

  return "";
}

export function getErrorMessage(error, fallback = "Đã xảy ra lỗi. Vui lòng thử lại") {
  const data = error?.response?.data;
  const status = error?.response?.status;

  if (typeof data === "string" && data.trim()) return data;

  const serverMessage =
    data?.message ||
    data?.reason ||
    data?.detail ||
    data?.title ||
    data?.error ||
    firstStringValue(data?.errors) ||
    firstStringValue(data?.fieldErrors) ||
    firstStringValue(data?.violations);

  if (serverMessage) return serverMessage;

  if (error?.code === "ECONNABORTED") return "Yêu cầu phản hồi quá lâu. Vui lòng thử lại";
  if (error?.message === "Network Error") return "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng";

  return statusMessages[status] || fallback;
}
