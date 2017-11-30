const URL = window.URL || window.webkitURL;

export const createObjectURL = window.createObjectURL || URL.createObjectURL.bind(URL);

export const revokeObjectURL = window.revokeObjectURL || URL.revokeObjectURL.bind(URL);
