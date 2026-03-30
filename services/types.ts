export interface LoginCredentials {
  userCode: string;
  password: string;
}

export interface LoginResponse {
  success: string;
  err: number;
  msg: string;
  firstName: string;
  lastName: string;
  admin: boolean;
  email: string | null;
  uid: number;
  code: string;
  special: string | null;
  password: string;
  token: string;
  ticket: string;
  company: string;
  companyPassword: string;
  companyName: string;
  picture: string;
  version: string;
  employeeId: number;
  resourceId: number;
  agent: boolean;
  dept: {
    id: number;
    code: string;
    name: string;
  };
  wh: {
    id: number;
    code: string;
    name: string;
  };
  ca: {
    id: number;
    code: string;
    name: string;
  };
  contact: {
    id: number;
    name: string;
    email: string;
  };
  privs: {
    logical: number;
    module: number;
    item: number;
    subitem: number;
    privilege: number;
  }[];
  decs: {
    pDecs: string;
    fpDecs: string;
    aDecs: string;
    faDecs: string;
    rDecs: string;
    frDecs: string;
    qDecs: string;
    vDecs: string;
    rrDecs: string;
  };
  menu: any[];
  app: Record<string, any>;
}

export interface CurrentAccount {
  CurrentAccountCode: string;
  CurrentAccountName: string;
}

export interface RunJsonServiceResponse<T> {
  success: string;
  err: number;
  msg: string;
  ticket: string;
  version: string;
  data: T;
}

export interface AccountsData {
  items: CurrentAccount[];
}

export interface InventoryItem {
  InventoryCode: string;
  InventoryName: string;
  Thumbnail: string;
}

export interface KoliItem {
  id: number;
  PackageNo: string;
  Explanation: string;
  ReceiptNo?: string;
  SipExp?: string;
}

export interface KoliDetailItem {
  InventoryName: string;
  Quantity: number;
  Thumbnail?: string | null;
}

export interface OrderReceipt {
  RecId: number;
  ReceiptNo: string;
  CurrentAccountName: string;
}


export interface BarcodeForm {
  Name: string;
  Description?: string;
}