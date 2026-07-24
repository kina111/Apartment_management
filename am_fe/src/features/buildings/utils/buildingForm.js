export const initialBuildingForm = {
    name: "",
    address: "",
    numberOfFloor: "",
};

export const initialBuildingEditForm = {
    ...initialBuildingForm,
    description: "",
};

export const initialBankAccountForm = {
    bankName: "",
    accountNumber: "",
    userName: "",
};

export function toFormValue(value) {
    return value ?? "";
}

export function mapBuildingToEditForm(building) {
    return {
        name: toFormValue(building.name),
        address: toFormValue(building.address),
        numberOfFloor: toFormValue(building.numberOfFloor),
        description: toFormValue(building.description),
    };
}

export function mapBankAccountToForm(bankAccount) {
    return {
        bankName: toFormValue(bankAccount?.bankName),
        accountNumber: toFormValue(bankAccount?.accountNumber),
        userName: toFormValue(bankAccount?.userName),
    };
}

export function validateBuilding(building) {
    const errors = {};

    if (!building.name.trim()) errors.name = "Tên toà nhà là bắt buộc";
    if (!building.address.trim()) errors.address = "Địa chỉ là bắt buộc";

    const floor = Number(building.numberOfFloor);
    if (!building.numberOfFloor) {
        errors.numberOfFloor = "Số tầng là bắt buộc";
    } else if (!Number.isInteger(floor) || floor <= 0 || floor > 50) {
        errors.numberOfFloor = "Số tầng phải là số nguyên từ 1 đến 50";
    }

    return errors;
}

export function validateBankAccount(bankAccount) {
    const errors = {};

    if (!bankAccount.bankName.trim()) errors.bankName = "Tên ngân hàng là bắt buộc";

    if (!bankAccount.accountNumber.trim()) {
        errors.accountNumber = "Số tài khoản là bắt buộc";
    } else if (!/^\d{6,30}$/.test(bankAccount.accountNumber.trim())) {
        errors.accountNumber = "Số tài khoản phải gồm 6-30 chữ số";
    }

    if (!bankAccount.userName.trim()) errors.userName = "Tên chủ tài khoản là bắt buộc";

    return errors;
}
