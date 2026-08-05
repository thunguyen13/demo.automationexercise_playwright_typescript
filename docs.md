# API
## Product
### Get all products
1. Success: Get
2. Failure: Unsupported methods
### Get all brands
1. Success: Get
2. Failure: Unsupported methods
### Search products
1. Success: has param and keyword has:
    a. blank space
    b. upper case
    c. matching - normal word
2. Failure:
    a. has no param
    b. has param and keyword has:
        - multiple blank space
        - no matching - normal word
    c. unsupported methods
## Login
1. Success: with valid registered account
2. Failure:
    a. lack of field
        - email
        - password
    b. wrong data
        - no exist email
        - exist email + wrong password
        - invalid email
            + blank
            + lack of username/domain    => case not mentioned in docs => assumption result is in Not Found case
    c. unsupported methods
        - get
        - put
        - delete
## Register
1. Success: 
    a. has valid + required data + no optional data: [required: email, password, name, lastname, firstname, city, address1, country, state, zipcode, mobile_number]
    b. has valid + full data
    c. has valid + required data + some optional data: [required: email, password, name, lastname, firstname, city, address1, country, state, zipcode, mobile_number, (title, birth, company, address2)]
2. Failure:
    a. Lack of required data
        - email
        - password
        - name
        - lastname
        - firstname
        - city
        - address1
        - country
        - state
        - zipcode
        - mobile_number
    b. Invalid format
        - email [spaces, lack of domain, lack of username]    => not mentioned => assumption result is 400 + "Bad request. Invalid email."
        - mobile number      => not mentioned => assumption result is 400 + "Bad request. Invalid mobile number."
        - zipcode   => not mentioned => assumption result is 400 + "Bad request. Invalid zipcode."
        - password [too short, too long]      => not mentioned => assumption result is 400 + "Bad request. Invalid password."
    c. Duplicate email      => Error: "Email already exists!"
    d. unsupported method   => not mentioned => assumption result is status code be 405
        - get
        - put
        - delete
## Delete
1. Success: Correct email + password
2. Failure:
    a. lack of field:
        - email
        - password
    b. wrong data:
        - no exist email
        - exist email + wrong password
        - invalid email
            + blank
            + lack of username/domain
    c. unsupported method   => not mentioned => assumption result is status code be 405
        - get
        - post
        - put
## Update
1. Success: correct email + password
    a. valid data in required field (check valid data)
        - mobile number
        - zipcode
    b. data in other field 
        - required (no check valid data)
        - optional
2. Failure:
    a. lack of email + password field
        - email
        - password
    b. wrong data email + password
        - no exist email
        - exist email + wrong password
        - invalid email [lack of username/domain]
    c. invalid data in required field (check valid data)
        - mobile number      => not mentioned => assumption result is 400 + "Bad request. Invalid mobile number."
        - zipcode   => not mentioned => assumption result is 400 + "Bad request. Invalid zipcode."
## Get
1. Success: Exist email     => User Detail is assumpted has the same type as User Info but has adding id field, no password field
2. Failure:
    a. No exist email
    b. Invalid email
        - blank
        - lack of username/domain   => assumption check email format by front end => result Not Found
    c. Unsupported method
        - post
        - put
        - delete 
##  Note:
1. in get/delete/verify api: case field = "" following behaviour of server -> not return Bad request response
2. in register api: assumption case field = "" for required fields will return Bad request response
3. Assumption: email must use a public domain (e.g., user@example.com).