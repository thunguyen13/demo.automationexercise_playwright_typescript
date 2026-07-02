import { requiredFields } from "@pages/SignUpInformationPage";
import { UserInfo } from '@services/AuthService';
import { buildUserData, generateUniqueEmailAndName } from "@utils/dataHelpers";
import { generateUniqueNumberString } from "@utils/helpers";

type Case = {
  name: string;
  screen: number;
  expectedFieldError: keyof UserInfo | "";
  errorMessage: string;
  data: Partial<UserInfo>;
};

const randomString = generateUniqueNumberString(100, 999, true);

export const validAccInfo: UserInfo = {
  email: `testUser_${randomString}@demo.abc`,
  password: "123456",
  name: `Test User - ${randomString}`,
  title: "Mr",
  birth_date: "1",
  birth_month: "January",
  birth_year: "1990",
  firstname: "Test",
  lastname: "User",
  company: "Test Company",
  address1: "123 Test Street",
  address2: "Suite 100",
  country: "Canada",
  zipcode: "12345",
  state: "Test State",
  city: "Test City",
  mobile_number: "0912345678",
  newsLetter: true,
  offers: true,
};

export const invalidRegisterData_misingFieldData: Array<Case> = [
  {
    name: "Email field is empty",
    screen: 1,
    expectedFieldError: "email",
    errorMessage: "",
    data: buildUserData(validAccInfo, { deleteFields: ["email"] }),
  },
  {
    name: "Name field is empty",
    screen: 1,
    expectedFieldError: "name",
    errorMessage: "",
    data: buildUserData(validAccInfo, { deleteFields: ["name"] }),
  },
  ...requiredFields
  .filter(field => field !== "email" && field !== "name" && field !== "country")
  .map(field => {
    return {
      name: `Missing required field: ${field}`,
      screen: 2,
      expectedFieldError: field,
      errorMessage: "",
      data: buildUserData(validAccInfo, { overrides: generateUniqueEmailAndName(), deleteFields: [field] }),
    };
  }),
];

export const invalidRegisterData_invalidFormatField: Array<Case> = [
  {
    name: "Password less than 6 characters",
    screen: 2,
    expectedFieldError: "password",
    errorMessage: "Password must be at least 6 characters!",
    data: buildUserData(validAccInfo, { overrides: { ...generateUniqueEmailAndName(), password: "123" } }),
  },
  {
    name: "Password more than 20 characters",
    screen: 2,
    expectedFieldError: "password",
    errorMessage: "Password must be at most 20 characters!",
    data: buildUserData(validAccInfo, { overrides: { ...generateUniqueEmailAndName(), password: "1".repeat(21) } }),
  },
  {
    name: "Invalid mobile number format",
    screen: 2,
    expectedFieldError: "mobile_number",
    errorMessage: "Mobile number is not valid!",
    data: buildUserData(validAccInfo, { overrides: { ...generateUniqueEmailAndName(), mobile_number: "invalidNumber" } }),
  },
  {
    name: "Invalid zip code format",
    screen: 2,
    expectedFieldError: "zipcode",
    errorMessage: "Zip code is not valid!",
    data: buildUserData(validAccInfo, { overrides: { ...generateUniqueEmailAndName(), zipcode: "12345!" } }),
  }
]

export const invalidRegisterData_duplicateEmail: Case = {
  name: "Email already exist",
  screen: 1,
  expectedFieldError: "",
  errorMessage: "Email Address already exist!",
  data: buildUserData(validAccInfo, { overrides: generateUniqueEmailAndName() }),
}

